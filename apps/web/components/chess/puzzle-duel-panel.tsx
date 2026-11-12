"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Flame, Swords, Timer, X } from "lucide-react";
import { CHESS_PUZZLE_BY_ID, type ChessPuzzle } from "@funstranger/protocol";
import { Badge } from "@funstranger/ui/components/badge";
import { Button } from "@funstranger/ui/components/button";
import type { PuzzleDuelView } from "@/hooks/use-stranger-chat";
import { PuzzleBoard } from "./puzzle-board";

interface PuzzleDuelPanelProps {
  duel: PuzzleDuelView;
  onProgress: (
    duelId: string,
    solved: number,
    mistakes: number,
    finished: boolean,
  ) => void;
  onDismiss: () => void;
}

export function PuzzleDuelPanel({
  duel,
  onProgress,
  onDismiss,
}: PuzzleDuelPanelProps) {
  return <PuzzleDuelInner key={duel.id} duel={duel} onProgress={onProgress} onDismiss={onDismiss} />;
}

function PuzzleDuelInner({
  duel,
  onProgress,
  onDismiss,
}: PuzzleDuelPanelProps) {
  const puzzles = useMemo(
    () =>
      duel.puzzleIds
        .map((id) => CHESS_PUZZLE_BY_ID.get(id))
        .filter((p): p is ChessPuzzle => p !== undefined),
    [duel.puzzleIds],
  );
  const [idx, setIdx] = useState(0);
  const [solved, setSolved] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  const ended = duel.winner !== null;
  useEffect(() => {
    if (ended) return;
    const timer = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(timer);
  }, [ended]);

  const msLeft = Math.max(0, duel.startedAt + duel.durationMs - now);
  const secLeft = Math.ceil(msLeft / 1000);
  const currentPuzzle = puzzles[idx];
  const doneSolving = solved >= puzzles.length || ended || msLeft === 0;

  const handleSolved = () => {
    if (doneSolving) return;
    const nextSolved = solved + 1;
    const finished = nextSolved >= puzzles.length;
    setSolved(nextSolved);
    onProgress(duel.id, nextSolved, mistakes, finished);
    if (!finished) {
      setTimeout(() => setIdx((prev) => Math.min(puzzles.length - 1, prev + 1)), 450);
    }
  };

  const handleWrong = () => {
    if (doneSolving) return;
    const nextMistakes = mistakes + 1;
    setMistakes(nextMistakes);
    onProgress(duel.id, solved, nextMistakes, false);
  };

  return (
    <div className="shrink-0 border-b bg-accent/35 px-3 py-3 sm:px-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <Swords className="size-4 text-primary" />
          <span>Puzzle Duel</span>
          <Badge variant={secLeft <= 15 && !ended ? "destructive" : "secondary"} className="gap-1 font-mono tabular-nums">
            <Timer className="size-3" />
            {ended ? "Over" : `${secLeft}s`}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium">
            You {duel.me.solved}/{puzzles.length}
          </span>
          <span className="text-muted-foreground">vs</span>
          <span className="font-medium">
            Stranger {duel.them.solved}/{puzzles.length}
          </span>
          {ended && (
            <Button
              size="icon-sm"
              variant="ghost"
              className="size-6"
              onClick={onDismiss}
              aria-label="Close Puzzle Duel"
            >
              <X className="size-3.5" />
            </Button>
          )}
        </div>
      </div>

      {ended ? (
        <div className="flex items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2 text-xs">
          <span className="flex items-center gap-1.5 font-medium">
            <Flame className="size-4 text-amber-500" />
            {duel.winner === "me"
              ? `You won! (${duel.me.solved} vs ${duel.them.solved})`
              : duel.winner === "them"
                ? `Stranger won (${duel.them.solved} vs ${duel.me.solved}).`
                : `Draw (${duel.me.solved}-${duel.them.solved})!`}
          </span>
          <Button size="sm" variant="outline" onClick={onDismiss}>
            Close
          </Button>
        </div>
      ) : doneSolving || !currentPuzzle ? (
        <div className="flex items-center justify-center gap-2 rounded-lg border bg-card px-3 py-3 text-xs text-muted-foreground">
          <CheckCircle2 className="size-4 text-success" />
          <span>
            {solved >= puzzles.length
              ? `You solved ${solved}/${puzzles.length}! Waiting for Stranger to finish…`
              : `Time’s up (${solved}/${puzzles.length} solved)! Waiting for final result…`}
          </span>
        </div>
      ) : (
        <PuzzleBoard
          compact
          puzzle={currentPuzzle}
          onSolved={handleSolved}
          onWrong={handleWrong}
        />
      )}
    </div>
  );
}
