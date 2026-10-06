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
 *   P..mode          hash        sid -> mode it last searched in ("chat" or "chess"); absent means "chat"
 *   P..queue         list        connected sessions waiting for a chat partner, oldest first
 *   P..queue:chess   list        the same for Chess Club
 *   P..scan           hash        sid -> next candidate offset in its queue
 *   P..fallback       hash        sid -> previous partner considered during a paginated scan
 *   P..retry[:mode]   string      next queue offset for the periodic retry pass over that mode's queue
 *   P..pair:<sid>    string      partner's sid
 *   P..inbox:<sid>   list        messages that arrived while the session was reconnecting
 *   P..ended:<u>:<v> string      when users u and v (sorted) last stopped chatting (ms), for the rematch rule
 *   P..game:<sid>    string      id of the chess game the session is playing with its partner
 *   P..g:<gid>       hash        w, b (sids); wt, bt (ms left on each clock as of turnAt); ply; turnAt (ms);
 *                                status ("playing" | "over"); result; reason; draw, rematch (sid offering)
 *   P..gm:<gid>      list        the game's moves in SAN
 *   P..games         sorted set  gid -> when the side to move runs out of time, for games in progress
 *   P..gseq          string      game id counter
 *   channel P..to:<sid>          serialized ServerEvents for whichever instance holds that session
 *
 * Every script takes the same leading arguments:
 *   ARGV[1] P, ARGV[2] now (ms), ARGV[3] rematch block (ms), ARGV[4] rematch preference window (ms)
 * followed by its own arguments from ARGV[5].
 */

import {
  CHESS_FIRST_MOVE_MS,
  CHESS_INCREMENT_MS,
  CHESS_INITIAL_MS,
} from "@repo/protocol";

const PARTNER_LEFT = JSON.stringify({ type: "partner_left" });

const LIB = `
local P, NOW = ARGV[1], tonumber(ARGV[2])
local REMATCH_BLOCK, REMATCH_WINDOW = tonumber(ARGV[3]), tonumber(ARGV[4])
local INITIAL, INCREMENT, FIRST_MOVE = ${CHESS_INITIAL_MS}, ${CHESS_INCREMENT_MS}, ${CHESS_FIRST_MOVE_MS}
local MODES = { 'chat', 'chess' }

local function modeOf(sid)
  return redis.call('HGET', P .. 'mode', sid) or 'chat'
end

local function queueKey(mode)
  if mode == 'chat' then return P .. 'queue' end
  return P .. 'queue:' .. mode
end

local function endedKey(u, v)
  if u < v then return P .. 'ended:' .. u .. ':' .. v end
  return P .. 'ended:' .. v .. ':' .. u
end

local function isConnected(sid)
  return redis.call('HEXISTS', P .. 'conn', sid) == 1
end

local function gameKey(gid) return P .. 'g:' .. gid end

local function publishToPlayers(gid, payload)
  for _, sid in ipairs(redis.call('HMGET', gameKey(gid), 'w', 'b')) do
    if sid then redis.call('PUBLISH', P .. 'to:' .. sid, payload) end
  end
end

-- When the side to move loses on time (or, before both first moves, the game is aborted).
local function deadlineOf(gid)
  local g = redis.call('HMGET', gameKey(gid), 'wt', 'bt', 'ply', 'turnAt')
  local ply, turnAt = tonumber(g[3]), tonumber(g[4])
  if ply < 2 then return turnAt + FIRST_MOVE end
  if ply % 2 == 0 then return turnAt + tonumber(g[1]) end
  return turnAt + tonumber(g[2])
end

-- Both clocks as of NOW, as a ChessClock.
local function clockOf(gid)
  local g = redis.call('HMGET', gameKey(gid), 'wt', 'bt', 'ply', 'turnAt', 'status')
  local white, black, ply = tonumber(g[1]), tonumber(g[2]), tonumber(g[3])
  local playing = g[5] == 'playing'
  local firstMove = cjson.null
  if playing then
    local elapsed = NOW - tonumber(g[4])
    if ply < 2 then
      firstMove = math.max(0, FIRST_MOVE - elapsed)
    elseif ply % 2 == 0 then
      white = math.max(0, white - elapsed)
    else
      black = math.max(0, black - elapsed)
    end
  end
  return { white = white, black = black, running = playing and ply >= 2, firstMoveMs = firstMove }
end

-- The game as a serialized chess_game event from sid's side, or false when it has none.
local function gameEvent(sid)
  local gid = redis.call('GET', P .. 'game:' .. sid)
  if not gid then return false end
  local g = redis.call('HMGET', gameKey(gid), 'w', 'status', 'result', 'reason', 'draw', 'rematch')
  local function side(offeredBy)
    if not offeredBy then return cjson.null end
    if offeredBy == sid then return 'me' end
    return 'them'
  end
  local game = cjson.encode({
    id = gid,
    color = (g[1] == sid) and 'white' or 'black',
    clock = clockOf(gid),
    status = g[2],
    result = g[3] or cjson.null,
    reason = g[4] or cjson.null,
    offers = { draw = side(g[5]), rematch = side(g[6]) },
  })
  -- cjson can't tell an empty list from an empty object, so the moves are added by hand.
  local moves = {}
  for i, san in ipairs(redis.call('LRANGE', P .. 'gm:' .. gid, 0, -1)) do
    moves[i] = cjson.encode(san)
  end
  return '{"type":"chess_game","game":' .. string.sub(game, 1, -2) ..
    ',"moves":[' .. table.concat(moves, ',') .. ']}}'
end

local function startGame(white, black)
  local gid = tostring(redis.call('INCR', P .. 'gseq'))
  redis.call('HSET', gameKey(gid), 'w', white, 'b', black, 'wt', INITIAL, 'bt', INITIAL,
    'ply', 0, 'turnAt', NOW, 'status', 'playing')
  redis.call('SET', P .. 'game:' .. white, gid)
  redis.call('SET', P .. 'game:' .. black, gid)
  redis.call('ZADD', P .. 'games', deadlineOf(gid), gid)
  redis.call('PUBLISH', P .. 'to:' .. white, gameEvent(white))
  redis.call('PUBLISH', P .. 'to:' .. black, gameEvent(black))
end

-- Ends a game in progress, freezing the clocks, and tells both players.
local function endGame(gid, result, reason)
  local key = gameKey(gid)
  if redis.call('HGET', key, 'status') ~= 'playing' then return false end
  local clock = clockOf(gid)
  redis.call('HSET', key, 'status', 'over', 'result', result, 'reason', reason,
    'wt', clock.white, 'bt', clock.black)
  redis.call('HDEL', key, 'draw')
  redis.call('ZREM', P .. 'games', gid)
  clock.running = false
  clock.firstMoveMs = cjson.null
  publishToPlayers(gid, cjson.encode({ type = 'chess_over', result = result, reason = reason, clock = clock }))
  return true
end

-- Ends the game if its side to move has run out of time.
local function expireGame(gid)
  local key = gameKey(gid)
  if redis.call('HGET', key, 'status') ~= 'playing' then
    redis.call('ZREM', P .. 'games', gid)
    return
  end
  if NOW < deadlineOf(gid) then return end
  local ply = tonumber(redis.call('HGET', key, 'ply'))
  if ply < 2 then
    endGame(gid, 'aborted', 'aborted')
  elseif ply % 2 == 0 then
    endGame(gid, '0-1', 'timeout')
  else
    endGame(gid, '1-0', 'timeout')
  end
end

-- Removes a game; the player who caused it (if any) loses a game in progress.
local function dropGame(gid, leaver)
  local key = gameKey(gid)
  local g = redis.call('HMGET', key, 'w', 'b', 'ply')
  if tonumber(g[3]) < 2 then
    endGame(gid, 'aborted', 'aborted')
  elseif g[1] == leaver then
    endGame(gid, '0-1', 'abandoned')
  else
    endGame(gid, '1-0', 'abandoned')
  end
  for i = 1, 2 do
    if g[i] then redis.call('DEL', P .. 'game:' .. g[i]) end
  end
  redis.call('DEL', key, P .. 'gm:' .. gid)
  redis.call('ZREM', P .. 'games', gid)
end

-- Ends a session's chat (and any game, which the session loses), tells the partner and
-- records when the two users stopped chatting.
local function unpair(sid)
  local partner = redis.call('GET', P .. 'pair:' .. sid)
  if not partner then return end
  local gid = redis.call('GET', P .. 'game:' .. sid)
  if gid then dropGame(gid, sid) end
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
  redis.call('LREM', queueKey(modeOf(sid)), 0, sid)
  redis.call('HDEL', P .. 'scan', sid)
  redis.call('HDEL', P .. 'fallback', sid)
end

local function makePair(a, b, mode)
  removeQueued(a)
  removeQueued(b)
  redis.call('SET', P .. 'pair:' .. a, b)
  redis.call('SET', P .. 'pair:' .. b, a)
  local matched = cjson.encode({ type = 'matched', mode = mode })
  redis.call('PUBLISH', P .. 'to:' .. a, matched)
  redis.call('PUBLISH', P .. 'to:' .. b, matched)
  if mode == 'chess' then
    -- Alternate colours between games, starting from whoever was waiting longer.
    if tonumber(redis.call('GET', P .. 'gseq') or 0) % 2 == 0 then
      startGame(b, a)
    else
      startGame(a, b)
    end
  end
end

-- Pairs a queued session with the longest-waiting eligible session in its mode's queue. Eligible: connected,
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
  local mode = modeOf(sid)
  local queue = queueKey(mode)
  local size = redis.call('LLEN', queue)
  local offset = tonumber(redis.call('HGET', P .. 'scan', sid)) or 0
  local fallback = redis.call('HGET', P .. 'fallback', sid)
  local candidates = redis.call('LRANGE', queue, offset, offset + 99)
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
          makePair(sid, candidate, mode)
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
  if fallback and isConnected(fallback) and redis.call('LPOS', queue, fallback) then
    local other = redis.call('HGET', P .. 'owner', fallback)
    if other and other ~= uid then
      local ended = redis.call('GET', endedKey(uid, other))
      if not ended or NOW - tonumber(ended) >= REMATCH_BLOCK then
        makePair(sid, fallback, mode)
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
  redis.call('HDEL', P .. 'mode', sid)
  redis.call('DEL', P .. 'inbox:' .. sid)
end
`;

/**
 * A connection starts serving a session (new or resumed).
 * ARGV[5..8]: sid, userId, connectionId, expiresAt
 * Returns { "forbidden" } or { phase, onlineCount, chess_game event or "", ...messages held while reconnecting }.
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
elseif redis.call('LPOS', queueKey(modeOf(sid)), sid) then
  phase = 'searching'
end
local result = { phase, countOnline(), gameEvent(sid) or '' }
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
 * Join a mode's queue (leaving any current chat) and try to match right away.
 * ARGV[5..6]: sid, mode (default "chat"). Returns 1 when matched (both sides are told via pub/sub), 0 when waiting.
 */
export const FIND = `${LIB}
local sid, mode = ARGV[5], ARGV[6] or 'chat'
removeQueued(sid)
unpair(sid)
redis.call('HSET', P .. 'mode', sid, mode)
redis.call('RPUSH', queueKey(mode), sid)
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
 * Periodic upkeep, run by every instance that serves sockets: reap expired sessions, end
 * games whose clock ran out, retry matching for everyone waiting (so rematch blocks that
 * lapse get picked up) and count who is online. Returns the online count.
 */
export const TICK = `${LIB}
for _, sid in ipairs(redis.call('ZRANGEBYSCORE', P .. 'sess', '-inf', '(' .. NOW, 'LIMIT', 0, 200)) do
  endSession(sid)
end
for _, gid in ipairs(redis.call('ZRANGEBYSCORE', P .. 'games', '-inf', NOW, 'LIMIT', 0, 200)) do
  expireGame(gid)
end
for _, mode in ipairs(MODES) do
  local queue = queueKey(mode)
  local retry = P .. 'retry'
  if mode ~= 'chat' then retry = retry .. ':' .. mode end
  local offset = tonumber(redis.call('GET', retry)) or 0
  if offset >= redis.call('LLEN', queue) then offset = 0 end
  local waiting = redis.call('LRANGE', queue, offset, offset + 99)
  for _, sid in ipairs(waiting) do
    if redis.call('LPOS', queue, sid) then matchOne(sid) end
  end
  local nextOffset = offset + #waiting
  if nextOffset >= redis.call('LLEN', queue) then nextOffset = 0 end
  redis.call('SET', retry, nextOffset)
end
return countOnline()
`;

/**
 * The session's game, for validating a move. ARGV[5]: sid.
 * Returns {} or { gid, color ("white" | "black"), ply, status, ...moves in SAN }.
 */
export const GAME = `${LIB}
local sid = ARGV[5]
local gid = redis.call('GET', P .. 'game:' .. sid)
if not gid then return {} end
local g = redis.call('HMGET', gameKey(gid), 'w', 'ply', 'status')
local result = { gid, (g[1] == sid) and 'white' or 'black', g[2], g[3] }
for _, san in ipairs(redis.call('LRANGE', P .. 'gm:' .. gid, 0, -1)) do
  table.insert(result, san)
end
return result
`;

/**
 * Play a move the caller already checked is legal, unless the game moved on meanwhile.
 * Ends the game when the mover ran out of time, or with `result` when the move ends it.
 * ARGV[5..10]: sid, gid, ply the move was checked against, san, result ("" if the game goes on), reason.
 * Returns 1 when played, 0 when not (the caller should resync the client).
 */
export const MOVE = `${LIB}
local sid, gid, ply, san, result, reason = ARGV[5], ARGV[6], tonumber(ARGV[7]), ARGV[8], ARGV[9], ARGV[10]
if redis.call('GET', P .. 'game:' .. sid) ~= gid then return 0 end
local key = gameKey(gid)
local g = redis.call('HMGET', key, 'w', 'b', 'ply', 'status', 'wt', 'bt', 'turnAt', 'draw')
if g[4] ~= 'playing' or tonumber(g[3]) ~= ply then return 0 end
local white = ply % 2 == 0
if (white and g[1] or g[2]) ~= sid then return 0 end
if NOW >= deadlineOf(gid) then
  expireGame(gid)
  return 0
end
if ply >= 2 then
  local field = white and 'wt' or 'bt'
  local left = tonumber(white and g[5] or g[6]) - (NOW - tonumber(g[7]))
  redis.call('HSET', key, field, left + INCREMENT)
end
redis.call('RPUSH', P .. 'gm:' .. gid, san)
redis.call('HSET', key, 'ply', ply + 1, 'turnAt', NOW)
-- Moving declines the partner's draw offer.
if g[8] and g[8] ~= sid then redis.call('HDEL', key, 'draw') end
publishToPlayers(gid, cjson.encode({ type = 'chess_move', san = san, ply = ply + 1, clock = clockOf(gid) }))
if result ~= '' then
  endGame(gid, result, reason)
else
  redis.call('ZADD', P .. 'games', deadlineOf(gid), gid)
end
return 1
`;

/** Resign the session's game (or abort it before both first moves). ARGV[5]: sid */
export const RESIGN = `${LIB}
local sid = ARGV[5]
local gid = redis.call('GET', P .. 'game:' .. sid)
if not gid then return 0 end
local g = redis.call('HMGET', gameKey(gid), 'w', 'ply')
if tonumber(g[2]) < 2 then
  return endGame(gid, 'aborted', 'aborted') and 1 or 0
end
return endGame(gid, (g[1] == sid) and '0-1' or '1-0', 'resignation') and 1 or 0
`;

/**
 * Offer a draw (during a game) or a rematch (after it); if the partner already offered the
 * same, accept instead. A rematch starts a new game with colours swapped.
 * ARGV[5..6]: sid, "draw" | "rematch". Returns 1 when the offer was made or accepted.
 */
export const OFFER = `${LIB}
local sid, offer = ARGV[5], ARGV[6]
local gid = redis.call('GET', P .. 'game:' .. sid)
if not gid then return 0 end
local key = gameKey(gid)
local g = redis.call('HMGET', key, 'w', 'b', 'status', offer)
local partner = (g[1] == sid) and g[2] or g[1]
if (offer == 'draw') ~= (g[3] == 'playing') or g[4] == sid then return 0 end
if g[4] == partner then
  if offer == 'draw' then return endGame(gid, '1/2-1/2', 'agreement') and 1 or 0 end
  redis.call('DEL', key, P .. 'gm:' .. gid)
  startGame(g[2], g[1])
  return 1
end
redis.call('HSET', key, offer, sid)
redis.call('PUBLISH', P .. 'to:' .. partner, cjson.encode({ type = 'chess_offer', offer = offer }))
return 1
`;

/** A client thinks a clock ran out: end the game if it really did. ARGV[5]: sid */
export const FLAG = `${LIB}
local gid = redis.call('GET', P .. 'game:' .. ARGV[5])
if gid then expireGame(gid) end
return 1
`;

/** The session's game as a chess_game event, or "" when it has none. ARGV[5]: sid */
export const SYNC = `${LIB}
return gameEvent(ARGV[5]) or ''
`;
