import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ChessKnight, ShieldCheck } from "lucide-react";
import { normalizeInviteCode } from "@funstranger/protocol";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@funstranger/ui/components/card";
import { Logo } from "@/components/logo";
import { SignInButton } from "@/components/sign-in-button";
import { authOptions } from "@/lib/auth";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = {
  ...pageMetadata({
    path: "/chat",
    title: "You're Invited to Chat & Play Chess",
    description:
      "Accept this private Funstranger invite to jump straight into a 1-on-1 chat and live chess game without waiting in queue.",
  }),
  robots: { index: false, follow: false },
};

export default async function InvitePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const invite = normalizeInviteCode(code);
  if (!invite) redirect("/chat");

  const target = `/chat?invite=${invite}`;
  const session = await getServerSession(authOptions);
  if (session?.user) redirect(target);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-10">
      <Logo />
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ChessKnight className="size-6" />
          </div>
          <CardTitle className="text-xl">
            <h1>Private Chess &amp; Chat Invite</h1>
          </CardTitle>
          <CardDescription>
            Someone invited you to a direct 1-on-1 room on Funstranger. Sign in
            with Google in one tap to join immediately.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SignInButton callbackUrl={target} className="w-full" />
          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-success" />
            Your email and real name are never shared.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
