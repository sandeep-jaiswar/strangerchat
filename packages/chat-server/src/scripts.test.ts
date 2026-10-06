import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test, type TestContext } from "node:test";
import { Redis } from "ioredis";
import { BYE, CLAIM, DETACH, FIND, MOVE, TICK } from "./scripts.ts";

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
    await redis.rpush(`${prefix}queue`, sid);
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
  assert.deepEqual(await redis.lrange(`${prefix}queue`, 0, -1), ["alice"]);
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
    await redis.set(`${prefix}retry`, 0);
    await run(TICK, 1_000);
    assert.equal(await redis.get(`${prefix}pair:alice-0`), null);
  }
  await redis.set(`${prefix}retry`, 0);
  await run(TICK, 1_000);
  assert.equal(await redis.get(`${prefix}pair:alice-0`), "bob");
  assert.equal(await redis.llen(`${prefix}queue`), 204);
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
  assert.equal(await redis.llen(`${prefix}queue`), 205);
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
  await redis.set(`${prefix}retry`, 106);
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
