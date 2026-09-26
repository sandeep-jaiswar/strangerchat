import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ChatRoom } from "@/components/chat/chat-room";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Chat",
  robots: { index: false, follow: false },
};

export default async function ChatPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/chat");

  return <ChatRoom user={session.user} />;
}
