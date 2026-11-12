import { randomBytes } from "node:crypto";
import { and, asc, countDistinct, desc, eq, gte, or, sql } from "drizzle-orm";
import { getDb } from "./client.ts";
import { generateHandle, isValidHandle } from "./handles.ts";
import {
  chessGames,
  directMessages,
  friendships,
  userBlocks,
  userReports,
  users,
} from "./schema.ts";

export interface UserProfile {
  id: string;
  handle: string;
  avatarSeed: string;
  chessRating: number;
  chessWins: number;
  chessLosses: number;
  chessDraws: number;
  bannedUntil: Date | null;
}

export interface FriendSummary {
  id: string;
  handle: string;
  avatarSeed: string;
  chessRating: number;
}

export interface DirectMessageItem {
  id: string;
  senderId: string;
  recipientId: string;
  body: string;
  createdAt: number;
}

function orderedPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export async function ensureUser(userId: string): Promise<UserProfile | null> {
  const db = await getDb();
  if (!db) return null;

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (existing[0]) return existing[0];

  const avatarSeed = randomBytes(8).toString("hex");
  for (let attempt = 0; attempt < 6; attempt++) {
    const handle =
      attempt < 5
        ? generateHandle()
        : `Player_${randomBytes(4).toString("hex")}`;
    try {
      const inserted = await db
        .insert(users)
        .values({ id: userId, handle, avatarSeed })
        .onConflictDoNothing()
        .returning();
      if (inserted[0]) return inserted[0];
      const raceWinner = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      if (raceWinner[0]) return raceWinner[0];
    } catch {
      // Retry on handle uniqueness collision.
    }
  }
  return null;
}

export async function updateUserHandle(
  userId: string,
  handle: string,
): Promise<{ ok: true; handle: string } | { ok: false; error: "invalid" | "taken" | "unavailable" }> {
  const trimmed = handle.trim();
  if (!isValidHandle(trimmed)) return { ok: false, error: "invalid" };
  const db = await getDb();
  if (!db) return { ok: false, error: "unavailable" };

  await ensureUser(userId);
  try {
    await db
      .update(users)
      .set({ handle: trimmed, updatedAt: new Date() })
      .where(eq(users.id, userId));
    return { ok: true, handle: trimmed };
  } catch {
    return { ok: false, error: "taken" };
  }
}

export async function isUserBanned(userId: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const row = await db
    .select({ bannedUntil: users.bannedUntil })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  const until = row[0]?.bannedUntil;
  return Boolean(until && until.getTime() > Date.now());
}

export async function getBlockedRelationIds(userId: string): Promise<string[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      blockerId: userBlocks.blockerId,
      blockedId: userBlocks.blockedId,
    })
    .from(userBlocks)
    .where(
      or(eq(userBlocks.blockerId, userId), eq(userBlocks.blockedId, userId)),
    );
  const ids = new Set<string>();
  for (const row of rows) {
    ids.add(row.blockerId === userId ? row.blockedId : row.blockerId);
  }
  return [...ids];
}

export async function isBlockedBetween(a: string, b: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const rows = await db
    .select({ blockerId: userBlocks.blockerId })
    .from(userBlocks)
    .where(
      or(
        and(eq(userBlocks.blockerId, a), eq(userBlocks.blockedId, b)),
        and(eq(userBlocks.blockerId, b), eq(userBlocks.blockedId, a)),
      ),
    )
    .limit(1);
  return rows.length > 0;
}

export async function blockUser(
  blockerId: string,
  blockedId: string,
): Promise<boolean> {
  if (blockerId === blockedId) return false;
  const db = await getDb();
  if (!db) return false;
  await ensureUser(blockerId);
  await ensureUser(blockedId);
  const [low, high] = orderedPair(blockerId, blockedId);
  await db.transaction(async (tx) => {
    await tx
      .insert(userBlocks)
      .values({ blockerId, blockedId })
      .onConflictDoNothing();
    await tx
      .delete(friendships)
      .where(
        and(eq(friendships.userLow, low), eq(friendships.userHigh, high)),
      );
  });
  return true;
}

export async function unblockUser(
  blockerId: string,
  blockedId: string,
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  await db
    .delete(userBlocks)
    .where(
      and(
        eq(userBlocks.blockerId, blockerId),
        eq(userBlocks.blockedId, blockedId),
      ),
    );
  return true;
}

export async function reportUser(
  reporterId: string,
  reportedId: string,
  reason: string,
  details?: string,
): Promise<{ autoBanned: boolean }> {
  if (reporterId === reportedId) return { autoBanned: false };
  const db = await getDb();
  if (!db) return { autoBanned: false };

  await ensureUser(reporterId);
  await ensureUser(reportedId);
  await db.insert(userReports).values({
    reporterId,
    reportedId,
    reason: reason.slice(0, 64),
    details: details ? details.slice(0, 500) : null,
  });

  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const res = await db
    .select({ reporters: countDistinct(userReports.reporterId) })
    .from(userReports)
    .where(
      and(
        eq(userReports.reportedId, reportedId),
        gte(userReports.createdAt, dayAgo),
      ),
    );
  const count = Number(res[0]?.reporters ?? 0);
  if (count >= 5) {
    const until = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await db
      .update(users)
      .set({ bannedUntil: until, updatedAt: new Date() })
      .where(eq(users.id, reportedId));
    return { autoBanned: true };
  }
  return { autoBanned: false };
}

export async function requestOrAcceptFriend(
  fromUserId: string,
  toUserId: string,
): Promise<{ status: "pending" | "accepted" | "blocked" | "unavailable" }> {
  if (fromUserId === toUserId) return { status: "unavailable" };
  const db = await getDb();
  if (!db) return { status: "unavailable" };

  await ensureUser(fromUserId);
  await ensureUser(toUserId);
  if (await isBlockedBetween(fromUserId, toUserId)) {
    return { status: "blocked" };
  }

  const [low, high] = orderedPair(fromUserId, toUserId);
  const existing = await db
    .select()
    .from(friendships)
    .where(and(eq(friendships.userLow, low), eq(friendships.userHigh, high)))
    .limit(1);

  const row = existing[0];
  if (row) {
    if (row.status === "accepted") return { status: "accepted" };
    if (row.requestedBy !== fromUserId) {
      await db
        .update(friendships)
        .set({ status: "accepted", updatedAt: new Date() })
        .where(eq(friendships.id, row.id));
      return { status: "accepted" };
    }
    return { status: "pending" };
  }

  await db
    .insert(friendships)
    .values({
      userLow: low,
      userHigh: high,
      requestedBy: fromUserId,
      status: "pending",
    })
    .onConflictDoNothing();
  return { status: "pending" };
}

export async function respondFriendRequest(
  userId: string,
  otherUserId: string,
  accept: boolean,
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const [low, high] = orderedPair(userId, otherUserId);
  if (accept) {
    const updated = await db
      .update(friendships)
      .set({ status: "accepted", updatedAt: new Date() })
      .where(
        and(
          eq(friendships.userLow, low),
          eq(friendships.userHigh, high),
          eq(friendships.status, "pending"),
          sql`${friendships.requestedBy} <> ${userId}`,
        ),
      )
      .returning({ id: friendships.id });
    return updated.length > 0;
  }
  await db
    .delete(friendships)
    .where(
      and(
        eq(friendships.userLow, low),
        eq(friendships.userHigh, high),
        eq(friendships.status, "pending"),
      ),
    );
  return true;
}

export async function removeFriend(
  userId: string,
  otherUserId: string,
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const [low, high] = orderedPair(userId, otherUserId);
  await db
    .delete(friendships)
    .where(and(eq(friendships.userLow, low), eq(friendships.userHigh, high)));
}

export async function areFriends(a: string, b: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const [low, high] = orderedPair(a, b);
  const rows = await db
    .select({ id: friendships.id })
    .from(friendships)
    .where(
      and(
        eq(friendships.userLow, low),
        eq(friendships.userHigh, high),
        eq(friendships.status, "accepted"),
      ),
    )
    .limit(1);
  return rows.length > 0;
}

export async function listFriendsAndRequests(userId: string): Promise<{
  friends: FriendSummary[];
  incoming: FriendSummary[];
  outgoing: FriendSummary[];
}> {
  const db = await getDb();
  if (!db) return { friends: [], incoming: [], outgoing: [] };

  const rows = await db
    .select()
    .from(friendships)
    .where(
      or(eq(friendships.userLow, userId), eq(friendships.userHigh, userId)),
    );
  if (rows.length === 0) return { friends: [], incoming: [], outgoing: [] };

  const otherIds = rows.map((r) =>
    r.userLow === userId ? r.userHigh : r.userLow,
  );
  const profiles = await db
    .select({
      id: users.id,
      handle: users.handle,
      avatarSeed: users.avatarSeed,
      chessRating: users.chessRating,
    })
    .from(users)
    .where(sql`${users.id} IN ${otherIds}`);
  const byId = new Map(profiles.map((p) => [p.id, p]));

  const friends: FriendSummary[] = [];
  const incoming: FriendSummary[] = [];
  const outgoing: FriendSummary[] = [];

  for (const row of rows) {
    const otherId = row.userLow === userId ? row.userHigh : row.userLow;
    const profile = byId.get(otherId);
    if (!profile) continue;
    if (row.status === "accepted") {
      friends.push(profile);
    } else if (row.requestedBy === userId) {
      outgoing.push(profile);
    } else {
      incoming.push(profile);
    }
  }
  return { friends, incoming, outgoing };
}

export async function listDirectMessages(
  userA: string,
  userB: string,
  limit = 60,
): Promise<DirectMessageItem[]> {
  const db = await getDb();
  if (!db) return [];
  if (!(await areFriends(userA, userB))) return [];

  const rows = await db
    .select()
    .from(directMessages)
    .where(
      or(
        and(
          eq(directMessages.senderId, userA),
          eq(directMessages.recipientId, userB),
        ),
        and(
          eq(directMessages.senderId, userB),
          eq(directMessages.recipientId, userA),
        ),
      ),
    )
    .orderBy(desc(directMessages.createdAt))
    .limit(limit);

  return rows.reverse().map((r) => ({
    id: r.id,
    senderId: r.senderId,
    recipientId: r.recipientId,
    body: r.body,
    createdAt: r.createdAt.getTime(),
  }));
}

export async function saveDirectMessage(
  senderId: string,
  recipientId: string,
  body: string,
): Promise<DirectMessageItem | null> {
  const db = await getDb();
  if (!db) return null;
  if (!(await areFriends(senderId, recipientId))) return null;

  const trimmed = body.trim();
  if (!trimmed) return null;

  const inserted = await db
    .insert(directMessages)
    .values({ senderId, recipientId, body: trimmed.slice(0, 1000) })
    .returning();
  const row = inserted[0];
  if (!row) return null;
  return {
    id: row.id,
    senderId: row.senderId,
    recipientId: row.recipientId,
    body: row.body,
    createdAt: row.createdAt.getTime(),
  };
}

export async function recordChessGameAndUpdateElo(input: {
  whiteId: string;
  blackId: string;
  result: "1-0" | "0-1" | "1/2-1/2" | "aborted";
  reason: string;
  moves: string[];
}): Promise<void> {
  if (
    input.result === "aborted" ||
    input.moves.length < 2 ||
    input.whiteId === input.blackId
  ) {
    return;
  }
  const db = await getDb();
  if (!db) return;

  await ensureUser(input.whiteId);
  await ensureUser(input.blackId);

  const scoreWhite =
    input.result === "1-0" ? 1 : input.result === "0-1" ? 0 : 0.5;
  const scoreBlack = 1 - scoreWhite;

  await db.transaction(async (tx) => {
    await tx.insert(chessGames).values({
      whiteId: input.whiteId,
      blackId: input.blackId,
      result: input.result,
      reason: input.reason,
      moves: JSON.stringify(input.moves),
    });

    const rows = await tx
      .select({ id: users.id, chessRating: users.chessRating })
      .from(users)
      .where(or(eq(users.id, input.whiteId), eq(users.id, input.blackId)));
    const white = rows.find((r) => r.id === input.whiteId);
    const black = rows.find((r) => r.id === input.blackId);
    if (!white || !black) return;

    const expectedWhite =
      1 / (1 + 10 ** ((black.chessRating - white.chessRating) / 400));
    const expectedBlack = 1 - expectedWhite;
    const K = 32;
    const newWhite = Math.max(
      100,
      Math.round(white.chessRating + K * (scoreWhite - expectedWhite)),
    );
    const newBlack = Math.max(
      100,
      Math.round(black.chessRating + K * (scoreBlack - expectedBlack)),
    );

    await tx
      .update(users)
      .set({
        chessRating: newWhite,
        chessWins:
          scoreWhite === 1 ? sql`${users.chessWins} + 1` : users.chessWins,
        chessLosses:
          scoreWhite === 0 ? sql`${users.chessLosses} + 1` : users.chessLosses,
        chessDraws:
          scoreWhite === 0.5 ? sql`${users.chessDraws} + 1` : users.chessDraws,
        updatedAt: new Date(),
      })
      .where(eq(users.id, input.whiteId));

    await tx
      .update(users)
      .set({
        chessRating: newBlack,
        chessWins:
          scoreBlack === 1 ? sql`${users.chessWins} + 1` : users.chessWins,
        chessLosses:
          scoreBlack === 0 ? sql`${users.chessLosses} + 1` : users.chessLosses,
        chessDraws:
          scoreBlack === 0.5 ? sql`${users.chessDraws} + 1` : users.chessDraws,
        updatedAt: new Date(),
      })
      .where(eq(users.id, input.blackId));
  });
}

export { asc };
