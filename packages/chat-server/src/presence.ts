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
  const redis = getRedis(redisUrl);
  const connSids = await redis.hkeys(`${prefix}conn`);
  if (connSids.length === 0) return new Set();
  const owners = await redis.hmget(`${prefix}owner`, ...connSids);
  return new Set(owners.filter((id): id is string => Boolean(id)));
}

/** Adds a blocked user id to the Redis matchmaking block set immediately. */
export async function syncBlockedUser(
  redisUrl: string | undefined,
  prefix: string,
  userId: string,
  blockedId: string,
): Promise<void> {
  if (!redisUrl) return;
  await getRedis(redisUrl).sadd(`${prefix}blocked:${userId}`, blockedId);
}
