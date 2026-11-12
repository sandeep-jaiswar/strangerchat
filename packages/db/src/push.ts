import { and, count, eq } from "drizzle-orm";
import { sendNotification } from "web-push";
import { getDb } from "./client.ts";
import { pushSubscriptions, users } from "./schema.ts";

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
  if (!isSafePushEndpoint(sub.endpoint)) return false;
  return db.transaction(async (tx) => {
    // Serialize registrations for this account so concurrent requests cannot exceed the cap.
    await tx
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .for("update");
    const [existing] = await tx
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, sub.endpoint));
    if (existing && existing.userId !== userId) return false;
    if (!existing) {
      const [total] = await tx
        .select({ value: count() })
        .from(pushSubscriptions)
        .where(eq(pushSubscriptions.userId, userId));
      if ((total?.value ?? 0) >= 5) return false;
    }
    const saved = await tx
      .insert(pushSubscriptions)
      .values({ userId, ...sub })
      .onConflictDoUpdate({
        target: pushSubscriptions.endpoint,
        set: { p256dh: sub.p256dh, auth: sub.auth },
        setWhere: eq(pushSubscriptions.userId, userId),
      })
      .returning({ id: pushSubscriptions.id });
    return saved.length > 0;
  });
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

  for (let offset = 0; offset < subs.length; offset += 4) {
    await Promise.all(
      subs.slice(offset, offset + 4).map(async (sub) => {
        if (!isSafePushEndpoint(sub.endpoint)) return;
        try {
          await sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            message,
            { vapidDetails, timeout: 10_000 },
          );
        } catch (err: unknown) {
          const statusCode =
            typeof err === "object" && err !== null && "statusCode" in err
              ? Number((err as { statusCode?: unknown }).statusCode)
              : 0;
          if (statusCode === 404 || statusCode === 410) {
            await deletePushSubscription(userId, sub.endpoint).catch(
              () => undefined,
            );
          }
        }
      }),
    );
  }
}

/** Only browser push services we can identify are permitted; arbitrary HTTPS hosts are unsafe. */
export function isSafePushEndpoint(endpoint: string): boolean {
  try {
    const url = new URL(endpoint);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.port &&
      !url.hash &&
      (url.hostname === "fcm.googleapis.com" ||
        url.hostname === "updates.push.services.mozilla.com" ||
        url.hostname === "web.push.apple.com")
    );
  } catch {
    return false;
  }
}

export async function hasPushSubscription(
  userId: string,
  endpoint: string,
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const [sub] = await db
    .select({ id: pushSubscriptions.id })
    .from(pushSubscriptions)
    .where(
      and(
        eq(pushSubscriptions.userId, userId),
        eq(pushSubscriptions.endpoint, endpoint),
      ),
    );
  return Boolean(sub);
}
