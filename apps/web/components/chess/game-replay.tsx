"use client";

import { type CSSProperties, useMemo, useState } from "react";
import { Chess } from "chess.js";
import {
  ArrowLeftRight,
  Check,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Share2,
  Sparkles,
} from "lucide-react";
import { Chessboard } from "react-chessboard";
import { getTimeControl, type ChessColor, type TimeControlId } from "@funstranger/protocol";
import { Badge } from "@funstranger/ui/components/badge";
import { Button } from "@funstranger/ui/components/button";
import { cn } from "@funstranger/ui/lib/utils";
import { analyzeGameMoves, type AnalyzedMove } from "@/lib/stockfish";
import { RankBadge } from "./rank-badge";

interface GameReplayProps {
  id: string;
  whiteHandle: string;
  whiteRating: number;
  blackHandle: string;
  blackRating: number;
  result: string;
  reason: string;
  timeControl: string;
  moves: string[];
}

export function GameReplay({
  whiteHandle,
  whiteRating,
  blackHandle,
  blackRating,
  result,
  reason,
  timeControl,
  moves,
}: GameReplayProps) {
  const [ply, setPly] = useState(moves.length);
  const [orientation, setOrientation] = useState<ChessColor>("white");
  const [copied, setCopied] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalyzedMove[] | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const tcSpec = getTimeControl(timeControl as TimeControlId);

  const chess = useMemo(() => {
    const c = new Chess();
    for (let i = 0; i < ply; i++) {
      const san = moves[i];
      if (san) c.move(san);
    }
    return c;
  }, [moves, ply]);

  const lastMove = useMemo(() => {
    const h = chess.history({ verbose: true }).at(-1);
    return h ? { from: h.from, to: h.to } : null;
  }, [chess]);

  const squareStyles: Record<string, CSSProperties> = {};
  if (lastMove) {
    squareStyles[lastMove.from] = { backgroundColor: "rgba(250, 204, 21, 0.45)" };
    squareStyles[lastMove.to] = { backgroundColor: "rgba(250, 204, 21, 0.45)" };
  }

  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable.
    }
  };

  const runAnalysis = async () => {
    if (analyzing || moves.length === 0) return;
    setAnalyzing(true);
    setAnalysisError(null);
    try {
      setAnalysis(await analyzeGameMoves(moves));
    } catch {
      setAnalysisError("Stockfish engine unavailable in this browser.");
    } finally {
      setAnalyzing(false);
    }
  };

  const topPlayer =
    orientation === "white"
      ? { handle: blackHandle, rating: blackRating, color: "Black" }
      : { handle: whiteHandle, rating: whiteRating, color: "White" };
  const bottomPlayer =
    orientation === "white"
      ? { handle: whiteHandle, rating: whiteRating, color: "White" }
      : { handle: blackHandle, rating: blackRating, color: "Black" };

  const currentEval = ply > 0 ? analysis?.[ply - 1] : undefined;
  const movePairs: { moveNo: number; white?: string; black?: string }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      moveNo: i / 2 + 1,
      white: moves[i],
      black: moves[i + 1],
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,30rem)_1fr]">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2 text-sm">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate font-semibold">{topPlayer.handle}</span>
            <RankBadge rating={topPlayer.rating} className="text-[10px]" />
          </div>
          <Badge variant="outline" className="text-[10px]">
            {topPlayer.color} · {tcSpec.label}
          </Badge>
        </div>

        <div className="aspect-square w-full overflow-hidden rounded-xl border shadow-sm">
          <Chessboard
            options={{
              id: "replay-board",
              position: chess.fen(),
              boardOrientation: orientation,
              squareStyles,
              darkSquareStyle: { backgroundColor: "#7c94b4" },
              lightSquareStyle: { backgroundColor: "#e6ebf2" },
              allowDragging: false,
            }}
          />
        </div>

        <div className="flex items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2 text-sm">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate font-semibold">{bottomPlayer.handle}</span>
            <RankBadge rating={bottomPlayer.rating} className="text-[10px]" />
          </div>
          <Badge variant="outline" className="text-[10px]">
            {bottomPlayer.color}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <Button
              size="icon-sm"
              variant="outline"
              disabled={ply <= 0}
              onClick={() => setPly(0)}
              aria-label="Start position"
            >
              <ChevronFirst className="size-4" />
            </Button>
            <Button
              size="icon-sm"
              variant="outline"
              disabled={ply <= 0}
              onClick={() => setPly((p) => Math.max(0, p - 1))}
              aria-label="Previous move"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-16 text-center font-mono text-xs tabular-nums text-muted-foreground">
              {ply}/{moves.length}
            </span>
            <Button
              size="icon-sm"
              variant="outline"
              disabled={ply >= moves.length}
              onClick={() => setPly((p) => Math.min(moves.length, p + 1))}
              aria-label="Next move"
            >
              <ChevronRight className="size-4" />
            </Button>
            <Button
              size="icon-sm"
              variant="outline"
              disabled={ply >= moves.length}
              onClick={() => setPly(moves.length)}
              aria-label="Final position"
            >
              <ChevronLast className="size-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setOrientation((o) => (o === "white" ? "black" : "white"))
              }
            >
              <ArrowLeftRight className="size-3.5" />
              Flip
            </Button>
            <Button size="sm" variant="secondary" onClick={() => void copyShareUrl()}>
              {copied ? (
                <Check className="size-3.5" />
              ) : (
                <Share2 className="size-3.5" />
              )}
              {copied ? "Copied link" : "Share"}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs text-muted-foreground">
                {tcSpec.label} {tcSpec.category} · {moves.length} plies
              </p>
              <h2 className="mt-1 text-xl font-bold">
                Result: {result} ({reason.replaceAll("_", " ")})
              </h2>
            </div>
            {!analysis && moves.length > 0 && (
              <Button
                size="sm"
                disabled={analyzing}
                onClick={() => void runAnalysis()}
              >
                {analyzing ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Sparkles className="size-3.5" />
                )}
                {analyzing ? "Analyzing…" : "Review with Stockfish"}
              </Button>
            )}
          </div>

          {currentEval && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <Badge
                variant={
                  currentEval.tag === "blunder" || currentEval.tag === "mistake"
                    ? "destructive"
                    : "secondary"
                }
              >
                {currentEval.mateAfterWhite !== null
                  ? `M${Math.abs(currentEval.mateAfterWhite)}`
                  : `${currentEval.cpAfterWhite >= 0 ? "+" : ""}${(currentEval.cpAfterWhite / 100).toFixed(1)}`}
                {" · "}
                {currentEval.tag}
                {currentEval.tag !== "best" &&
                  currentEval.tag !== "good" &&
                  currentEval.bestMoveSan &&
                  ` (best: ${currentEval.bestMoveSan})`}
              </Badge>
            </div>
          )}
          {analysisError && (
            <p className="mt-2 text-xs text-destructive">{analysisError}</p>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto rounded-xl border bg-card p-3">
          <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Move List
          </p>
          <div className="grid grid-cols-[2.5rem_1fr_1fr] gap-1 text-xs">
            {movePairs.map((pair) => {
              const whitePly = pair.moveNo * 2 - 1;
              const blackPly = pair.moveNo * 2;
              return (
                <div key={pair.moveNo} className="contents">
                  <span className="py-1 font-mono text-muted-foreground">
                    {pair.moveNo}.
                  </span>
                  <button
                    type="button"
                    onClick={() => setPly(whitePly)}
                    className={cn(
                      "rounded px-2 py-1 text-left font-mono transition-colors hover:bg-accent",
                      ply === whitePly && "bg-primary/15 font-semibold text-primary",
                    )}
                  >
                    {pair.white}
                  </button>
                  {pair.black ? (
                    <button
                      type="button"
                      onClick={() => setPly(blackPly)}
                      className={cn(
                        "rounded px-2 py-1 text-left font-mono transition-colors hover:bg-accent",
                        ply === blackPly &&
                          "bg-primary/15 font-semibold text-primary",
                      )}
                    >
                      {pair.black}
                    </button>
                  ) : (
                    <span />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
