import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { getOnlineUserIds, redisPrefix, syncBlockedUser } from "@repo/chat-server";
import {
  blockUser,
  ensureUser,
  hasDatabase,
  listFriendsAndRequests,
  removeFriend,
  respondFriendRequest,
} from "@repo/db";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasDatabase()) {
    return NextResponse.json({ friends: [], incoming: [], outgoing: [] });
  }

  await ensureUser(userId);
  const [data, onlineIds] = await Promise.all([
    listFriendsAndRequests(userId),
    getOnlineUserIds(
      process.env.REDIS_URL ?? process.env.KV_URL,
      redisPrefix(),
    ).catch(() => new Set<string>()),
  ]);

  return NextResponse.json({
    friends: data.friends.map((f) => ({ ...f, online: onlineIds.has(f.id) })),
    incoming: data.incoming,
    outgoing: data.outgoing,
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasDatabase()) {
    return NextResponse.json(
      { error: "Database is not configured" },
      { status: 503 },
    );
  }

  let body: { action?: unknown; targetId?: unknown };
  try {
    body = (await request.json()) as { action?: unknown; targetId?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof body.targetId !== "string" || !body.targetId) {
    return NextResponse.json({ error: "Missing targetId" }, { status: 400 });
  }

  switch (body.action) {
    case "accept":
      await respondFriendRequest(userId, body.targetId, true);
      return NextResponse.json({ ok: true });
    case "decline":
      await respondFriendRequest(userId, body.targetId, false);
      return NextResponse.json({ ok: true });
    case "remove":
      await removeFriend(userId, body.targetId);
      return NextResponse.json({ ok: true });
    case "block":
      await blockUser(userId, body.targetId);
      await syncBlockedUser(
        process.env.REDIS_URL ?? process.env.KV_URL,
        redisPrefix(),
        userId,
        body.targetId,
      ).catch(() => undefined);
      return NextResponse.json({ ok: true });
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
