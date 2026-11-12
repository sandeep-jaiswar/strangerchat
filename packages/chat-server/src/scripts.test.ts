import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test, type TestContext } from "node:test";
import { Redis } from "ioredis";
import {
  BYE,
  CHESS_INVITE,
  CHESS_INVITE_RESPOND,
  CLAIM,
  DETACH,
  FIND,
  HOLD,
  LEAVE,
  MOVE,
  OFFER,
  PAIR_DIRECT,
  RESIGN,
  TICK,
} from "./scripts.ts";
import {
  closePresenceRedis,
  filterOnlineUserIds,
  getOnlineUserIds,
} from "./presence.ts";

async function fixture(t: TestContext) {
  const redis = new Redis(
    process.env.TEST_REDIS_URL ?? "redis://localhost:6379",
  );
  const prefix = `test:${randomUUID()}:`;
  t.after(async () => {
    const keys = await redis.keys(`${prefix}*`);
    if (keys.length) await redis.del(...keys);
    await redis.quit();
  });
  const run = (script: string, now: number, ...args: (string | number)[]) =>
    redis.eval(script, 0, prefix, now, 15_000, 600_000, ...args);
  const claim = (sid: string, uid = sid, connection = sid) =>
    run(CLAIM, 1_000, sid, uid, connection, 1_000_000);
  const queue = async (sid: string, uid = sid) => {
    await claim(sid, uid);
    const seq = await redis.incr(`${prefix}qseq`);
    await redis.zadd(`${prefix}queue`, seq, sid);
  };
  return { redis, prefix, run, claim, queue };
}

test("DETACH restores held messages in order without removing a newer connection's queue state", async (t) => {
  const { redis, prefix, run, claim } = await fixture(t);
  await claim("alice", "alice", "old");
  await redis.rpush(`${prefix}inbox:alice`, "first", "second");
  const result = (await claim("alice", "alice", "failed")) as (
    string | number
  )[];
  assert.deepEqual(result.slice(3), ["first", "second"]);
  await claim("alice", "alice", "new");
  await run(FIND, 1_000, "alice");
  await redis.rpush(`${prefix}inbox:alice`, "third");

  assert.equal(
    await run(DETACH, 1_000, "alice", "failed", ...result.slice(3)),
    0,
  );
  assert.equal(await redis.hget(`${prefix}conn`, "alice"), "new");
  assert.deepEqual(
    await redis.zrangebyscore(`${prefix}queue`, "-inf", "+inf"),
    ["alice"],
  );
  assert.deepEqual(await redis.lrange(`${prefix}inbox:alice`, 0, -1), [
    "first",
    "second",
    "third",
  ]);
  const resumed = (await claim("alice", "alice", "next")) as (
    string | number
  )[];
  assert.deepEqual(resumed.slice(3), ["first", "second", "third"]);
});

test("DETACH does not restore an inbox after the session ended", async (t) => {
  const { redis, prefix, run, claim } = await fixture(t);
  await claim("alice");
  await run(BYE, 1_000, "alice", "alice");
  await run(DETACH, 1_000, "alice", "alice", "undelivered");
  assert.equal(await redis.exists(`${prefix}inbox:alice`), 0);
});

test("candidate scans progress past 100 same-user sessions", async (t) => {
  const { redis, prefix, run, queue } = await fixture(t);
  for (let i = 0; i < 205; i++) await queue(`alice-${i}`, "alice");
  await queue("bob");
  // Keep retrying the first page so bob cannot match by scanning the head himself.
  for (let i = 0; i < 2; i++) {
    await redis.set(`${prefix}retry`, "-inf");
    await run(TICK, 1_000);
    assert.equal(await redis.get(`${prefix}pair:alice-0`), null);
  }
  await redis.set(`${prefix}retry`, "-inf");
  await run(TICK, 1_000);
  assert.equal(await redis.get(`${prefix}pair:alice-0`), "bob");
  assert.equal(await redis.zcard(`${prefix}queue`), 204);
});

test("TICK eventually retries tail sessions after their rematch block expires", async (t) => {
  const { redis, prefix, run, queue } = await fixture(t);
  for (let i = 0; i < 205; i++) await queue(`front-${i}`, "front");
  await queue("alice");
  await queue("bob");
  // Front sessions cannot match either tail user during this test.
  await redis.mset(
    `${prefix}ended:alice:front`,
    20_000,
    `${prefix}ended:bob:front`,
    20_000,
    `${prefix}ended:alice:bob`,
    1_000,
  );
  for (let i = 0; i < 12; i++) await run(TICK, 15_999);
  assert.equal(await redis.get(`${prefix}pair:alice`), null);
  for (let i = 0; i < 12; i++) await run(TICK, 16_000);
  assert.equal(await redis.get(`${prefix}pair:alice`), "bob");
  assert.equal(await redis.get(`${prefix}pair:bob`), "alice");
  assert.equal(await redis.zcard(`${prefix}queue`), 205);
  assert.equal(await redis.hexists(`${prefix}scan`, "alice"), 0);
  assert.equal(await redis.hexists(`${prefix}fallback`, "alice"), 0);
});

test("a new partner on a later page is preferred over an earlier rematch fallback", async (t) => {
  const { redis, prefix, run, queue } = await fixture(t);
  await queue("previous");
  for (let i = 0; i < 104; i++) await queue(`alice-${i}`, "alice");
  await queue("new");
  await queue("alice");
  await redis.set(`${prefix}ended:alice:previous`, 1_000);
  assert.equal(await run(FIND, 16_000, "alice"), 0);
  assert.equal(await redis.hget(`${prefix}fallback`, "alice"), "previous");
  // Start with alice's retry, before other queued users can consume her candidates.
  const newScore = await redis.zscore(`${prefix}queue`, "new");
  await redis.set(`${prefix}retry`, newScore!);
  await run(TICK, 16_000);
  assert.equal(await redis.get(`${prefix}pair:alice`), "new");
});

async function chessGame(t: TestContext) {
  const f = await fixture(t);
  await f.claim("a");
  await f.claim("b");
  await f.run(FIND, 1_000, "a", "chess");
  await f.run(FIND, 1_000, "b", "chess");
  const gid = await f.redis.get(`${f.prefix}game:a`);
  assert.ok(gid, "a game started");
  const white = (await f.redis.hget(`${f.prefix}g:${gid}`, "w"))!;
  const black = white === "a" ? "b" : "a";
  const game = () => f.redis.hgetall(`${f.prefix}g:${gid}`);
  return { ...f, gid, white, black, game };
}

test("a game is aborted when the first move doesn't come in time", async (t) => {
  const { run, game } = await chessGame(t);
  await run(TICK, 30_999);
  assert.equal((await game()).status, "playing");
  await run(TICK, 31_000);
  assert.deepEqual(
    [(await game()).status, (await game()).result],
    ["over", "aborted"],
  );
});

test("clocks run from both first moves on, and running out loses", async (t) => {
  const { run, game, gid, white, black } = await chessGame(t);
  assert.equal(await run(MOVE, 5_000, white, gid, 0, "e4", "", ""), 1);
  assert.equal(await run(MOVE, 9_000, black, gid, 1, "e5", "", ""), 1);
  // Neither first move cost any time.
  assert.deepEqual(
    [(await game()).wt, (await game()).bt],
    ["600000", "600000"],
  );
  // A stale or out-of-turn move is refused.
  assert.equal(await run(MOVE, 10_000, black, gid, 2, "Nf6", "", ""), 0);
  assert.equal(await run(MOVE, 10_000, white, gid, 1, "Nf3", "", ""), 0);

  assert.equal(await run(MOVE, 69_000, white, gid, 2, "Nf3", "", ""), 1);
  assert.equal((await game()).wt, "540000");

  await run(TICK, 69_000 + 600_000 - 1);
  assert.equal((await game()).status, "playing");
  await run(TICK, 69_000 + 600_000);
  const over = await game();
  assert.deepEqual(
    [over.result, over.reason, over.bt],
    ["1-0", "timeout", "0"],
  );
});

test("a move after the mover's flag fell ends the game instead", async (t) => {
  const { run, game, gid, white, black } = await chessGame(t);
  await run(MOVE, 1_000, white, gid, 0, "e4", "", "");
  await run(MOVE, 1_000, black, gid, 1, "e5", "", "");
  assert.equal(await run(MOVE, 601_000, white, gid, 2, "Nf3", "", ""), 0);
  assert.deepEqual(
    [(await game()).result, (await game()).reason],
    ["0-1", "timeout"],
  );
});

test("inverted tag index matches tagged users past >200 front queue entries immediately", async (t) => {
  const { redis, prefix, run, claim, queue } = await fixture(t);
  for (let i = 0; i < 220; i++) await queue(`front-${i}`, `front-${i}`);
  await claim("alice");
  await run(FIND, 1_000, "alice", "chat", "chess");
  await claim("bob");
  assert.equal(await run(FIND, 1_000, "bob", "chat", "chess"), 1);
  assert.equal(await redis.get(`${prefix}pair:alice`), "bob");
  assert.equal(await redis.zcard(`${prefix}tagq:chat:chess`), 0);
});

test("online_users set tracks presence incrementally in O(1) and filters subsets in O(F)", async (t) => {
  const { redis, prefix, run, claim } = await fixture(t);
  t.after(() => closePresenceRedis());
  const redisUrl = process.env.TEST_REDIS_URL ?? "redis://localhost:6379";

  await claim("alice-1", "alice", "c1");
  await claim("alice-2", "alice", "c2");
  await claim("bob-1", "bob", "c3");

  assert.equal(await redis.scard(`${prefix}online_users`), 2);
  const subset = await filterOnlineUserIds(redisUrl, prefix, [
    "alice",
    "bob",
    "carol",
  ]);
  assert.deepEqual([...subset].sort(), ["alice", "bob"]);

  // Detaching one of two tabs keeps alice online; detaching the last removes her.
  await run(DETACH, 1_000, "alice-1", "c1");
  assert.equal(await redis.sismember(`${prefix}online_users`, "alice"), 1);
  await run(DETACH, 1_000, "alice-2", "c2");
  assert.equal(await redis.sismember(`${prefix}online_users`, "alice"), 0);

  const allOnline = await getOnlineUserIds(redisUrl, prefix);
  assert.deepEqual([...allOnline], ["bob"]);
});

test("rematch fallback respects candidate TAG_WAIT window", async (t) => {
  const { redis, prefix, run, claim } = await fixture(t);
  await claim("alice");
  await claim("bob");
  await redis.set(`${prefix}ended:alice:bob`, 1_000);

  // Bob queues with a tag at t=16_000 (REMATCH_BLOCK elapsed, TAG_WAIT active until 21_000).
  assert.equal(await run(FIND, 16_000, "bob", "chat", "chess"), 0);
  // Alice queues untagged 100ms later: she must not hijack Bob during his TAG_WAIT as a fallback.
  assert.equal(await run(FIND, 16_100, "alice", "chat"), 0);
  assert.equal(await redis.get(`${prefix}pair:bob`), null);

  // Another #chess user arriving before 21_000 still gets Bob.
  await claim("carol");
  assert.equal(await run(FIND, 16_200, "carol", "chat", "chess"), 1);
  assert.equal(await redis.get(`${prefix}pair:bob`), "carol");
});

test("tagged search paginates saturated tagq (>50 entries) without matching untagged fallback early", async (t) => {
  const { redis, prefix, run, claim, queue } = await fixture(t);
  // Queue 55 same-user #chess sessions plus an untagged rematch fallback for alice.
  await queue("prev");
  await redis.set(`${prefix}ended:alice:prev`, 1_000);
  for (let i = 0; i < 55; i++) {
    await claim(`alice-dup-${i}`, "alice", `c-${i}`);
    const seq = await redis.incr(`${prefix}qseq`);
    await redis.sadd(`${prefix}tags:alice-dup-${i}`, "chess");
    await redis.hset(`${prefix}tagat`, `alice-dup-${i}`, 16_000);
    await redis.zadd(`${prefix}tagq:chat:chess`, seq, `alice-dup-${i}`);
    await redis.zadd(`${prefix}queue`, seq, `alice-dup-${i}`);
  }
  await claim("bob");
  const bobSeq = await redis.incr(`${prefix}qseq`);
  await redis.sadd(`${prefix}tags:bob`, "chess");
  await redis.hset(`${prefix}tagat`, "bob", 16_000);
  await redis.zadd(`${prefix}tagq:chat:chess`, bobSeq, "bob");
  await redis.zadd(`${prefix}queue`, bobSeq, "bob");

  await claim("alice");
  // First call scans first 50 entries of tagq; must NOT match untagged `prev` during TAG_WAIT.
  assert.equal(await run(FIND, 16_000, "alice", "chat", "chess"), 0);
  assert.equal(await redis.get(`${prefix}pair:alice`), null);
  // Next TICK runs `alice`, advancing her tagscan past the first 50 and matching bob at position 56.
  const bobQScore = await redis.zscore(`${prefix}queue`, "bob");
  await redis.set(`${prefix}retry`, bobQScore!);
  await run(TICK, 16_500);
  assert.equal(await redis.get(`${prefix}pair:alice`), "bob");
});

test("stale page-1 anyFresh does not shadow live page-2 candidates", async (t) => {
  const { redis, prefix, run, claim, queue } = await fixture(t);
  await queue("stale");
  for (let i = 0; i < 105; i++) await queue(`blocker-${i}`, "alice");
  await queue("live");
  await claim("alice");

  assert.equal(await run(FIND, 1_000, "alice", "chat", "music"), 0);
  // Simulate TAG_WAIT having elapsed for alice, then run TICK starting at alice (`retry = score(live)`).
  const liveScore = await redis.zscore(`${prefix}queue`, "live");
  await redis.set(`${prefix}retry`, liveScore!);
  await run(TICK, 6_000);
  assert.equal(await redis.hget(`${prefix}anyfresh`, "alice"), "stale");

  // `stale` disconnects before page 2 runs; page 2 must pick up `live` instead of failing on `stale`.
  await run(DETACH, 6_100, "stale", "stale");
  await redis.set(`${prefix}retry`, liveScore!);
  await run(TICK, 6_200);
  assert.equal(await redis.get(`${prefix}pair:alice`), "live");
});

test("tagged search scans older pages before pairing a newer candidate from another tag", async (t) => {
  const { redis, prefix, run, claim, queue } = await fixture(t);
  for (let i = 0; i < 50; i++) {
    const sid = `alice-dup-${i}`;
    await queue(sid, "alice");
    await redis.sadd(`${prefix}tags:${sid}`, "chess");
    await redis.zadd(`${prefix}tagq:chat:chess`, i + 1, sid);
  }
  await queue("older");
  await redis.sadd(`${prefix}tags:older`, "chess");
  await redis.zadd(`${prefix}tagq:chat:chess`, 51, "older");
  await queue("newer");
  await redis.sadd(`${prefix}tags:newer`, "music");
  await redis.zadd(`${prefix}tagq:chat:music`, 52, "newer");
  await claim("alice");

  assert.equal(await run(FIND, 16_000, "alice", "chat", "chess", "music"), 0);
  assert.equal(await redis.get(`${prefix}pair:alice`), null);
  assert.equal(await redis.hget(`${prefix}tagscan`, "alice"), "50");
  const newerScore = await redis.zscore(`${prefix}queue`, "newer");
  await redis.set(`${prefix}retry`, newerScore!);
  await run(TICK, 16_000);
  assert.equal(await redis.get(`${prefix}pair:alice`), "older");
});

test("mid-chat chess_invite allows starting a new game after the prior game ends", async (t) => {
  const { redis, prefix, run, claim } = await fixture(t);
  await claim("alice");
  await claim("bob");
  await run(FIND, 1_000, "alice", "chat");
  await run(FIND, 1_000, "bob", "chat");

  assert.equal(await run(CHESS_INVITE, 1_100, "alice", "bullet_1_0"), 1);
  assert.equal(await run(CHESS_INVITE_RESPOND, 1_200, "bob", "1"), 1);
  const gid1 = await redis.get(`${prefix}game:alice`);
  assert.ok(gid1);

  assert.equal(await run(RESIGN, 1_300, "alice"), 1);
  assert.equal(await redis.hget(`${prefix}g:${gid1}`, "status"), "over");

  // Starting a fresh game with a new time control must succeed after game 1 ended.
  assert.equal(await run(CHESS_INVITE, 1_400, "alice", "blitz_5_0"), 1);
  assert.equal(await run(CHESS_INVITE_RESPOND, 1_500, "bob", "1"), 1);
  const gid2 = await redis.get(`${prefix}game:alice`);
  assert.ok(gid2 && gid2 !== gid1);
  assert.equal(await redis.hget(`${prefix}g:${gid2}`, "tc"), "blitz_5_0");
  assert.equal(await redis.exists(`${prefix}g:${gid1}`), 0);
});

test("PAIR_DIRECT does not yank an already-paired challenger out of their active chat", async (t) => {
  const { redis, prefix, run, claim } = await fixture(t);
  await claim("alice");
  await claim("bob");
  await claim("carol");
  await run(FIND, 1_000, "alice", "chat");
  await run(FIND, 1_000, "carol", "chat");
  assert.equal(await redis.get(`${prefix}pair:alice`), "carol");

  assert.equal(await run(PAIR_DIRECT, 2_000, "alice", "bob", "rapid_10_0"), "unavailable");
  assert.equal(await redis.get(`${prefix}pair:alice`), "carol");
});

test("CLAIM delivers held chess_over when partner abandoned during brief disconnect", async (t) => {
  const { run, claim } = await fixture(t);
  await claim("alice", "alice", "c-a");
  await claim("bob", "bob", "c-b");
  await run(FIND, 1_000, "alice", "chess");
  await run(FIND, 1_000, "bob", "chess");

  // Bob disconnects into grace period; Alice leaves, dropping the game.
  await run(DETACH, 2_000, "bob", "c-b");
  await run(FIND, 3_000, "alice", "chat");

  const resumed = (await claim("bob", "bob", "c-b2")) as (string | number)[];
  assert.equal(resumed[0], "idle");
  assert.equal(resumed[2], "");
  const held = resumed
    .slice(3)
    .map((raw) => JSON.parse(String(raw)) as { type: string; reason?: string });
  assert.ok(held.some((e) => e.type === "chess_over" && e.reason === "aborted"));
});

test("LEAVE/unpair clears active puzzle duel markers so new chats can duel immediately", async (t) => {
  const { redis, prefix, run, claim } = await fixture(t);
  await claim("alice");
  await claim("bob");
  await run(FIND, 1_000, "alice", "chat");
  await run(FIND, 1_000, "bob", "chat");

  await redis.set(`${prefix}duel_active:alice`, "duel-1", "EX", 120);
  await redis.set(`${prefix}duel_active:bob`, "duel-1", "EX", 120);
  await redis.hset(`${prefix}duel:duel-1`, "sidA", "alice", "sidB", "bob");

  await run(LEAVE, 2_000, "alice");
  assert.equal(await redis.exists(`${prefix}duel_active:alice`), 0);
  assert.equal(await redis.exists(`${prefix}duel_active:bob`), 0);
  assert.equal(await redis.exists(`${prefix}duel:duel-1`), 0);
  assert.equal(await redis.get(`${prefix}duel_done:duel-1`), "1");
});

test("HOLD queues events while detached and delivers them on CLAIM", async (t) => {
  const { run, claim } = await fixture(t);
  await claim("alice", "alice", "c-1");
  await run(DETACH, 2_000, "alice", "c-1");

  const payload = JSON.stringify({ type: "puzzle_duel_over", id: "duel-9" });
  await run(HOLD, 2_500, "alice", payload);

  const resumed = (await claim("alice", "alice", "c-2")) as (string | number)[];
  assert.deepEqual(resumed.slice(3), [payload]);
});

test("OFFER safely returns 0 if the game hash is missing", async (t) => {
  const { redis, prefix, run, claim } = await fixture(t);
  await claim("alice");
  await redis.set(`${prefix}game:alice`, "missing-gid");
  assert.equal(await run(OFFER, 2_000, "alice", "rematch"), 0);
  assert.equal(await redis.exists(`${prefix}g:missing-gid`), 0);
});
