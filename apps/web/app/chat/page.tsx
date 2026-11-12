import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { normalizeInviteCode } from "@funstranger/protocol";
import { ChatRoom } from "@/components/chat/chat-room";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Chat",
  robots: { index: false, follow: false },
};

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const invite = normalizeInviteCode(
    typeof params.invite === "string" ? params.invite : undefined,
  );
  const callbackPath = invite ? `/chat?invite=${invite}` : "/chat";

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackPath)}`);
  }

  return <ChatRoom user={session.user} initialInviteCode={invite} />;
}
