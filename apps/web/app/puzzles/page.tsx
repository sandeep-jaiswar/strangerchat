import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChessKnight, ChevronRight } from "lucide-react";
import { Button } from "@funstranger/ui/components/button";
import { AdSlot } from "@/components/ads/ad-slot";
import { PuzzleTrainer } from "@/components/chess/puzzle-trainer";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { AD_SLOTS } from "@/lib/ads";
import { SITE_NAME, SITE_URL, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  path: "/puzzles",
  title: "Free Chess Puzzles & Tactics Trainer",
  description:
    "Sharpen your tactics with free interactive chess puzzles, build your daily streak, and match with a stranger to play Bullet, Blitz, or Rapid chess on Funstranger.",
});

const puzzleBreadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
    {
      "@type": "ListItem",
      position: 2,
      name: "Free Chess Puzzles",
      item: `${SITE_URL}/puzzles`,
    },
  ],
};

export default function PuzzlesPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-10 px-4 py-8 sm:px-6 sm:py-12">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <Link href="/" className="hover:text-foreground">
            {SITE_NAME}
          </Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <span className="text-foreground">Free Chess Puzzles</span>
        </nav>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium tracking-wider text-primary uppercase">
              <ChessKnight className="size-4" />
              Warm up your tactics
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Free Chess Puzzles &amp; Tactics
            </h1>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Solve quick mate-in-one and tactical puzzles right in your browser,
              then jump into a live match and chat with a stranger.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/chat">
              Play a stranger
              <ArrowRight />
            </Link>
          </Button>
        </div>

        <PuzzleTrainer />

        <AdSlot slot={AD_SLOTS.banner} format="horizontal" />

        <section className="grid gap-4 border-t pt-8 sm:grid-cols-2">
          <div className="rounded-xl border bg-card p-5">
            <h2 className="font-semibold">Back-Rank &amp; Corner Mates</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Whenever a castled king is trapped behind its own unmoved pawns,
              check whether your rook or queen can invade the 8th rank for an
              instant back-rank checkmate.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-5">
            <h2 className="font-semibold">Smothered Mates &amp; Knight Forks</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Knights shine in cramped positions. Always look for checks that
              attack two high-value pieces at once or trap an unguarded king in
              the corner. Ready for a real opponent?{" "}
              <Link
                href="/play-chess-with-strangers"
                className="text-foreground underline underline-offset-2"
              >
                Play chess with a stranger
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
      <JsonLd data={puzzleBreadcrumbJsonLd} />
    </div>
  );
}
