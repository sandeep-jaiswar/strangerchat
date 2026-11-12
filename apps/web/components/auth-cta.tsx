"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@repo/ui/components/button";
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
  className,
}: {
  icon?: "arrow" | "zap";
  className?: string;
}) {
  const { data: session } = useSession();
  if (session) {
    return (
      <Button asChild size="lg" className={className}>
        <Link href="/chat">
          Start chatting
          {icon === "zap" ? <Zap /> : <ArrowRight />}
        </Link>
      </Button>
    );
  }
  return <SignInButton className={className} />;
}
