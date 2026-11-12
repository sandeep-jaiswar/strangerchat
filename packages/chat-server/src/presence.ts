import { Redis } from "ioredis";

let sharedRedis: Redis | undefined;

function getRedis(redisUrl: string): Redis {
  sharedRedis ??= new Redis(redisUrl, { maxRetriesPerRequest: 2 });
  return sharedRedis;
}

/** Returns the set of user ids that currently have at least one connected socket. */
export async function getOnlineUserIds(
  redisUrl: string | undefined,
  prefix: string,
): Promise<Set<string>> {
  if (!redisUrl) return new Set();
  const ids = await getRedis(redisUrl).smembers(`${prefix}online_users`);
  return new Set(ids);
}

/**
 * Checks online status for a specific subset of user ids (e.g. a user's friend list)
 * in O(F) instead of scanning all global connections.
 */
export async function filterOnlineUserIds(
  redisUrl: string | undefined,
  prefix: string,
  userIds: string[],
): Promise<Set<string>> {
  if (!redisUrl || userIds.length === 0) return new Set();
  const flags = await getRedis(redisUrl).smismember(
    `${prefix}online_users`,
    ...userIds,
  );
  const online = new Set<string>();
  for (let i = 0; i < userIds.length; i++) {
    if (flags[i] === 1) online.add(userIds[i]!);
  }
  return online;
}

/** Adds a blocked user id to the Redis matchmaking block set immediately. */
export async function syncBlockedUser(
  redisUrl: string | undefined,
  prefix: string,
  userId: string,
  blockedId: string,
): Promise<void> {
  if (!redisUrl) return;
  const redis = getRedis(redisUrl);
  const key = `${prefix}blocked:${userId}`;
  await redis.sadd(key, blockedId);
  const isOnline = await redis.sismember(`${prefix}online_users`, userId);
  if (!isOnline) await redis.expire(key, 300);
}

/** Closes the shared presence Redis client (useful for clean shutdown/tests). */
export async function closePresenceRedis(): Promise<void> {
  if (!sharedRedis) return;
  const client = sharedRedis;
  sharedRedis = undefined;
  await client.quit();
}
