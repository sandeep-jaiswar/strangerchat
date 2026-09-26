import { SignJWT } from "jose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { REALTIME_TOKEN_AUDIENCE } from "@repo/protocol";
import { authOptions } from "@/lib/auth";

/**
 * Issues a short-lived token the browser presents when opening the chat socket,
 * so the realtime server can trust the user without sharing the NextAuth session.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const secret = process.env.REALTIME_JWT_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Realtime server is not configured" },
      { status: 500 },
    );
  }

  const token = await new SignJWT()
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setAudience(REALTIME_TOKEN_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("2m")
    .sign(new TextEncoder().encode(secret));

  return NextResponse.json(
    { token },
    { headers: { "Cache-Control": "no-store" } },
  );
}
