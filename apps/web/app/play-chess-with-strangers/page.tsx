import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/content-page";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata } from "@/lib/site";

const title = "Play Chess with Strangers Online & Chat Live";
const description =
  "Play free 10-minute chess with random strangers while chatting 1-on-1. Invite any chat partner to a game, track your Elo, and make chess friends.";

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
      name: "What time control does Funstranger Chess use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Games use a 10+0 rapid clock enforced on the server so brief network blips never reset or freeze your time.",
      },
    },
    {
      "@type": "Question",
      name: "Does Funstranger track my chess rating?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Completed games update your anonymous Funstranger Elo rating (starting at 1200) along with your win, loss and draw record.",
      },
    },
  ],
};

export default function PlayChessWithStrangersPage() {
  return (
    <ContentPage
      title={title}
      path="/play-chess-with-strangers"
      lead="Most chess sites feel silent and transactional, while most chat sites give you nothing to do together. Funstranger combines both: meet a random stranger, talk one-on-one, and play a live 10+0 chess game side by side."
    >
      <h2>Two ways to play chess with strangers</h2>
      <ul>
        <li>
          <strong>Join Chess Club from the lobby:</strong> Tap{" "}
          <em>Play chess with a stranger</em> to match immediately with another
          player looking for a 10-minute game and conversation.
        </li>
        <li>
          <strong>Challenge your chat partner mid-conversation:</strong>{" "}
          Already talking in regular text chat? Tap <strong>Play chess</strong>{" "}
          in the chat header to send an instant board invite without losing your
          messages.
        </li>
      </ul>

      <h2>Built for real conversation and fair play</h2>
      <p>
        Every move is validated server-side with <code>chess.js</code>, and
        server-enforced 10+0 clocks mean neither player can stall or freeze the
        timer. You get subtle move and capture audio cues, material advantage
        indicators, draw offers, and instant rematches with swapped colors.
      </p>

      <h2>Keep playing with people you click with</h2>
      <p>
        Finished a great game and loved the conversation? Tap{" "}
        <strong>Add friend</strong>. Once both players accept, you unlock
        persistent handle-only messaging in your Friends drawer while keeping
        your Google account private.
      </p>

      <h2>Warm up before your next match</h2>
      <p>
        Want to sharpen your tactical vision first? Try our{" "}
        <Link href="/puzzles">free interactive chess puzzles</Link> without
        signing in, or read our{" "}
        <Link href="/make-friends-online">
          guide to making friends safely online
        </Link>
        .
      </p>

      <JsonLd data={chessFaqJsonLd} />
    </ContentPage>
  );
}
