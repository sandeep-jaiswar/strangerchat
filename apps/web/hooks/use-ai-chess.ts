"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import {
  DEFAULT_TIME_CONTROL,
  getTimeControl,
  type ChessColor,
  type ChessEndReason,
  type ChessOffer,
  type ChessResult,
  type TimeControlId,
} from "@repo/protocol";
import type { ChessView } from "./use-stranger-chat";
import { captureEvent } from "@/lib/analytics";
import { BOT_LEVELS, type BotDifficulty, StockfishClient } from "@/lib/stockfish";

export interface AiGameState {
  difficulty: BotDifficulty;
  game: ChessView;
}

function buildInitialView(
  color: ChessColor,
  timeControl: TimeControlId,
): ChessView {
  const spec = getTimeControl(timeControl);
  return {
    id: `ai-${crypto.randomUUID()}`,
    color,
    timeControl: spec.id,
    moves: [],
    fen: new Chess().fen(),
    lastMove: null,
    clock: {
      white: spec.initialMs,
      black: spec.initialMs,
      running: false,
      firstMoveMs: null,
    },
    clockAt: Date.now(),
    status: "playing",
    result: null,
    reason: null,
    offers: { draw: null, rematch: null },
  };
}

function outcomeOf(chess: Chess): {
  result: ChessResult | null;
  reason: ChessEndReason | null;
} {
  if (chess.isCheckmate()) {
    return {
      result: chess.turn() === "w" ? "0-1" : "1-0",
      reason: "checkmate",
    };
  }
  if (chess.isStalemate()) return { result: "1/2-1/2", reason: "stalemate" };
  if (chess.isInsufficientMaterial()) {
    return { result: "1/2-1/2", reason: "insufficient_material" };
  }
  if (chess.isThreefoldRepetition()) {
    return { result: "1/2-1/2", reason: "threefold_repetition" };
  }
  if (chess.isDrawByFiftyMoves()) {
    return { result: "1/2-1/2", reason: "fifty_moves" };
  }
  return { result: null, reason: null };
}

/** Runs an unrated client-side Stockfish WASM game using the shared ChessPanel contract. */
export function useAiChessGame() {
  const [ai, setAi] = useState<AiGameState | null>(null);
  const engineRef = useRef<StockfishClient | null>(null);
  const thinkingGameId = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  const getEngine = useCallback(() => {
    engineRef.current ??= new StockfishClient();
    return engineRef.current;
  }, []);

  const startAiGame = useCallback(
    (
      difficulty: BotDifficulty = "club",
      timeControl: TimeControlId = DEFAULT_TIME_CONTROL,
      color?: ChessColor,
    ) => {
      const pickedColor: ChessColor =
        color ?? (Math.random() < 0.5 ? "white" : "black");
      setAi({
        difficulty,
        game: buildInitialView(pickedColor, timeControl),
      });
      captureEvent("ai_game_started", {
        difficulty,
        rating: BOT_LEVELS[difficulty].rating,
        time_control: timeControl,
      });
    },
    [],
  );

  const stopAiGame = useCallback(() => {
    thinkingGameId.current = null;
    setAi(null);
  }, []);

  const applyMove = useCallback(
    (from: string, to: string, promotion?: string, isBot = false) => {
      let played = false;
      setAi((prev) => {
        if (!prev || prev.game.status !== "playing") return prev;
        const g = prev.game;
        const chess = new Chess(g.fen);
        const turnColor: ChessColor = chess.turn() === "w" ? "white" : "black";
        if (!isBot && turnColor !== g.color) return prev;
        if (isBot && turnColor === g.color) return prev;

        let move;
        try {
          move = chess.move({ from, to, promotion });
        } catch {
          return prev;
        }

        const spec = getTimeControl(g.timeControl);
        const now = Date.now();
        const elapsed = g.clock.running ? Math.max(0, now - g.clockAt) : 0;
        const nextWhite =
          turnColor === "white" && g.clock.running
            ? Math.max(0, g.clock.white - elapsed) + spec.incrementMs
            : g.clock.white;
        const nextBlack =
          turnColor === "black" && g.clock.running
            ? Math.max(0, g.clock.black - elapsed) + spec.incrementMs
            : g.clock.black;
        const over = outcomeOf(chess);
        const nextMoves = [...g.moves, move.san];

        played = true;
        return {
          ...prev,
          game: {
            ...g,
            fen: chess.fen(),
            moves: nextMoves,
            lastMove: { from: move.from, to: move.to },
            clock: {
              white: nextWhite,
              black: nextBlack,
              running: over.result === null && nextMoves.length >= 2,
              firstMoveMs: null,
            },
            clockAt: now,
            status: over.result ? "over" : "playing",
            result: over.result,
            reason: over.reason,
          },
        };
      });
      return played;
    },
    [],
  );

  useEffect(() => {
    if (!ai || ai.game.status !== "playing") return;
    const chess = new Chess(ai.game.fen);
    const turnColor: ChessColor = chess.turn() === "w" ? "white" : "black";
    if (turnColor === ai.game.color) return;

    const currentGameId = ai.game.id;
    const key = `${currentGameId}:${ai.game.moves.length}`;
    if (thinkingGameId.current === key) return;
    thinkingGameId.current = key;

    let cancelled = false;
    void (async () => {
      try {
        const uci = await getEngine().bestMove(ai.game.fen, ai.difficulty);
        if (cancelled || !uci) return;
        applyMove(uci.slice(0, 2), uci.slice(2, 4), uci.slice(4) || undefined, true);
      } catch {
        // Fallback if WebAssembly fails in a constrained environment: pick random legal move.
        if (cancelled) return;
        const moves = chess.moves({ verbose: true });
        const pick = moves[Math.floor(Math.random() * moves.length)];
        if (pick) applyMove(pick.from, pick.to, pick.promotion, true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ai, applyMove, getEngine]);

  const resignAiGame = useCallback(() => {
    setAi((prev) => {
      if (!prev || prev.game.status !== "playing") return prev;
      const g = prev.game;
      const aborted = g.moves.length < 2;
      return {
        ...prev,
        game: {
          ...g,
          status: "over",
          result: aborted ? "aborted" : g.color === "white" ? "0-1" : "1-0",
          reason: aborted ? "aborted" : "resignation",
          clock: { ...g.clock, running: false, firstMoveMs: null },
          clockAt: Date.now(),
        },
      };
    });
  }, []);

  const offerAi = useCallback((offer: ChessOffer) => {
    if (offer === "rematch") {
      setAi((prev) => {
        if (!prev) return prev;
        const nextColor: ChessColor =
          prev.game.color === "white" ? "black" : "white";
        return {
          ...prev,
          game: buildInitialView(
            nextColor,
            prev.game.timeControl ?? DEFAULT_TIME_CONTROL,
          ),
        };
      });
    }
  }, []);

  const flagAiGame = useCallback(() => {
    setAi((prev) => {
      if (!prev || prev.game.status !== "playing") return prev;
      const g = prev.game;
      const chess = new Chess(g.fen);
      const turn: ChessColor = chess.turn() === "w" ? "white" : "black";
      return {
        ...prev,
        game: {
          ...g,
          status: "over",
          result: turn === "white" ? "0-1" : "1-0",
          reason: "timeout",
          clock: { ...g.clock, [turn]: 0, running: false, firstMoveMs: null },
          clockAt: Date.now(),
        },
      };
    });
  }, []);

  return {
    ai,
    startAiGame,
    stopAiGame,
    playAiMove: (from: string, to: string, promotion?: string) =>
      applyMove(from, to, promotion, false),
    resignAiGame,
    offerAi,
    flagAiGame,
  };
}
