/**
 * Lua scripts that keep chat state consistent across function instances. Each runs
 * atomically in Redis, so two instances can never pair the same person twice.
 *
 * Terms
 *   user        a Google account (NextAuth `sub`)
 *   session     one browser tab's chat, identified by a random id (sid) that survives reconnects
 *   connection  the socket currently serving a session; a session can outlive it for a grace period
 *
 * Keys, all under a prefix P (e.g. "sc:")
 *   P..sess          sorted set  sid -> expiry (ms). Refreshed while connected; once it lapses the session is reaped.
 *   P..owner         hash        sid -> user id
 *   P..conn          hash        sid -> id of the connection serving it. Absent while the session is reconnecting.
 *   P..queue         list        connected sessions waiting for a partner, oldest first
 *   P..scan           hash        sid -> next candidate offset in the queue
 *   P..fallback       hash        sid -> previous partner considered during a paginated scan
 *   P..retry          string      next queue offset for the periodic retry pass
 *   P..pair:<sid>    string      partner's sid
 *   P..inbox:<sid>   list        messages that arrived while the session was reconnecting
 *   P..ended:<u>:<v> string      when users u and v (sorted) last stopped chatting (ms), for the rematch rule
 *   channel P..to:<sid>          serialized ServerEvents for whichever instance holds that session
 *
 * Every script takes the same leading arguments:
 *   ARGV[1] P, ARGV[2] now (ms), ARGV[3] rematch block (ms), ARGV[4] rematch preference window (ms)
 * followed by its own arguments from ARGV[5].
 */

const PARTNER_LEFT = JSON.stringify({ type: "partner_left" });
const MATCHED = JSON.stringify({ type: "matched" });

const LIB = `
local P, NOW = ARGV[1], tonumber(ARGV[2])
local REMATCH_BLOCK, REMATCH_WINDOW = tonumber(ARGV[3]), tonumber(ARGV[4])

local function endedKey(u, v)
  if u < v then return P .. 'ended:' .. u .. ':' .. v end
  return P .. 'ended:' .. v .. ':' .. u
end

local function isConnected(sid)
  return redis.call('HEXISTS', P .. 'conn', sid) == 1
end

-- Ends a session's chat, tells the partner and records when the two users stopped chatting.
local function unpair(sid)
  local partner = redis.call('GET', P .. 'pair:' .. sid)
  if not partner then return end
  redis.call('DEL', P .. 'pair:' .. sid)
  if redis.call('GET', P .. 'pair:' .. partner) ~= sid then return end
  redis.call('DEL', P .. 'pair:' .. partner)
  redis.call('PUBLISH', P .. 'to:' .. partner, '${PARTNER_LEFT}')
  local u = redis.call('HGET', P .. 'owner', sid)
  local v = redis.call('HGET', P .. 'owner', partner)
  if u and v then
    redis.call('SET', endedKey(u, v), ARGV[2], 'PX', ARGV[4])
  end
end

local function removeQueued(sid)
  redis.call('LREM', P .. 'queue', 0, sid)
  redis.call('HDEL', P .. 'scan', sid)
  redis.call('HDEL', P .. 'fallback', sid)
end

local function makePair(a, b)
  removeQueued(a)
  removeQueued(b)
  redis.call('SET', P .. 'pair:' .. a, b)
  redis.call('SET', P .. 'pair:' .. b, a)
  redis.call('PUBLISH', P .. 'to:' .. a, '${MATCHED}')
  redis.call('PUBLISH', P .. 'to:' .. b, '${MATCHED}')
end

-- Pairs a queued session with the longest-waiting eligible session. Eligible: connected,
-- a different user, and not someone this user stopped chatting with less than
-- REMATCH_BLOCK ago. Within REMATCH_WINDOW a previous partner is only chosen when nobody
-- new is waiting. Scans at most 100 candidates per call, continuing on the next retry.
-- A previous partner is only picked after reaching the end. Returns true when paired.
local function matchOne(sid)
  local uid = redis.call('HGET', P .. 'owner', sid)
  if not uid or not isConnected(sid) then
    removeQueued(sid)
    return false
  end
  local size = redis.call('LLEN', P .. 'queue')
  local offset = tonumber(redis.call('HGET', P .. 'scan', sid)) or 0
  local fallback = redis.call('HGET', P .. 'fallback', sid)
  local candidates = redis.call('LRANGE', P .. 'queue', offset, offset + 99)
  local removed = 0
  for _, candidate in ipairs(candidates) do
    if candidate ~= sid then
      local other = redis.call('HGET', P .. 'owner', candidate)
      if not other or not isConnected(candidate) then
        removeQueued(candidate)
        removed = removed + 1
      elseif other ~= uid then
        local ended = redis.call('GET', endedKey(uid, other))
        if not ended then
          makePair(sid, candidate)
          return true
        end
        if not fallback and NOW - tonumber(ended) >= REMATCH_BLOCK then
          fallback = candidate
        end
      end
    end
  end
  if offset + #candidates < size then
    redis.call('HSET', P .. 'scan', sid, offset + #candidates - removed)
    if fallback then redis.call('HSET', P .. 'fallback', sid, fallback) end
    return false
  end
  redis.call('HDEL', P .. 'scan', sid)
  redis.call('HDEL', P .. 'fallback', sid)
  -- The fallback may have left or matched while we scanned later pages.
  if fallback and isConnected(fallback) and redis.call('LPOS', P .. 'queue', fallback) then
    local other = redis.call('HGET', P .. 'owner', fallback)
    if other and other ~= uid then
      local ended = redis.call('GET', endedKey(uid, other))
      if not ended or NOW - tonumber(ended) >= REMATCH_BLOCK then
        makePair(sid, fallback)
        return true
      end
    end
  end
  return false
end

-- Distinct users with at least one connected session.
local function countOnline()
  local seen, count = {}, 0
  for _, sid in ipairs(redis.call('HKEYS', P .. 'conn')) do
    local uid = redis.call('HGET', P .. 'owner', sid)
    if uid and not seen[uid] then
      seen[uid] = true
      count = count + 1
    end
  end
  return count
end

-- Removes every trace of a session, ending its chat first.
local function endSession(sid)
  unpair(sid)
  removeQueued(sid)
  redis.call('ZREM', P .. 'sess', sid)
  redis.call('HDEL', P .. 'owner', sid)
  redis.call('HDEL', P .. 'conn', sid)
  redis.call('DEL', P .. 'inbox:' .. sid)
end
`;

/**
 * A connection starts serving a session (new or resumed).
 * ARGV[5..8]: sid, userId, connectionId, expiresAt
 * Returns { "forbidden" } or { phase, onlineCount, ...messages held while reconnecting }.
 */
export const CLAIM = `${LIB}
local sid, uid, connectionId, expiresAt = ARGV[5], ARGV[6], ARGV[7], ARGV[8]
local owner = redis.call('HGET', P .. 'owner', sid)
if owner and owner ~= uid then return { 'forbidden' } end
redis.call('HSET', P .. 'owner', sid, uid)
redis.call('HSET', P .. 'conn', sid, connectionId)
redis.call('ZADD', P .. 'sess', expiresAt, sid)

local phase = 'idle'
if redis.call('EXISTS', P .. 'pair:' .. sid) == 1 then
  phase = 'chatting'
elseif redis.call('LPOS', P .. 'queue', sid) then
  phase = 'searching'
end
local result = { phase, countOnline() }
for _, message in ipairs(redis.call('LRANGE', P .. 'inbox:' .. sid, 0, -1)) do
  table.insert(result, message)
end
redis.call('DEL', P .. 'inbox:' .. sid)
return result
`;

/**
 * A connection closed without saying goodbye. The session stays (and its chat stays open)
 * until it reconnects or its expiry lapses, but it stops waiting in the queue.
 * Restores undelivered CLAIM messages even if a newer connection took over.
 * Only the current connection can remove connection and queue state.
 * ARGV[5..6]: sid, connectionId; ARGV[7..]: undelivered messages
 */
export const DETACH = `${LIB}
local sid, connectionId = ARGV[5], ARGV[6]
if #ARGV >= 7 and redis.call('ZSCORE', P .. 'sess', sid) then
  local inbox = P .. 'inbox:' .. sid
  -- Claimed messages precede anything queued since CLAIM drained the inbox.
  for i = #ARGV, 7, -1 do redis.call('LPUSH', inbox, ARGV[i]) end
  redis.call('LTRIM', inbox, -50, -1)
end
if redis.call('HGET', P .. 'conn', sid) ~= connectionId then return 0 end
redis.call('HDEL', P .. 'conn', sid)
removeQueued(sid)
return 1
`;

/** The current connection said goodbye: end the session now. ARGV[5..6]: sid, connectionId */
export const BYE = `${LIB}
if redis.call('HGET', P .. 'conn', ARGV[5]) ~= ARGV[6] then return 0 end
endSession(ARGV[5])
return 1
`;

/**
 * Join the queue (leaving any current chat) and try to match right away.
 * ARGV[5]: sid. Returns 1 when matched (both sides are told via pub/sub), 0 when waiting.
 */
export const FIND = `${LIB}
local sid = ARGV[5]
removeQueued(sid)
unpair(sid)
redis.call('RPUSH', P .. 'queue', sid)
if matchOne(sid) then return 1 end
return 0
`;

/** Leave the current chat or queue. ARGV[5]: sid */
export const LEAVE = `${LIB}
local sid = ARGV[5]
removeQueued(sid)
unpair(sid)
return 1
`;

/**
 * Deliver an event to the session's partner. If the partner is reconnecting and `hold` is 1
 * (chat messages), keep it in their inbox until they are back.
 * ARGV[5..7]: sid, payload, hold. Returns 1 if the session is in a chat, 0 otherwise.
 */
export const RELAY = `${LIB}
local sid, payload, hold = ARGV[5], ARGV[6], ARGV[7]
local partner = redis.call('GET', P .. 'pair:' .. sid)
if not partner then return 0 end
if isConnected(partner) then
  redis.call('PUBLISH', P .. 'to:' .. partner, payload)
elseif hold == '1' then
  local inbox = P .. 'inbox:' .. partner
  redis.call('RPUSH', inbox, payload)
  redis.call('LTRIM', inbox, -50, -1)
end
return 1
`;

/**
 * Extend the sessions this instance serves. ARGV[5]: expiresAt, ARGV[6..]: sids.
 * Returns the sids that no longer exist (reaped while this instance was stalled).
 */
export const TOUCH = `${LIB}
local expiresAt = ARGV[5]
local missing = {}
for i = 6, #ARGV do
  if redis.call('ZSCORE', P .. 'sess', ARGV[i]) then
    redis.call('ZADD', P .. 'sess', expiresAt, ARGV[i])
  else
    table.insert(missing, ARGV[i])
  end
end
return missing
`;

/**
 * Periodic upkeep, run by every instance that serves sockets: reap expired sessions, retry
 * matching for everyone waiting (so rematch blocks that lapse get picked up) and count
 * who is online. Returns the online count.
 */
export const TICK = `${LIB}
for _, sid in ipairs(redis.call('ZRANGEBYSCORE', P .. 'sess', '-inf', '(' .. NOW, 'LIMIT', 0, 200)) do
  endSession(sid)
end
local offset = tonumber(redis.call('GET', P .. 'retry')) or 0
local size = redis.call('LLEN', P .. 'queue')
if offset >= size then offset = 0 end
local waiting = redis.call('LRANGE', P .. 'queue', offset, offset + 99)
for _, sid in ipairs(waiting) do
  if redis.call('LPOS', P .. 'queue', sid) then matchOne(sid) end
end
local nextOffset = offset + #waiting
if nextOffset >= redis.call('LLEN', P .. 'queue') then nextOffset = 0 end
redis.call('SET', P .. 'retry', nextOffset)
return countOnline()
`;
