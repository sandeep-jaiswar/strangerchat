"use client";

import { type CSSProperties, useMemo, useState } from "react";
import { Chess, type Square } from "chess.js";
import { ArrowRight, CheckCircle2, RotateCcw } from "lucide-react";
import { Chessboard } from "react-chessboard";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { captureEvent } from "@/lib/analytics";

export interface ChessPuzzle {
  id: string;
  title: string;
  theme: string;
  rating: number;
  fen: string;
  /** Winning SAN move sequence starting from the side to move in `fen`. */
  solution: string[];
}

const PUZZLES: ChessPuzzle[] = [
  {
    id: "back-rank-1",
    title: "Back-Rank Weakness",
    theme: "Mate in 1",
    rating: 900,
    fen: "6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1",
    solution: ["Ra8#"],
  },
  {
    id: "smothered-1",
    title: "Smothered Knight",
    theme: "Mate in 1",
    rating: 1100,
    fen: "6rk/6pp/7N/8/8/8/8/6K1 w - - 0 1",
    solution: ["Nf7#"],
  },
  {
    id: "f7-strike",
    title: "Target f7",
    theme: "Mate in 1",
    rating: 850,
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
    solution: ["Qxf7#"],
  },
  {
    id: "arabian-mate",
    title: "Arabian Mate",
    theme: "Mate in 1",
    rating: 1150,
    fen: "7k/5N2/6K1/8/8/8/8/R7 w - - 0 1",
    solution: ["Ra8#"],
  },
  {
    id: "fork-queen",
    title: "Royal Knight Fork",
    theme: "Winning Fork",
    rating: 1200,
    fen: "4k3/8/3q4/8/4N3/8/8/4K3 w - - 0 1",
    solution: ["Nxd6+"],
  },
  {
    id: "anastasia-mate",
    title: "Corner Trap",
    theme: "Mate in 1",
    rating: 1250,
    fen: "7k/4N1pp/8/8/8/8/8/R5K1 w - - 0 1",
    solution: ["Ra8#"],
  },
];

export function PuzzleTrainer() {
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"playing" | "wrong" | "solved">("playing");
  const [solvedIds, setSolvedIds] = useState<string[]>([]);
  const [selected, setSelected] = useState<Square | null>(null);

  const puzzle = PUZZLES[index]!;
  const chess = useMemo(() => {
    const c = new Chess(puzzle.fen);
    for (let i = 0; i < step; i++) {
      const move = puzzle.solution[i];
      if (move) c.move(move);
    }
    return c;
  }, [puzzle, step]);

  const side = useMemo(() => new Chess(puzzle.fen).turn() === "w" ? "white" : "black", [puzzle.fen]);
  const myTurnColor = side === "white" ? "w" : "b";

  const tryMove = (from: Square, to: Square) => {
    if (status === "solved") return false;
    const probe = new Chess(chess.fen());
    let played: { san: string } | null = null;
    try {
      played = probe.move({ from, to, promotion: "q" });
    } catch {
      return false;
    }
    if (!played) return false;
    setSelected(null);
    const expected = puzzle.solution[step];
    if (played.san !== expected) {
      setStatus("wrong");
      return false;
    }
    const nextStep = step + 1;
    if (nextStep >= puzzle.solution.length) {
      setStep(nextStep);
      setStatus("solved");
      setSolvedIds((prev) =>
        prev.includes(puzzle.id) ? prev : [...prev, puzzle.id],
      );
      captureEvent("puzzle_solved", {
        puzzle_id: puzzle.id,
        theme: puzzle.theme,
        rating: puzzle.rating,
      });
    } else {
      setStep(nextStep + 1);
      setStatus("playing");
    }
    return true;
  };

  const onDrop = ({
    sourceSquare,
    targetSquare,
  }: {
    sourceSquare: string;
    targetSquare: string | null;
  }) => {
    if (!targetSquare) return false;
    return tryMove(sourceSquare as Square, targetSquare as Square);
  };

  const squareStyles: Record<string, CSSProperties> = {};
  if (selected) squareStyles[selected] = { backgroundColor: "rgba(250, 204, 21, 0.55)" };

  const selectPuzzle = (nextIndex: number) => {
    setIndex(nextIndex);
    setStep(0);
    setStatus("playing");
    setSelected(null);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_1fr]">
      <div className="space-y-3">
        <div className="aspect-square w-full overflow-hidden rounded-xl border shadow-sm">
          <Chessboard
            options={{
              id: `puzzle-${puzzle.id}`,
              position: chess.fen(),
              boardOrientation: side,
              squareStyles,
              darkSquareStyle: { backgroundColor: "#7c94b4" },
              lightSquareStyle: { backgroundColor: "#e6ebf2" },
              allowDragging: status !== "solved",
              onPieceDrop: onDrop,
              onSquareClick: ({ square }) => {
                if (status === "solved") return;
                const sq = square as Square;
                if (selected && selected !== sq && tryMove(selected, sq)) return;
                const piece = chess.get(sq);
                setSelected(piece?.color === myTurnColor && sq !== selected ? sq : null);
              },
            }}
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium">
            {status === "solved" ? (
              <span className="inline-flex items-center gap-1.5 text-success">
                <CheckCircle2 className="size-4" />
                Solved! ({puzzle.solution.join(" ")})
              </span>
            ) : status === "wrong" ? (
              <span className="text-destructive">
                Not the best move — try another square.
              </span>
            ) : (
              <span>{side === "white" ? "White" : "Black"} to move</span>
            )}
          </p>
          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => selectPuzzle(index)}
            >
              <RotateCcw className="size-3.5" />
              Reset
            </Button>
            <Button
              size="sm"
              onClick={() => selectPuzzle((index + 1) % PUZZLES.length)}
            >
              Next
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">{puzzle.title}</h2>
            <Badge variant="secondary">
              {puzzle.theme} · ~{puzzle.rating}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Drag a piece on the board to find the winning move. Solved{" "}
            {solvedIds.length} of {PUZZLES.length} puzzles in this session.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PUZZLES.map((item, i) => {
            const done = solvedIds.includes(item.id);
            const active = i === index;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectPuzzle(i)}
                className={`rounded-lg border p-3 text-left text-xs transition-colors ${
                  active
                    ? "border-primary bg-primary/10"
                    : "bg-card hover:bg-accent"
                }`}
              >
                <div className="flex items-center justify-between font-medium">
                  <span>#{i + 1}</span>
                  {done && <CheckCircle2 className="size-3.5 text-success" />}
                </div>
                <p className="mt-1 truncate text-muted-foreground">
                  {item.title}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
