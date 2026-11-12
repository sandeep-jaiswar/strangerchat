import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChessKnight, Flame, TrendingUp, Trophy } from "lucide-react";
import { getLeaderboard, type LeaderboardEntry } from "@funstranger/db";
import { Badge } from "@funstranger/ui/components/badge";
import { Button } from "@funstranger/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@funstranger/ui/components/card";
import { AdSlot } from "@/components/ads/ad-slot";
import { RankBadge } from "@/components/chess/rank-badge";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { AD_SLOTS } from "@/lib/ads";
import { SITE_NAME, SITE_URL, pageMetadata } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  path: "/leaderboard",
  title: "Chess & Daily Puzzle Leaderboard",
  description:
    "See the highest-rated anonymous chess players, biggest weekly Elo climbers, and longest daily tactical puzzle streaks on Funstranger.",
});

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
    {
      "@type": "ListItem",
      position: 2,
      name: "Leaderboard",
      item: `${SITE_URL}/leaderboard`,
    },
  ],
};

function EmptyList({ message }: { message: string }) {
  return (
    <p className="py-6 text-center text-sm text-muted-foreground">{message}</p>
  );
}

function PlayerRow({
  rank,
  entry,
  metric,
}: {
  rank: number;
  entry: LeaderboardEntry;
  metric: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border bg-background/70 px-3 py-2 text-sm">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="w-6 shrink-0 font-mono text-xs font-semibold text-muted-foreground">
          #{rank}
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium">{entry.handle}</p>
          <p className="text-xs text-muted-foreground">
            {entry.chessWins}W · {entry.chessLosses}L · {entry.chessDraws}D
          </p>
        </div>
      </div>
      <div className="shrink-0">{metric}</div>
    </div>
  );
}

export default async function LeaderboardPage() {
  const board = await getLeaderboard(15);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-4 py-8 sm:px-6 sm:py-12">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="space-y-2">
            <Badge variant="secondary">Live Standings · {board.weekKey}</Badge>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Funstranger Leaderboard
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              Anonymous handles compete in real-time 1+0, 3+2, 5+0, and 10+0
              chess matches plus daily tactical puzzle streaks.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/chat">
                <ChessKnight />
                Play Chess Now
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/puzzles">
                <Flame />
                Daily Puzzle
              </Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="size-4 text-success" />
                Weekly Climbers
              </CardTitle>
              <CardDescription>
                Top positive Elo gain this ISO week ({board.weekKey}).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {board.topWeeklyGainers.length === 0 ? (
                <EmptyList message="No rated games finished yet this week — play a match to claim #1!" />
              ) : (
                board.topWeeklyGainers.map((entry, idx) => (
                  <PlayerRow
                    key={entry.handle}
                    rank={idx + 1}
                    entry={entry}
                    metric={
                      <Badge variant="secondary" className="font-mono text-success">
                        +{entry.weeklyEloGain} Elo
                      </Badge>
                    }
                  />
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="size-4 text-amber-500" />
                Highest Rated
              </CardTitle>
              <CardDescription>
                Top chess Elo ratings across all Funstranger matches.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {board.topElo.length === 0 ? (
                <EmptyList message="Play your first rated game to join the standings." />
              ) : (
                board.topElo.map((entry, idx) => (
                  <PlayerRow
                    key={entry.handle}
                    rank={idx + 1}
                    entry={entry}
                    metric={<RankBadge rating={entry.chessRating} />}
                  />
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Flame className="size-4 text-amber-500" />
                Daily Puzzle Streaks
              </CardTitle>
              <CardDescription>
                Active consecutive days solving today&apos;s featured tactic.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {board.topStreaks.length === 0 ? (
                <EmptyList message="Solve today's Daily Puzzle on /puzzles to start a streak!" />
              ) : (
                board.topStreaks.map((entry, idx) => (
                  <PlayerRow
                    key={entry.handle}
                    rank={idx + 1}
                    entry={entry}
                    metric={
                      <Badge variant="outline" className="gap-1 font-mono">
                        <Flame className="size-3 text-amber-500" />
                        {entry.dailyStreak}d · {entry.puzzleRating}
                      </Badge>
                    }
                  />
                ))
              )}
            </CardContent>
          </Card>
        </section>

        <AdSlot slot={AD_SLOTS.banner} format="horizontal" />
      </main>
      <SiteFooter />
      <JsonLd data={breadcrumbJsonLd} />
    </div>
  );
}
