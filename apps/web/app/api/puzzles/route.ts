import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { CHESS_PUZZLES, getDailyPuzzleIndex } from "@funstranger/protocol";
import { getPuzzleStats, hasDatabase, recordPuzzleSolve } from "@funstranger/db";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const dailyPuzzleId = CHESS_PUZZLES[getDailyPuzzleIndex()]!.id;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({
      authenticated: false,
      stats: {
        dailyPuzzleId,
        dailySolvedToday: false,
        solvedTodayIds: [],
        puzzleRating: 1200,
        dailyStreak: 0,
        bestStreak: 0,
        puzzlesSolved: 0,
      },
    });
  }

  const stats = await getPuzzleStats(userId);
  return NextResponse.json({ authenticated: true, stats });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasDatabase()) {
    return NextResponse.json({ authenticated: true, stats: null });
  }

  let body: { puzzleId?: unknown };
  try {
    body = (await request.json()) as { puzzleId?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof body.puzzleId !== "string" || !body.puzzleId) {
    return NextResponse.json({ error: "Missing puzzleId" }, { status: 400 });
  }

  const stats = await recordPuzzleSolve(userId, body.puzzleId);
  if (!stats) {
    return NextResponse.json({ error: "Unknown puzzleId" }, { status: 400 });
  }
  return NextResponse.json({ authenticated: true, stats });
}
