"use client";

import { type CSSProperties, useMemo, useState } from "react";
import { Chess, type Square } from "chess.js";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { Chessboard } from "react-chessboard";
import type { ChessPuzzle } from "@repo/protocol";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import { playChessSound } from "./chess-sounds";

interface PuzzleBoardProps {
  puzzle: ChessPuzzle;
  compact?: boolean;
  onSolved?: (puzzle: ChessPuzzle) => void;
  onWrong?: (puzzle: ChessPuzzle) => void;
  footerAction?: React.ReactNode;
}

export function PuzzleBoard(props: PuzzleBoardProps) {
  return <PuzzleBoardInner key={props.puzzle.id} {...props} />;
}

function PuzzleBoardInner({
  puzzle,
  compact = false,
  onSolved,
  onWrong,
  footerAction,
}: PuzzleBoardProps) {
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"playing" | "wrong" | "solved">(
    "playing",
  );
  const [selected, setSelected] = useState<Square | null>(null);

  const chess = useMemo(() => {
    const c = new Chess(puzzle.fen);
    for (let i = 0; i < step; i++) {
      const move = puzzle.solution[i];
      if (move) c.move(move);
    }
    return c;
  }, [puzzle, step]);

  const side = useMemo(
    () => (new Chess(puzzle.fen).turn() === "w" ? "white" : "black"),
    [puzzle.fen],
  );
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
      playChessSound("check");
      onWrong?.(puzzle);
      return false;
    }
    const nextStep = step + 1;
    if (nextStep >= puzzle.solution.length) {
      setStep(nextStep);
      setStatus("solved");
      playChessSound("gameover");
      onSolved?.(puzzle);
    } else {
      setStep(nextStep + 1);
      setStatus("playing");
      playChessSound("move");
    }
    return true;
  };

  const reset = () => {
    setStep(0);
    setStatus("playing");
    setSelected(null);
  };

  const squareStyles: Record<string, CSSProperties> = {};
  if (selected) {
    squareStyles[selected] = { backgroundColor: "rgba(250, 204, 21, 0.55)" };
  }

  return (
    <div className={cn("space-y-2.5", compact && "mx-auto w-full max-w-64")}>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="truncate font-semibold">{puzzle.title}</span>
        <Badge variant="secondary" className="shrink-0 text-[10px]">
          {puzzle.theme} · ~{puzzle.rating}
        </Badge>
      </div>

      <div className="aspect-square w-full overflow-hidden rounded-lg border shadow-sm">
        <Chessboard
          options={{
            id: `puzzle-${puzzle.id}-${compact ? "sm" : "lg"}`,
            position: chess.fen(),
            boardOrientation: side,
            squareStyles,
            darkSquareStyle: { backgroundColor: "#7c94b4" },
            lightSquareStyle: { backgroundColor: "#e6ebf2" },
            allowDragging: status !== "solved",
            onPieceDrop: ({ sourceSquare, targetSquare }) =>
              !!targetSquare &&
              tryMove(sourceSquare as Square, targetSquare as Square),
            onSquareClick: ({ square }) => {
              if (status === "solved") return;
              const sq = square as Square;
              if (selected && selected !== sq && tryMove(selected, sq)) return;
              const piece = chess.get(sq);
              setSelected(
                piece?.color === myTurnColor && sq !== selected ? sq : null,
              );
            },
          }}
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-xs font-medium sm:text-sm">
          {status === "solved" ? (
            <span className="inline-flex items-center gap-1 text-success">
              <CheckCircle2 className="size-3.5 shrink-0" />
              Solved! ({puzzle.solution.join(" ")})
            </span>
          ) : status === "wrong" ? (
            <span className="text-destructive">Not best — try another move.</span>
          ) : (
            <span className="text-muted-foreground">
              {side === "white" ? "White" : "Black"} to move
            </span>
          )}
        </p>
        <div className="flex shrink-0 items-center gap-1.5">
          {!compact && (
            <Button size="sm" variant="outline" onClick={reset}>
              <RotateCcw className="size-3.5" />
              Reset
            </Button>
          )}
          {footerAction}
        </div>
      </div>
    </div>
  );
}
