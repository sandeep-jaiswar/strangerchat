import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { moderateMessageText } from "@repo/chat-server";
import {
  areFriends,
  hasDatabase,
  listDirectMessages,
  saveDirectMessage,
} from "@repo/db";
import { MAX_MESSAGE_LENGTH } from "@repo/protocol";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ friendId: string }> },
) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasDatabase()) return NextResponse.json({ messages: [] });

  const { friendId } = await context.params;
  if (!(await areFriends(userId, friendId))) {
    return NextResponse.json({ error: "Not friends" }, { status: 403 });
  }
  const messages = await listDirectMessages(userId, friendId);
  return NextResponse.json({ messages });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ friendId: string }> },
) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasDatabase()) {
    return NextResponse.json(
      { error: "Database is not configured" },
      { status: 503 },
    );
  }

  const { friendId } = await context.params;
  if (!(await areFriends(userId, friendId))) {
    return NextResponse.json({ error: "Not friends" }, { status: 403 });
  }

  let body: { text?: unknown };
  try {
    body = (await request.json()) as { text?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof body.text !== "string") {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }
  const trimmed = body.text.trim();
  if (!trimmed || trimmed.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: `Messages must be 1-${MAX_MESSAGE_LENGTH} characters.` },
      { status: 400 },
    );
  }

  const { text } = moderateMessageText(trimmed);
  const saved = await saveDirectMessage(userId, friendId, text);
  if (!saved) {
    return NextResponse.json({ error: "Unable to send" }, { status: 400 });
  }
  return NextResponse.json({ message: saved });
}
