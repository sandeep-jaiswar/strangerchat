import { Chess } from "chess.js";

export type BotDifficulty = "casual" | "club" | "master";

export const BOT_LEVELS: Record<
  BotDifficulty,
  { label: string; rating: number; skill: number; depth: number; moveTimeMs: number }
> = {
  casual: { label: "Casual Bot (~900)", rating: 900, skill: 2, depth: 4, moveTimeMs: 250 },
  club: { label: "Club Bot (~1300)", rating: 1300, skill: 8, depth: 8, moveTimeMs: 450 },
  master: { label: "Master Bot (~1700)", rating: 1700, skill: 16, depth: 12, moveTimeMs: 700 },
};

export interface PositionEval {
  /** Centipawns from White's perspective (+ = White better). Clamped for mates. */
  cpWhite: number;
  mateWhite: number | null;
  bestMoveUci: string | null;
}

export type MoveTag = "best" | "good" | "inaccuracy" | "mistake" | "blunder";

export interface AnalyzedMove {
  ply: number;
  san: string;
  cpAfterWhite: number;
  mateAfterWhite: number | null;
  bestMoveSan: string | null;
  cpLoss: number;
  tag: MoveTag;
}

/**
 * Lightweight browser Stockfish WASM worker client (single-threaded, zero server CPU).
 * Serializes commands so concurrent callers never interleave UCI output.
 */
export class StockfishClient {
  private worker: Worker | null = null;
  private readyPromise: Promise<void> | null = null;
  private queue: Promise<unknown> = Promise.resolve();
  private listeners = new Set<(line: string) => void>();
  private disposed = false;
  private pending = new Set<(reason: Error) => void>();

  private ensureReady(): Promise<void> {
    if (this.disposed) return Promise.reject(new Error("Stockfish disposed"));
    if (typeof Worker === "undefined") {
      return Promise.reject(new Error("Web Workers unavailable"));
    }
    if (this.readyPromise) return this.readyPromise;

    this.readyPromise = new Promise<void>((resolve, reject) => {
      this.pending.add(reject);
      try {
        const worker = new Worker("/stockfish/stockfish-19-lite-single.js");
        this.worker = worker;
        worker.onmessage = (e: MessageEvent<unknown>) => {
          const text = typeof e.data === "string" ? e.data : String(e.data ?? "");
          for (const line of text.split(/\r?\n/)) {
            if (line) {
              for (const fn of this.listeners) fn(line);
            }
          }
        };
        worker.onerror = (err) => {
          reject(new Error(err.message || "Stockfish worker failed"));
        };

        let uciOk = false;
        const onLine = (line: string) => {
          if (line === "uciok" && !uciOk) {
            uciOk = true;
            worker.postMessage("isready");
          } else if (line === "readyok") {
            this.listeners.delete(onLine);
            this.pending.delete(reject);
            resolve();
          }
        };
        this.listeners.add(onLine);
        worker.postMessage("uci");
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    });

    return this.readyPromise;
  }

  private runSerialized<T>(task: (worker: Worker) => Promise<T>): Promise<T> {
    const next = this.queue.then(async () => {
      await this.ensureReady();
      if (!this.worker || this.disposed) {
        throw new Error("Stockfish unavailable");
      }
      return task(this.worker);
    });
    this.queue = next.catch(() => undefined);
    return next;
  }

  async bestMove(fen: string, difficulty: BotDifficulty): Promise<string | null> {
    const spec = BOT_LEVELS[difficulty];
    return this.runSerialized(
      (worker) =>
        new Promise<string | null>((resolve, reject) => {
          this.pending.add(reject);
          const onLine = (line: string) => {
            if (line.startsWith("bestmove ")) {
              this.listeners.delete(onLine);
              const token = line.split(/\s+/)[1];
              this.pending.delete(reject);
              resolve(token && token !== "(none)" ? token : null);
            }
          };
          this.listeners.add(onLine);
          worker.postMessage(`setoption name Skill Level value ${spec.skill}`);
          worker.postMessage(`position fen ${fen}`);
          worker.postMessage(
            `go depth ${spec.depth} movetime ${spec.moveTimeMs}`,
          );
        }),
    );
  }

  async evaluatePosition(fen: string, depth = 10): Promise<PositionEval> {
    const sideToMove = fen.split(" ")[1] === "b" ? -1 : 1;
    return this.runSerialized(
      (worker) =>
        new Promise<PositionEval>((resolve, reject) => {
          this.pending.add(reject);
          let cpWhite = 0;
          let mateWhite: number | null = null;
          let bestMoveUci: string | null = null;

          const onLine = (line: string) => {
            if (line.startsWith("info ") && line.includes(" score ")) {
              const mateMatch = /\bscore mate (-?\d+)/.exec(line);
              const cpMatch = /\bscore cp (-?\d+)/.exec(line);
              if (mateMatch?.[1]) {
                const mateRel = Number(mateMatch[1]);
                mateWhite = mateRel * sideToMove;
                cpWhite = mateWhite >= 0 ? 10_000 : -10_000;
              } else if (cpMatch?.[1]) {
                mateWhite = null;
                cpWhite = Number(cpMatch[1]) * sideToMove;
              }
            } else if (line.startsWith("bestmove ")) {
              this.listeners.delete(onLine);
              const token = line.split(/\s+/)[1];
              bestMoveUci = token && token !== "(none)" ? token : null;
              this.pending.delete(reject);
              resolve({ cpWhite, mateWhite, bestMoveUci });
            }
          };
          this.listeners.add(onLine);
          worker.postMessage("setoption name Skill Level value 20");
          worker.postMessage(`position fen ${fen}`);
          worker.postMessage(`go depth ${depth} movetime 220`);
        }),
    );
  }

  dispose() {
    this.disposed = true;
    for (const reject of this.pending) reject(new Error("Stockfish disposed"));
    this.pending.clear();
    this.listeners.clear();
    this.worker?.terminate();
    this.worker = null;
    this.readyPromise = null;
  }
}

export async function analyzeGameMoves(
  moves: string[],
  onProgress?: (done: number, total: number) => void,
  signal?: AbortSignal,
): Promise<AnalyzedMove[]> {
  const client = new StockfishClient();
  const abort = () => client.dispose();
  signal?.addEventListener("abort", abort, { once: true });
  try {
    signal?.throwIfAborted();
    const chess = new Chess();
    const fens: string[] = [chess.fen()];
    for (const san of moves) {
      chess.move(san);
      fens.push(chess.fen());
    }

    const evals: PositionEval[] = [];
    for (let i = 0; i < fens.length; i++) {
      signal?.throwIfAborted();
      evals.push(await client.evaluatePosition(fens[i]!, 10));
      onProgress?.(i + 1, fens.length);
    }

    const analyzed: AnalyzedMove[] = [];
    const probe = new Chess();
    for (let ply = 1; ply <= moves.length; ply++) {
      const before = evals[ply - 1]!;
      const after = evals[ply]!;
      const whiteMoved = ply % 2 === 1;
      const loss = Math.max(
        0,
        whiteMoved
          ? before.cpWhite - after.cpWhite
          : after.cpWhite - before.cpWhite,
      );
      let bestMoveSan: string | null = null;
      if (before.bestMoveUci) {
        try {
          probe.load(fens[ply - 1]!);
          const m = probe.move({
            from: before.bestMoveUci.slice(0, 2),
            to: before.bestMoveUci.slice(2, 4),
            promotion: before.bestMoveUci.slice(4) || undefined,
          });
          bestMoveSan = m.san;
        } catch {
          bestMoveSan = null;
        }
      }
      analyzed.push({
        ply,
        san: moves[ply - 1]!,
        cpAfterWhite: after.cpWhite,
        mateAfterWhite: after.mateWhite,
        bestMoveSan,
        cpLoss: loss,
        tag: classifyLoss(loss, moves[ply - 1]! === bestMoveSan),
      });
    }
    return analyzed;
  } finally {
    signal?.removeEventListener("abort", abort);
    client.dispose();
  }
}

function classifyLoss(cpLoss: number, isBest: boolean): MoveTag {
  if (isBest || cpLoss < 25) return "best";
  if (cpLoss < 60) return "good";
  if (cpLoss < 120) return "inaccuracy";
  if (cpLoss < 250) return "mistake";
  return "blunder";
}
