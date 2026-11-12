import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChessKnight, Trophy } from "lucide-react";
import { getChessGameById } from "@funstranger/db";
import { getTimeControl, type TimeControlId } from "@funstranger/protocol";
import { Button } from "@funstranger/ui/components/button";
import { AdSlot } from "@/components/ads/ad-slot";
import { GameReplay } from "@/components/chess/game-replay";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { AD_SLOTS } from "@/lib/ads";
import { pageMetadata } from "@/lib/site";

export const dynamic = "force-dynamic";

const loadChessGame = cache((id: string) => getChessGameById(id));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const game = await loadChessGame(id);
  if (!game) {
    return pageMetadata({
      path: `/game/${id}`,
      title: "Chess Replay Not Found",
      description: "Play anonymous live chess and chat with strangers on Funstranger.",
    });
  }
  const tc = getTimeControl(game.timeControl as TimeControlId).label;
  return pageMetadata({
    path: `/game/${game.id}`,
    title: `${game.whiteHandle} vs ${game.blackHandle} (${game.result}) — Chess Replay`,
    description: `Replay this ${tc} chess match between ${game.whiteHandle} (${game.whiteRating}) and ${game.blackHandle} (${game.blackRating}), ending ${game.result} by ${game.reason.replaceAll("_", " ")}.`,
  });
}

export default async function GameReplayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const game = await loadChessGame(id);
  if (!game) notFound();

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-8 px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Public Chess Replay
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              {game.whiteHandle} ({game.whiteRating}) vs {game.blackHandle} (
              {game.blackRating})
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/chat">
                <ChessKnight />
                Play Chess
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/leaderboard">
                <Trophy />
                Leaderboard
              </Link>
            </Button>
          </div>
        </div>

        <GameReplay
          id={game.id}
          whiteHandle={game.whiteHandle}
          whiteRating={game.whiteRating}
          blackHandle={game.blackHandle}
          blackRating={game.blackRating}
          result={game.result}
          reason={game.reason}
          timeControl={game.timeControl}
          moves={game.moves}
        />

        <AdSlot slot={AD_SLOTS.banner} format="horizontal" />
      </main>
      <SiteFooter />
    </div>
  );
}
