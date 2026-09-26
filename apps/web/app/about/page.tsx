import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/content-page";
import { pageMetadata } from "@/lib/site";

const title = "About StrangerChat";
const description =
  "StrangerChat is a free, anonymous random chat site that connects you one-on-one with strangers from around the world. Here's what we're building and why.";

export const metadata: Metadata = pageMetadata({
  path: "/about",
  title: "About",
  socialTitle: title,
  description,
});

export default function AboutPage() {
  return (
    <ContentPage
      title={title}
      path="/about"
      lead="StrangerChat is a free place to talk to someone new. One tap matches you with a random stranger for an anonymous, one-on-one text conversation — no profiles, no feeds, no pressure."
    >
      <h2>Why we built it</h2>
      <p>
        Most of the internet connects you with people you already know, or
        people an algorithm thinks you should see. We wanted the opposite: a
        simple way to have an honest, unexpected conversation with someone
        you&apos;d never otherwise meet.
      </p>
      <p>
        When Omegle closed in 2023, millions of people lost that. StrangerChat
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
          <strong>Conversation over content.</strong> Text chat keeps the focus
          on what people say, not how they look.
        </li>
        <li>
          <strong>Privacy by default.</strong> Strangers never see who you are,
          and messages are not stored once delivered.
        </li>
        <li>
          <strong>Real people only.</strong> Verified sign-in keeps bots out so
          every match is a real human.
        </li>
        <li>
          <strong>Free for everyone.</strong> No coins, no premium filters, no
          paywalls. The site is supported by unobtrusive ads.
        </li>
      </ul>

      <h2>Who uses StrangerChat</h2>
      <p>
        People come to kill time, practise a language, get a stranger&apos;s
        honest opinion, vent without judgement or just see who&apos;s out there.
        Every chat is different — that&apos;s the fun of it.
      </p>

      <h2>Stay safe</h2>
      <p>
        StrangerChat is for adults 18 and over. Before you start, take two
        minutes to read our <Link href="/safety">safety tips</Link>, our{" "}
        <Link href="/terms">terms of service</Link> and our{" "}
        <Link href="/privacy">privacy policy</Link>.
      </p>
    </ContentPage>
  );
}
