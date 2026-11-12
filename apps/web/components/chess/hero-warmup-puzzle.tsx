"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight, ChessKnight, Flame, Sparkles } from "lucide-react";
import {
  CHESS_PUZZLES,
  getDailyPuzzleIndex,
  type ChessPuzzle,
} from "@funstranger/protocol";
import { Badge } from "@funstranger/ui/components/badge";
import { Button } from "@funstranger/ui/components/button";
import { SignInButton } from "@/components/sign-in-button";
import { captureEvent } from "@/lib/analytics";
import { PuzzleBoard } from "./puzzle-board";

export function HeroWarmupPuzzle() {
  const { data: session } = useSession();
  const dailyIndex = getDailyPuzzleIndex();
  const [index, setIndex] = useState(dailyIndex);
  const [solvedCurrent, setSolvedCurrent] = useState(false);

  const puzzle = CHESS_PUZZLES[index]!;
  const isDaily = index === dailyIndex;

  const advancePuzzle = () => {
    setSolvedCurrent(false);
    setIndex((prev) => (prev + 1) % CHESS_PUZZLES.length);
  };

  const handleSolved = (solved: ChessPuzzle) => {
    setSolvedCurrent(true);
    captureEvent("landing_hero_puzzle_solved", {
      puzzle_id: solved.id,
      theme: solved.theme,
      rating: solved.rating,
      is_daily: index === dailyIndex,
    });
  };

  return (
    <div className="mx-auto w-full max-w-sm rounded-2xl border bg-card/90 p-4 shadow-lg backdrop-blur">
      <div className="mb-3 flex items-center justify-between gap-2">
        <Badge variant="secondary" className="gap-1.5 text-[11px]">
          {isDaily ? (
            <Flame className="size-3 text-amber-500" />
          ) : (
            <ChessKnight className="size-3 text-primary" />
          )}
          {isDaily ? "Today's Daily Tactic" : "Tactics Warmup"}
        </Badge>
        <span className="text-[11px] text-muted-foreground">
          No sign-in needed
        </span>
      </div>

      <PuzzleBoard
        puzzle={puzzle}
        onSolved={handleSolved}
        footerAction={
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs"
            onClick={advancePuzzle}
          >
            Next puzzle
            <ArrowRight className="size-3" />
          </Button>
        }
      />

      {solvedCurrent && (
        <div className="mt-3 space-y-2 rounded-xl border border-primary/25 bg-primary/5 p-3 text-left">
          <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <Sparkles className="size-3.5 shrink-0 text-primary" />
            {session
              ? "Sharp eye! Jump into live Bullet, Blitz, or Rapid chess."
              : "Nice find! Sign in to save your streak & match a real opponent."}
          </p>
          {session ? (
            <Button asChild size="sm" className="w-full">
              <Link href="/chat">
                Match a player now
                <ArrowRight />
              </Link>
            </Button>
          ) : (
            <SignInButton
              callbackUrl="/chat"
              source="hero_puzzle_solved"
              label="Save streak & play live"
              className="h-9 w-full text-xs"
            />
          )}
        </div>
      )}
    </div>
  );
}
