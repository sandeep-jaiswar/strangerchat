import type { Metadata } from "next";
import Link from "next/link";
import {
  ChessKnight,
  EyeOff,
  Hash,
  ShieldCheck,
  SkipForward,
  UserPlus,
} from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { AdSlot } from "@/components/ads/ad-slot";
import { HeroAuthCta } from "@/components/auth-cta";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { AD_SLOTS } from "@/lib/ads";
import { HOME_FAQ } from "@/lib/faq";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  path: "/",
  description: SITE_DESCRIPTION,
});

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: HOME_FAQ.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: `How to chat, play chess, and make friends with strangers on ${SITE_NAME}`,
  description: SITE_DESCRIPTION,
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Sign in with Google",
      text: "Verify with Google in one tap to keep spam bots out. Your email and real name stay hidden from strangers.",
      url: `${SITE_URL}/login`,
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Match by interests or jump into Chess Club",
      text: "Pick up to three interest tags like #chess or #music and get matched one-on-one in seconds.",
      url: `${SITE_URL}/chat`,
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Play chess while talking and add friends",
      text: "Launch a 10+0 chess board right inside any chat, or tap Add Friend when both sides want to stay connected.",
      url: `${SITE_URL}/play-chess-with-strangers`,
    },
  ],
};

const features = [
  {
    icon: ChessKnight,
    title: "Play chess while talking",
    body: "Invite any chat partner to a live 10+0 chess game right beside your messages, or queue straight into Chess Club.",
  },
  {
    icon: UserPlus,
    title: "Make real friends",
    body: "Vibe with a stranger? Tap Add Friend — when both accept, keep chatting anytime using anonymous handles.",
  },
  {
    icon: Hash,
    title: "Match by interests",
    body: "Add tags like #chess, #coding, #music or #languages so you meet people who share your favorite topics.",
  },
  {
    icon: EyeOff,
    title: "Stay anonymous",
    body: "Strangers never see your Gmail, real name or photo. Your privacy stays protected by default.",
  },
  {
    icon: ShieldCheck,
    title: "Real people, safer chats",
    body: "Google sign-in keeps bots out, automated moderation filters abuse, and one-tap Block & Report puts you in control.",
  },
  {
    icon: SkipForward,
    title: "Skip anytime, free forever",
    body: "Not a good match? Press Esc or tap Next to meet someone new in any mobile or desktop browser.",
  },
];

const steps = [
  {
    title: "Sign in with Google",
    body: "One tap. Your name, email and photo stay private — strangers never see your Google account.",
  },
  {
    title: "Get matched instantly",
    body: "Pick optional interest tags or Chess Club and get paired one-on-one with someone online right now.",
  },
  {
    title: "Chat, play chess & add friends",
    body: "Talk, launch a chess board mid-chat, skip anytime, or become mutual friends to message later.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-80 max-w-3xl rounded-full bg-primary/20 blur-3xl"
          />
          <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 pt-16 pb-12 text-center sm:px-6 sm:pt-24 sm:pb-16">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
              <span className="size-2 animate-pulse rounded-full bg-success" />
              People are chatting &amp; playing chess right now
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-6xl">
              Talk to a stranger.
              <br />
              <span className="text-primary">Play chess &amp; make friends.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-pretty text-muted-foreground sm:text-lg">
              Free anonymous chat with strangers around the world. Match by
              shared interests, start a live chess game while you talk, and add
              friends safely — no app required.
            </p>
            <div className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
              <HeroAuthCta icon="arrow" className="w-full sm:w-auto" />
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
              >
                <Link href="/puzzles">Try chess puzzles</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Free forever · 18+ only · Verified Google sign-in keeps bots out
            </p>
          </div>
        </section>

        <section
          aria-labelledby="features-heading"
          className="mx-auto max-w-5xl px-4 pb-16 sm:px-6"
        >
          <h2 id="features-heading" className="sr-only">
            Why chat with strangers on Funstranger
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-xl border bg-card p-5">
                <span className="mb-3 flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="size-4" />
                </span>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="how-heading"
          className="mx-auto max-w-5xl px-4 pb-16 sm:px-6"
        >
          <h2
            id="how-heading"
            className="text-center text-2xl font-bold tracking-tight sm:text-3xl"
          >
            How to talk to strangers and play chess online
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            Random chat, live chess, and real friendships in three simple steps.
          </p>
          <ol className="mt-8 grid gap-4 sm:grid-cols-3">
            {steps.map(({ title, body }, index) => (
              <li key={title} className="rounded-xl border bg-card p-5">
                <span className="mb-3 flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {index + 1}
                </span>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
          <AdSlot slot={AD_SLOTS.banner} format="horizontal" />
        </section>

        <section
          aria-labelledby="about-heading"
          className="mx-auto max-w-3xl px-4 pb-16 sm:px-6"
        >
          <h2
            id="about-heading"
            className="text-2xl font-bold tracking-tight sm:text-3xl"
          >
            A safer way to meet strangers, play chess, and make friends
          </h2>
          <div className="mt-4 space-y-4 text-muted-foreground">
            <p>
              Funstranger is a free stranger chat site for meeting new people
              through quick, anonymous one-on-one text conversations and live
              chess games. Whether you&apos;re bored, want to practise your
              English,{" "}
              <Link
                href="/play-chess-with-strangers"
                className="text-foreground underline underline-offset-2"
              >
                play casual 10-minute chess with strangers
              </Link>
              , or{" "}
              <Link
                href="/make-friends-online"
                className="text-foreground underline underline-offset-2"
              >
                make new friends online
              </Link>
              , you&apos;re one tap away from someone new.
            </p>
            <p>
              Unlike open chat rooms, every conversation is private between you
              and one stranger. Your Google details stay hidden — and if you
              vibe, tap <strong>Add Friend</strong> to connect with anonymous
              handles only. Because every account is verified with Google, you
              spend less time dodging bots and more time having real
              conversations.
            </p>
            <p>
              Looking for a replacement since Omegle closed? See{" "}
              <Link
                href="/omegle-alternative"
                className="text-foreground underline underline-offset-2"
              >
                why Funstranger is the best Omegle alternative
              </Link>
              , warm up with our{" "}
              <Link
                href="/puzzles"
                className="text-foreground underline underline-offset-2"
              >
                free tactical chess puzzles
              </Link>
              , and read our{" "}
              <Link
                href="/safety"
                className="text-foreground underline underline-offset-2"
              >
                tips for chatting with strangers safely
              </Link>
              .
            </p>
          </div>
        </section>

        <section
          aria-labelledby="faq-heading"
          className="mx-auto max-w-3xl px-4 pb-16 sm:px-6"
        >
          <h2
            id="faq-heading"
            className="text-2xl font-bold tracking-tight sm:text-3xl"
          >
            Frequently asked questions
          </h2>
          <div className="mt-6 divide-y rounded-xl border bg-card">
            {HOME_FAQ.map(({ question, answer }) => (
              <details key={question} className="group px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
                  <h3>{question}</h3>
                  <span
                    aria-hidden
                    className="text-muted-foreground transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-2 text-sm text-muted-foreground">{answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-20 text-center sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Someone new is waiting to talk
          </h2>
          <p className="mt-3 text-muted-foreground">
            Start a free anonymous chat or chess match in seconds.
          </p>
          <div className="mt-6 flex justify-center">
            <HeroAuthCta icon="zap" />
          </div>
        </section>
      </main>

      <SiteFooter />
      <JsonLd data={faqJsonLd} />
      <JsonLd data={howToJsonLd} />
    </div>
  );
}
