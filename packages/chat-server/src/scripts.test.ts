import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test, type TestContext } from "node:test";
import { Redis } from "ioredis";
import { BYE, CLAIM, DETACH, FIND, TICK } from "./scripts.ts";

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
  assert.deepEqual(result.slice(2), ["first", "second"]);
  await claim("alice", "alice", "new");
  await run(FIND, 1_000, "alice");
  await redis.rpush(`${prefix}inbox:alice`, "third");

  assert.equal(
    await run(DETACH, 1_000, "alice", "failed", ...result.slice(2)),
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
  assert.deepEqual(resumed.slice(2), ["first", "second", "third"]);
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
