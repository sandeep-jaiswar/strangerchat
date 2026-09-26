import { getServerSession } from "next-auth";
import Link from "next/link";
import { ArrowRight, EyeOff, ShieldCheck, Shuffle } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { AdSlot } from "@/components/ads/ad-slot";
import { SignInButton } from "@/components/sign-in-button";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { AD_SLOTS } from "@/lib/ads";
import { authOptions } from "@/lib/auth";

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
              Sign in with Google, tap start, and get matched one-on-one with
              someone new. Not vibing? Skip to the next person in a second.
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

        <section className="mx-auto max-w-5xl px-4 pb-12 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {features.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-xl border bg-card p-5">
                <span className="mb-3 flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="size-4" />
                </span>
                <h2 className="font-semibold">{title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
          <AdSlot slot={AD_SLOTS.banner} format="horizontal" />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
