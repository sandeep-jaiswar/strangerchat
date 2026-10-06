import { Hub } from "./hub.ts";

export { Hub, type HubOptions } from "./hub.ts";
export { authenticate, isAllowedOrigin, isValidSessionId } from "./auth.ts";

let hub: Hub | undefined;

/**
 * Namespace for this deployment's keys. Everything that shares one (online count, queues,
 * pairs, games) is one pool of people, so separate environments on the same Redis must
 * not share it: Vercel previews get their own, and CHAT_REDIS_PREFIX sets it explicitly.
 */
export function redisPrefix(
  env: Record<string, string | undefined> = process.env,
): string {
  if (env.CHAT_REDIS_PREFIX) return env.CHAT_REDIS_PREFIX;
  if (env.VERCEL_ENV && env.VERCEL_ENV !== "production") {
    return `sc:${env.VERCEL_ENV}:`;
  }
  return "sc:";
}

/** The hub for this process, created on first use. */
export function getHub(): Hub {
  const redisUrl = process.env.REDIS_URL ?? process.env.KV_URL;
  if (!redisUrl) throw new Error("REDIS_URL is not set.");
  hub ??= new Hub({ redisUrl, prefix: redisPrefix() });
  return hub;
}
