import { PostHog } from "posthog-node";

const KEY =
  process.env.POSTHOG_KEY?.trim() ||
  process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim() ||
  "";
const HOST = (
  process.env.POSTHOG_HOST?.trim() ||
  process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() ||
  "https://eu.i.posthog.com"
).replace(/\/$/, "");

let client: PostHog | null = null;

function getClient(): PostHog | null {
  if (!KEY) return null;
  if (!client) {
    client = new PostHog(KEY, { host: HOST });
  }
  return client;
}

export function captureServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, string | number | boolean | null>,
) {
  const ph = getClient();
  if (!ph || !distinctId) return;
  try {
    ph.capture({
      distinctId,
      event,
      properties,
    });
  } catch {
    // Analytics should never disrupt realtime chat or chess flow.
  }
}

export async function closeServerAnalytics(): Promise<void> {
  if (!client) return;
  const current = client;
  client = null;
  await current.shutdown();
}
