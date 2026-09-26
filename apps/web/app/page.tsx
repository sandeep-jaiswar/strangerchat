import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import Link from "next/link";
import {
  ArrowRight,
  EyeOff,
  Lock,
  ShieldCheck,
  Shuffle,
  Smartphone,
  SkipForward,
  Zap,
} from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { AdSlot } from "@/components/ads/ad-slot";
import { SignInButton } from "@/components/sign-in-button";
import { SiteFooter } from "@/components/site-footer";
import { JsonLd } from "@/components/json-ld";
import { SiteHeader } from "@/components/site-header";
import { AD_SLOTS } from "@/lib/ads";
import { authOptions } from "@/lib/auth";
import { HOME_FAQ } from "@/lib/faq";
import { SITE_DESCRIPTION, pageMetadata } from "@/lib/site";

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

const features = [
  {
    icon: Shuffle,
    title: "Instant matching",
    body: "One tap pairs you with a random person who's online right now.",
  },
  {
    icon: EyeOff,
    title: "Stay anonymous",
    body: "Strangers never see your name, photo or email — just your words.",
  },
  {
    icon: ShieldCheck,
    title: "Real people only",
    body: "Google sign-in keeps bots and spam accounts out of the queue.",
  },
  {
    icon: Lock,
    title: "Nothing stored",
    body: "Messages are relayed live and never saved. When a chat ends, it's gone.",
  },
  {
    icon: SkipForward,
    title: "Skip anytime",
    body: "Not a good match? Press Esc or tap Next to meet someone new.",
  },
  {
    icon: Smartphone,
    title: "No app needed",
    body: "Works in any browser on your phone, tablet or computer.",
  },
];

const steps = [
  {
    title: "Sign in with Google",
    body: "One tap. Your name and photo stay private — strangers only see your messages.",
  },
  {
    title: "Get matched instantly",
    body: "We pair you with a random person who's online and looking to chat right now.",
  },
  {
    title: "Chat or skip",
    body: "Talk as long as you like, or skip to the next stranger whenever you want.",
  },
];

export default async function HomePage() {
  const session = await getServerSession(authOptions);

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
              People are chatting right now
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-6xl">
              Talk to a stranger.
              <br />
              <span className="text-primary">Instantly.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-pretty text-muted-foreground sm:text-lg">
              Free anonymous chat with strangers from around the world. Tap
              start and get matched one-on-one with someone new. Not vibing?
              Skip to the next person in a second.
            </p>
            <div className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
              {session ? (
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/chat">
                    Start chatting
                    <ArrowRight />
                  </Link>
                </Button>
              ) : (
                <SignInButton className="w-full sm:w-auto" />
              )}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Free forever. Be kind — chats are one-on-one and anonymous.
            </p>
          </div>
        </section>

        <section
          aria-labelledby="features-heading"
          className="mx-auto max-w-5xl px-4 pb-16 sm:px-6"
        >
          <h2 id="features-heading" className="sr-only">
            Why chat with strangers on StrangerChat
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
            How to talk to strangers online
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            Random chat in three steps. No profiles to fill out, no swiping, no
            waiting for replies.
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
            A simple, safer way to chat with random people
          </h2>
          <div className="mt-4 space-y-4 text-muted-foreground">
            <p>
              StrangerChat is a free stranger chat site for meeting new people
              through quick, anonymous one-on-one text conversations. Whether
              you&apos;re bored, want to practise your English, need to vent to
              someone who doesn&apos;t know you, or just enjoy random
              conversations, you&apos;re one tap away from someone new.
            </p>
            <p>
              Unlike open chat rooms, every conversation is private between you
              and one stranger. There are no usernames, follower counts or
              profile pictures — just two people talking. And because every
              account is verified with Google, you spend less time dodging bots
              and more time having real conversations.
            </p>
            <p>
              Looking for a replacement since Omegle closed? See{" "}
              <Link
                href="/omegle-alternative"
                className="text-foreground underline underline-offset-2"
              >
                why StrangerChat is the best Omegle alternative
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
            Start a free anonymous chat in seconds.
          </p>
          <div className="mt-6 flex justify-center">
            {session ? (
              <Button asChild size="lg">
                <Link href="/chat">
                  Start chatting
                  <Zap />
                </Link>
              </Button>
            ) : (
              <SignInButton />
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
      <JsonLd data={faqJsonLd} />
    </div>
  );
}
