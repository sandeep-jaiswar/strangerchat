import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/content-page";
import { pageMetadata } from "@/lib/site";

const title = "About Funstranger";
const description =
  "Funstranger is a free, anonymous random chat and chess site (funstranger.in) that connects you one-on-one with strangers around the world.";

export const metadata: Metadata = pageMetadata({
  path: "/about",
  title: "About Our Anonymous Chat & Chess Platform",
  socialTitle: title,
  description,
});

export default function AboutPage() {
  return (
    <ContentPage
      title={title}
      path="/about"
      lead="Funstranger is a free place to talk to someone new, play live chess while you chat, and make friends safely. One tap matches you with a random stranger — no feeds, no pressure."
    >
      <h2>Why we built it</h2>
      <p>
        Most of the internet connects you with people you already know, or
        people an algorithm thinks you should see. We wanted the opposite: a
        simple way to have an honest, unexpected conversation with someone
        you&apos;d never otherwise meet.
      </p>
      <p>
        When Omegle closed in 2023, millions of people lost that. Funstranger
        is our take on bringing it back — with the problems fixed. Read more
        about{" "}
        <Link href="/omegle-alternative">
          how we compare as an Omegle alternative
        </Link>
        .
      </p>

      <h2>What we believe</h2>
      <ul>
        <li>
          <strong>Conversation over content.</strong> Text chat and casual chess
          keep the focus on what people say and think, not how they look.
        </li>
        <li>
          <strong>Privacy by default.</strong> Strangers never see your Google
          account, and random chats are not stored once delivered.
        </li>
        <li>
          <strong>Real people only.</strong> Verified Google sign-in keeps bots
          out so every match is a real human.
        </li>
        <li>
          <strong>Free for everyone.</strong> No coins, no premium filters, no
          paywalls. The site is supported by unobtrusive ads.
        </li>
      </ul>

      <h2>Who uses Funstranger</h2>
      <p>
        People come to kill time, play a casual chess match while chatting,
        practise a language, or make new online friends. Every chat is
        different — that&apos;s the fun of it.
      </p>

      <h2>Stay safe</h2>
      <p>
        Funstranger is for adults 18 and over. Before you start, take two
        minutes to read our <Link href="/safety">safety tips</Link>, our{" "}
        <Link href="/terms">terms of service</Link> and our{" "}
        <Link href="/privacy">privacy policy</Link>.
      </p>
    </ContentPage>
  );
}
