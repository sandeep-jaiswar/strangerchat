/**
 * Lua scripts that keep matchmaking consistent across function instances.
 * Each runs atomically in Redis, so two instances can never pair the same person twice.
 *
 * Keys, all under a prefix P (e.g. "sc:"):
 *   P..online        sorted set: session id -> expiry time (ms); live while expiry > now
 *   P..owner         hash: session id -> user id
 *   P..queue         list of session ids waiting for a partner
 *   P..pair:<sid>    the partner's session id
 *   P..last:<sid>    the user id of the previous partner, to avoid instant rematches
 * Channel P..to:<sid> carries serialized ServerEvents to whichever instance holds that session.
 */

const PARTNER_LEFT = JSON.stringify({ type: "partner_left" });
const MATCHED = JSON.stringify({ type: "matched" });

/** Ends a session's chat and tells the partner, if the pairing is still mutual. */
const unpair = `
local function unpair(P, sid)
  local partner = redis.call('GET', P .. 'pair:' .. sid)
  if not partner then return end
  redis.call('DEL', P .. 'pair:' .. sid)
  if redis.call('GET', P .. 'pair:' .. partner) == sid then
    redis.call('DEL', P .. 'pair:' .. partner)
    redis.call('PUBLISH', P .. 'to:' .. partner, '${PARTNER_LEFT}')
  end
end
`;

/**
 * ARGV: P, sid, userId, expiresAt, now
 * Returns { "forbidden" | ChatPhase, onlineCount }.
 */
export const CLAIM = `
local P, sid, uid = ARGV[1], ARGV[2], ARGV[3]
local owner = redis.call('HGET', P .. 'owner', sid)
if owner and owner ~= uid then return { 'forbidden', 0 } end
redis.call('HSET', P .. 'owner', sid, uid)
redis.call('ZADD', P .. 'online', ARGV[4], sid)
local phase = 'idle'
if redis.call('EXISTS', P .. 'pair:' .. sid) == 1 then
  phase = 'chatting'
elseif redis.call('LPOS', P .. 'queue', sid) then
  phase = 'searching'
end
return { phase, redis.call('ZCOUNT', P .. 'online', ARGV[5], '+inf') }
`;

/**
 * ARGV: P, sid, userId, now
 * Returns 1 when matched (both sides are notified via pub/sub), 0 when queued.
 */
export const FIND = `
${unpair}
local P, sid, uid, now = ARGV[1], ARGV[2], ARGV[3], tonumber(ARGV[4])
redis.call('LREM', P .. 'queue', 0, sid)
unpair(P, sid)
local myLast = redis.call('GET', P .. 'last:' .. sid)
for _, candidate in ipairs(redis.call('LRANGE', P .. 'queue', 0, 99)) do
  local expiry = redis.call('ZSCORE', P .. 'online', candidate)
  local candidateUser = redis.call('HGET', P .. 'owner', candidate)
  if not expiry or tonumber(expiry) <= now or not candidateUser then
    redis.call('LREM', P .. 'queue', 0, candidate)
  elseif candidateUser ~= uid
    and candidateUser ~= myLast
    and redis.call('GET', P .. 'last:' .. candidate) ~= uid then
    redis.call('LREM', P .. 'queue', 0, candidate)
    redis.call('SET', P .. 'pair:' .. sid, candidate, 'EX', 86400)
    redis.call('SET', P .. 'pair:' .. candidate, sid, 'EX', 86400)
    redis.call('SET', P .. 'last:' .. sid, candidateUser, 'EX', 3600)
    redis.call('SET', P .. 'last:' .. candidate, uid, 'EX', 3600)
    redis.call('PUBLISH', P .. 'to:' .. sid, '${MATCHED}')
    redis.call('PUBLISH', P .. 'to:' .. candidate, '${MATCHED}')
    return 1
  end
end
redis.call('RPUSH', P .. 'queue', sid)
return 0
`;

/** ARGV: P, sid */
export const LEAVE = `
${unpair}
local P, sid = ARGV[1], ARGV[2]
redis.call('LREM', P .. 'queue', 0, sid)
unpair(P, sid)
return 1
`;

/**
 * ARGV: P, sid, payload
 * Returns 1 if delivered to a partner, 0 if the session isn't in a chat.
 */
export const RELAY = `
local P, sid = ARGV[1], ARGV[2]
local partner = redis.call('GET', P .. 'pair:' .. sid)
if not partner then return 0 end
redis.call('PUBLISH', P .. 'to:' .. partner, ARGV[3])
return 1
`;

/**
 * ARGV: P, expiresAt, sid1, sid2, ...
 * Extends each live session. Returns the ids that were already reaped.
 */
export const TOUCH = `
local P, expiresAt = ARGV[1], ARGV[2]
local missing = {}
for i = 3, #ARGV do
  if redis.call('ZSCORE', P .. 'online', ARGV[i]) then
    redis.call('ZADD', P .. 'online', expiresAt, ARGV[i])
  else
    table.insert(missing, ARGV[i])
  end
end
return missing
`;

/**
 * ARGV: P, now
 * Removes sessions whose expiry has passed, ending their chats. Returns the online count.
 */
export const REAP = `
${unpair}
local P, now = ARGV[1], ARGV[2]
for _, sid in ipairs(redis.call('ZRANGEBYSCORE', P .. 'online', '-inf', '(' .. now, 'LIMIT', 0, 200)) do
  redis.call('ZREM', P .. 'online', sid)
  redis.call('HDEL', P .. 'owner', sid)
  redis.call('LREM', P .. 'queue', 0, sid)
  unpair(P, sid)
end
return redis.call('ZCOUNT', P .. 'online', now, '+inf')
`;
