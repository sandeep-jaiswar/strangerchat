import { and, eq } from "drizzle-orm";
import { sendNotification } from "web-push";
import { getDb } from "./client.ts";
import { pushSubscriptions } from "./schema.ts";

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

export interface StoredPushSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export function getVapidPublicKey(): string | null {
  return (
    process.env.VAPID_PUBLIC_KEY?.trim() ||
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() ||
    null
  );
}

export function hasWebPushConfigured(): boolean {
  return Boolean(getVapidPublicKey() && process.env.VAPID_PRIVATE_KEY?.trim());
}

function getVapidDetails() {
  const publicKey = getVapidPublicKey();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  if (!publicKey || !privateKey) return null;
  return {
    subject:
      process.env.VAPID_SUBJECT?.trim() || "mailto:jaiswarsandeep119@gmail.com",
    publicKey,
    privateKey,
  };
}

export async function savePushSubscription(
  userId: string,
  sub: StoredPushSubscription,
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  await db
    .insert(pushSubscriptions)
    .values({
      userId,
      endpoint: sub.endpoint,
      p256dh: sub.p256dh,
      auth: sub.auth,
    })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: {
        userId,
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    });
  return true;
}

export async function deletePushSubscription(
  userId: string,
  endpoint: string,
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .delete(pushSubscriptions)
    .where(
      and(
        eq(pushSubscriptions.userId, userId),
        eq(pushSubscriptions.endpoint, endpoint),
      ),
    );
}

export async function sendUserPush(
  userId: string,
  payload: PushPayload,
): Promise<void> {
  const vapidDetails = getVapidDetails();
  if (!vapidDetails) return;
  const db = await getDb();
  if (!db) return;

  const subs = await db
    .select({
      endpoint: pushSubscriptions.endpoint,
      p256dh: pushSubscriptions.p256dh,
      auth: pushSubscriptions.auth,
    })
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, userId));
  if (subs.length === 0) return;

  const message = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url ?? "/chat",
  });

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          message,
          { vapidDetails },
        );
      } catch (err: unknown) {
        const statusCode =
          typeof err === "object" && err !== null && "statusCode" in err
            ? Number((err as { statusCode?: unknown }).statusCode)
            : 0;
        if (statusCode === 404 || statusCode === 410) {
          await deletePushSubscription(userId, sub.endpoint).catch(() => undefined);
        }
      }
    }),
  );
}
