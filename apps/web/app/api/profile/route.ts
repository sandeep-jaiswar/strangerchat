import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import {
  ensureUser,
  getPuzzleStats,
  hasDatabase,
  updateUserHandle,
} from "@funstranger/db";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasDatabase()) {
    return NextResponse.json({ profile: null });
  }
  const [profile, stats] = await Promise.all([
    ensureUser(userId),
    getPuzzleStats(userId),
  ]);
  return NextResponse.json({
    profile: profile ? { ...profile, dailyStreak: stats.dailyStreak } : null,
  });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { handle?: unknown };
  try {
    body = (await request.json()) as { handle?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof body.handle !== "string") {
    return NextResponse.json({ error: "Handle is required" }, { status: 400 });
  }

  const result = await updateUserHandle(userId, body.handle);
  if (!result.ok) {
    const message =
      result.error === "invalid"
        ? "Handle must be 3-24 letters, numbers, or underscores."
        : result.error === "taken"
          ? "That handle is already taken."
          : "Database is not configured.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
  return NextResponse.json({ handle: result.handle });
}
