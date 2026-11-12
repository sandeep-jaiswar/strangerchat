import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import {
  deletePushSubscription,
  getVapidPublicKey,
  hasDatabase,
  hasWebPushConfigured,
  savePushSubscription,
} from "@funstranger/db";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const supported = hasDatabase() && hasWebPushConfigured();
  return NextResponse.json({
    supported,
    publicKey: supported ? getVapidPublicKey() : null,
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasDatabase() || !hasWebPushConfigured()) {
    return NextResponse.json(
      { error: "Web Push is not configured." },
      { status: 503 },
    );
  }

  let body: {
    endpoint?: unknown;
    keys?: { p256dh?: unknown; auth?: unknown };
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (
    typeof body.endpoint !== "string" ||
    typeof body.keys?.p256dh !== "string" ||
    typeof body.keys?.auth !== "string"
  ) {
    return NextResponse.json(
      { error: "Invalid push subscription" },
      { status: 400 },
    );
  }

  await savePushSubscription(userId, {
    endpoint: body.endpoint,
    p256dh: body.keys.p256dh,
    auth: body.keys.auth,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: { endpoint?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof body.endpoint === "string" && body.endpoint) {
    await deletePushSubscription(userId, body.endpoint);
  }
  return NextResponse.json({ ok: true });
}
