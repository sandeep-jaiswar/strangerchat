"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@funstranger/ui/components/button";
import { captureEvent } from "@/lib/analytics";
import { SignInButton } from "./sign-in-button";
import { UserMenu } from "./user-menu";

export function HeaderAuth() {
  const { data: session } = useSession();
  if (session?.user) return <UserMenu user={session.user} />;
  return (
    <Button asChild size="sm" variant="ghost">
      <Link href="/login">Sign in</Link>
    </Button>
  );
}

export function HeroAuthCta({
  icon = "arrow",
  source = "hero",
  className,
}: {
  icon?: "arrow" | "zap";
  source?: string;
  className?: string;
}) {
  const { data: session } = useSession();
  if (session) {
    return (
      <Button asChild size="lg" className={className}>
        <Link
          href="/chat"
          onClick={() =>
            captureEvent("landing_cta_clicked", {
              authenticated: true,
              source,
            })
          }
        >
          Start chatting
          {icon === "zap" ? <Zap /> : <ArrowRight />}
        </Link>
      </Button>
    );
  }
  return <SignInButton source={source} className={className} />;
}
