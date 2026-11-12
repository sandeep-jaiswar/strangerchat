import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/content-page";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata } from "@/lib/site";

const title = "Play Chess with Strangers Online & Chat Live";
const description =
  "Play free 1+0 Bullet, 3+2/5+0 Blitz, and 10+0 Rapid chess with strangers while chatting 1-on-1. Run 90s Puzzle Duels, review games with Stockfish WASM, and climb the leaderboard.";

export const metadata: Metadata = pageMetadata({
  path: "/play-chess-with-strangers",
  title: "Play Chess with Strangers Online Free",
  socialTitle: title,
  description,
});

const chessFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Can I talk to my chess opponent while playing?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Every Chess Club match includes a private one-on-one chat right next to the board, and you can also invite any text-chat partner to play chess mid-conversation.",
      },
    },
    {
      "@type": "Question",
      name: "What time controls does Funstranger Chess use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can choose 1+0 Bullet, 3+2 or 5+0 Blitz, or 10+0 Rapid — all enforced on the server with pre-move support and optional 90s Puzzle Duels.",
      },
    },
    {
      "@type": "Question",
      name: "Does Funstranger track my chess rating?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Completed games update your anonymous Funstranger Elo rating (starting at 1200) across tiers from Bronze to Grandmaster, unlock shareable /game/[id] replays, and rank on the public leaderboard.",
      },
    },
  ],
};

export default function PlayChessWithStrangersPage() {
  return (
    <ContentPage
      title={title}
      path="/play-chess-with-strangers"
      lead="Most chess sites feel silent and transactional, while most chat sites give you nothing to do together. Funstranger combines both: meet a random stranger, talk one-on-one, and play live 1+0 Bullet, 3+2/5+0 Blitz, or 10+0 Rapid chess side by side."
    >
      <h2>Two ways to play chess with strangers</h2>
      <ul>
        <li>
          <strong>Join Chess Club from the lobby:</strong> Pick your time
          control (1+0, 3+2, 5+0, or 10+0) and tap{" "}
          <em>Play chess with a stranger</em> to match immediately — or warm up
          with puzzles and local Stockfish AI while waiting.
        </li>
        <li>
          <strong>Challenge your chat partner mid-conversation:</strong>{" "}
          Already talking in regular text chat? Tap <strong>Play chess</strong>{" "}
          or launch a <strong>90s Puzzle Duel</strong> right in the chat header
          without losing your messages.
        </li>
      </ul>

      <h2>Built for real conversation and fair play</h2>
      <p>
        Every move is validated server-side with <code>chess.js</code>, and
        server-enforced clocks with client pre-moves keep Bullet and Blitz
        crisp. After any game, inspect key blunders locally with Stockfish 19
        WASM, browse <Link href="/leaderboard">the public leaderboard</Link>, or
        share the public replay page.
      </p>

      <h2>Keep playing with people you click with</h2>
      <p>
        Finished a great game and loved the conversation? Tap{" "}
        <strong>Add friend</strong>. Once both players accept, you unlock
        handle-only messaging and 1-tap chess challenges in your Friends
        drawer while keeping your Google account private.
      </p>

      <h2>Warm up before your next match</h2>
      <p>
        Want to sharpen your tactical vision first? Try our{" "}
        <Link href="/puzzles">free interactive chess puzzles</Link> without
        signing in, check{" "}
        <Link href="/leaderboard">weekly Elo gainers and streaks</Link>, or read
        our{" "}
        <Link href="/make-friends-online">
          guide to making friends safely online
        </Link>
        .
      </p>

      <JsonLd data={chessFaqJsonLd} />
    </ContentPage>
  );
}
