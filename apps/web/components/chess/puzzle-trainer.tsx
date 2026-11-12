"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarCheck2, CheckCircle2, Flame, Trophy } from "lucide-react";
import { toast } from "sonner";
import {
  CHESS_PUZZLES,
  getDailyPuzzleIndex,
  type ChessPuzzle,
} from "@funstranger/protocol";
import { Badge } from "@funstranger/ui/components/badge";
import { Button } from "@funstranger/ui/components/button";
import { cn } from "@funstranger/ui/lib/utils";
import { captureEvent } from "@/lib/analytics";
import { PuzzleBoard } from "./puzzle-board";

interface PuzzleStatsPayload {
  dailyPuzzleId: string;
  dailySolvedToday: boolean;
  solvedTodayIds: string[];
  puzzleRating: number;
  dailyStreak: number;
  bestStreak: number;
  puzzlesSolved: number;
}

export function PuzzleTrainer() {
  const dailyIndex = getDailyPuzzleIndex();
  const dailyId = CHESS_PUZZLES[dailyIndex]!.id;

  const [index, setIndex] = useState(dailyIndex);
  const [solvedIds, setSolvedIds] = useState<string[]>([]);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [stats, setStats] = useState<PuzzleStatsPayload>({
    dailyPuzzleId: dailyId,
    dailySolvedToday: false,
    solvedTodayIds: [],
    puzzleRating: 1200,
    dailyStreak: 0,
    bestStreak: 0,
    puzzlesSolved: 0,
  });

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const res = await fetch("/api/puzzles", { cache: "no-store" });
        if (!res.ok || !active) return;
        const data = (await res.json()) as {
          authenticated: boolean;
          stats: PuzzleStatsPayload;
        };
        if (!active) return;
        setAuthenticated(data.authenticated);
        if (data.stats) {
          setStats(data.stats);
          if (data.stats.solvedTodayIds.length > 0) {
            setSolvedIds((prev) =>
              Array.from(new Set([...prev, ...data.stats.solvedTodayIds])),
            );
          }
        }
      } catch {
        // Ignore offline / transient fetch failures.
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const puzzle = CHESS_PUZZLES[index]!;
  const isDaily = puzzle.id === stats.dailyPuzzleId;

  const handleSolved = async (solved: ChessPuzzle) => {
    setSolvedIds((prev) =>
      prev.includes(solved.id) ? prev : [...prev, solved.id],
    );
    captureEvent("puzzle_solved", {
      puzzle_id: solved.id,
      theme: solved.theme,
      rating: solved.rating,
      is_daily: solved.id === stats.dailyPuzzleId,
    });

    if (!authenticated) return;
    try {
      const res = await fetch("/api/puzzles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ puzzleId: solved.id }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { stats?: PuzzleStatsPayload | null };
      if (!data.stats) return;
      if (
        solved.id === stats.dailyPuzzleId &&
        !stats.dailySolvedToday &&
        data.stats.dailySolvedToday
      ) {
        toast.success(
          `Daily Puzzle solved! Streak: ${data.stats.dailyStreak} day${data.stats.dailyStreak === 1 ? "" : "s"}.`,
        );
      }
      setStats(data.stats);
    } catch {
      // Non-fatal persistence error.
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 text-sm">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary" className="gap-1.5">
            <Flame className="size-3.5 text-amber-500" />
            Daily Streak: {stats.dailyStreak}d
            {stats.bestStreak > 0 ? ` (Best ${stats.bestStreak}d)` : ""}
          </Badge>
          <Badge variant="outline" className="gap-1.5">
            <Trophy className="size-3.5 text-primary" />
            Puzzle Elo {stats.puzzleRating}
          </Badge>
          {stats.dailySolvedToday && (
            <Badge variant="outline" className="gap-1 border-success/40 text-success">
              <CalendarCheck2 className="size-3.5" />
              Today&apos;s Daily Complete
            </Badge>
          )}
        </div>
        {authenticated === false && (
          <Link
            href="/login?callbackUrl=/puzzles"
            className="text-xs font-medium text-primary underline underline-offset-2"
          >
            Sign in to save your streak &amp; Puzzle Elo
          </Link>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_1fr]">
        <PuzzleBoard
          puzzle={puzzle}
          onSolved={(solved) => void handleSolved(solved)}
          footerAction={
            <Button
              size="sm"
              onClick={() =>
                setIndex((prev) => (prev + 1) % CHESS_PUZZLES.length)
              }
            >
              Next
              <ArrowRight className="size-3.5" />
            </Button>
          }
        />

        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{puzzle.title}</h2>
                {isDaily && (
                  <Badge className="text-[10px]">Daily</Badge>
                )}
              </div>
              <Badge variant="secondary">
                {puzzle.theme} · ~{puzzle.rating}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Drag a piece on the board to find the winning move. Solved{" "}
              {solvedIds.length} of {CHESS_PUZZLES.length} puzzles today.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {CHESS_PUZZLES.map((item, i) => {
              const done = solvedIds.includes(item.id);
              const active = i === index;
              const daily = item.id === stats.dailyPuzzleId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={cn(
                    "rounded-lg border p-3 text-left text-xs transition-colors",
                    active
                      ? "border-primary bg-primary/10"
                      : "bg-card hover:bg-accent",
                  )}
                >
                  <div className="flex items-center justify-between font-medium">
                    <span>
                      #{i + 1}
                      {daily ? " · Daily" : ""}
                    </span>
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
    </div>
  );
}
