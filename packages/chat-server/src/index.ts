import { Hub } from "./hub.ts";

export { Hub, type HubOptions } from "./hub.ts";
export { authenticate, isAllowedOrigin, isValidSessionId } from "./auth.ts";

let hub: Hub | undefined;

/** The hub for this process, created on first use. */
export function getHub(): Hub {
  const redisUrl = process.env.REDIS_URL ?? process.env.KV_URL;
  if (!redisUrl) throw new Error("REDIS_URL is not set.");
  hub ??= new Hub({ redisUrl });
  return hub;
}
