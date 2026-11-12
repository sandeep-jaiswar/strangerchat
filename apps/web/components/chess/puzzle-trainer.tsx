"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { CHESS_PUZZLES, type ChessPuzzle } from "@funstranger/protocol";
import { Badge } from "@funstranger/ui/components/badge";
import { Button } from "@funstranger/ui/components/button";
import { captureEvent } from "@/lib/analytics";
import { PuzzleBoard } from "./puzzle-board";

export function PuzzleTrainer() {
  const [index, setIndex] = useState(0);
  const [solvedIds, setSolvedIds] = useState<string[]>([]);

  const puzzle = CHESS_PUZZLES[index]!;

  const handleSolved = (solved: ChessPuzzle) => {
    setSolvedIds((prev) =>
      prev.includes(solved.id) ? prev : [...prev, solved.id],
    );
    captureEvent("puzzle_solved", {
      puzzle_id: solved.id,
      theme: solved.theme,
      rating: solved.rating,
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_1fr]">
      <PuzzleBoard
        puzzle={puzzle}
        onSolved={handleSolved}
        footerAction={
          <Button
            size="sm"
            onClick={() => setIndex((prev) => (prev + 1) % CHESS_PUZZLES.length)}
          >
            Next
            <ArrowRight className="size-3.5" />
          </Button>
        }
      />

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
            {solvedIds.length} of {CHESS_PUZZLES.length} puzzles in this session.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CHESS_PUZZLES.map((item, i) => {
            const done = solvedIds.includes(item.id);
            const active = i === index;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setIndex(i)}
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
