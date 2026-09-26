import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { EventEmitter } from "node:events";
import { after, test } from "node:test";
import type { WebSocket } from "ws";
import { CloseCode, type ServerEvent } from "@repo/protocol";
import { Hub } from "./hub.ts";

// Needs a Redis server: docker run -d -p 6379:6379 redis:7-alpine
const REDIS_URL = process.env.TEST_REDIS_URL ?? "redis://localhost:6379";
const TICK_MS = 50;
const SESSION_TTL_MS = 300;
const REMATCH_BLOCK_MS = 400;

class FakeSocket extends EventEmitter {
  readonly OPEN = 1;
  readyState = 1;
  events: ServerEvent[] = [];
  closeCode: number | undefined;

  send(data: string) {
    this.events.push(JSON.parse(data) as ServerEvent);
  }
  ping() {
    queueMicrotask(() => this.emit("pong"));
  }
  close(code?: number) {
    if (this.readyState !== 1) return;
    this.readyState = 3;
    this.closeCode = code;
    this.emit("close");
  }
  terminate() {
    this.close();
  }
  /** Simulates the browser sending a frame. */
  deliver(event: object) {
    this.emit("message", Buffer.from(JSON.stringify(event)), false);
  }
  types() {
    return this.events
      .map((event) => event.type)
      .filter((type) => type !== "online");
  }
  lastOnline() {
    const online = this.events.filter((event) => event.type === "online");
    return online.at(-1)?.count;
  }
}

const hubs: Hub[] = [];
after(() => Promise.all(hubs.map((hub) => hub.close())));

/** Two hubs sharing one Redis namespace stand in for two Vercel function instances. */
function cluster() {
  const prefix = `test:${randomUUID()}:`;
  const make = () => {
    const hub = new Hub({
      redisUrl: REDIS_URL,
      prefix,
      tickMs: TICK_MS,
      sessionTtlMs: SESSION_TTL_MS,
      rematchBlockMs: REMATCH_BLOCK_MS,
    });
    hubs.push(hub);
    return hub;
  };
  return [make(), make()] as const;
}

async function connect(hub: Hub, userId: string, sid: string = randomUUID()) {
  const socket = new FakeSocket();
  await hub.attach(socket as unknown as WebSocket, userId, sid);
  return Object.assign(socket, { sid });
}

async function until(check: () => boolean, message: string, timeoutMs = 2000) {
  const deadline = Date.now() + timeoutMs;
  while (!check()) {
    if (Date.now() > deadline) assert.fail(`Timed out waiting for: ${message}`);
    await sleep(10);
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const last = (socket: FakeSocket) => socket.types().at(-1);

async function chatting(a: FakeSocket, b: FakeSocket) {
  a.deliver({ type: "find" });
  await until(
    () => last(a) === "searching" || last(a) === "matched",
    "first joins queue",
  );
  b.deliver({ type: "find" });
  await until(
    () => last(a) === "matched" && last(b) === "matched",
    "both matched",
  );
}

test("matches and relays between instances", async () => {
  const [hubA, hubB] = cluster();
  const alice = await connect(hubA, "alice");
  const bob = await connect(hubB, "bob");
  assert.deepEqual(alice.events[0], { type: "state", phase: "idle" });

  await chatting(alice, bob);
  alice.deliver({ type: "typing", isTyping: true });
  alice.deliver({ type: "message", text: "  hi bob  " });
  await until(() => last(bob) === "message", "bob receives message");
  assert.deepEqual(bob.types().slice(-2), ["typing", "message"]);
  const message = bob.events.at(-1);
  assert.equal(message?.type === "message" && message.text, "hi bob");
});

test("never pairs two tabs of the same user", async () => {
  const [hubA, hubB] = cluster();
  const tab1 = await connect(hubA, "alice");
  const tab2 = await connect(hubB, "alice");
  tab1.deliver({ type: "find" });
  tab2.deliver({ type: "find" });
  await sleep(TICK_MS * 4);
  assert.equal(last(tab1), "searching");
  assert.equal(last(tab2), "searching");
});

test("counts people, not tabs, and drops a closed tab right away", async () => {
  const [hubA, hubB] = cluster();
  const aliceTab1 = await connect(hubA, "alice");
  await connect(hubB, "alice");
  const bob = await connect(hubB, "bob");
  await until(() => aliceTab1.lastOnline() === 2, "two people online");

  bob.deliver({ type: "bye" });
  await until(
    () => aliceTab1.lastOnline() === 1,
    "one person online after bob closes his tab",
  );
});

test("a reloaded tab is not counted twice", async () => {
  const [hubA] = cluster();
  const alice = await connect(hubA, "alice");
  const bob = await connect(hubA, "bob");
  alice.close(); // dropped without "bye": the session lingers for its grace period
  await connect(hubA, "alice"); // the reloaded page opens a new session
  await sleep(TICK_MS * 3);
  assert.equal(bob.lastOnline(), 2);
});

test("resumes a chat on another instance and delivers messages sent meanwhile", async () => {
  const [hubA, hubB] = cluster();
  const alice = await connect(hubA, "alice");
  const bob = await connect(hubB, "bob");
  await chatting(alice, bob);

  alice.close(); // e.g. Vercel reached the function's max duration
  await sleep(TICK_MS);
  bob.deliver({ type: "message", text: "are you there?" });
  await sleep(TICK_MS);

  const aliceAgain = await connect(hubB, "alice", alice.sid);
  assert.deepEqual(aliceAgain.events[0], { type: "state", phase: "chatting" });
  const held = aliceAgain.events.find((event) => event.type === "message");
  assert.equal(held?.type === "message" && held.text, "are you there?");

  bob.deliver({ type: "message", text: "welcome back" });
  await until(
    () => aliceAgain.events.filter((e) => e.type === "message").length === 2,
    "live message",
  );
  await sleep(SESSION_TTL_MS * 2);
  assert.ok(
    !bob.types().includes("partner_left"),
    "a resumed chat must not end",
  );
});

test("ends the chat once a dropped session's grace period lapses", async () => {
  const [hubA, hubB] = cluster();
  const alice = await connect(hubA, "alice");
  const bob = await connect(hubB, "bob");
  await chatting(alice, bob);

  alice.close();
  await until(() => last(bob) === "partner_left", "bob told alice left");
  const aliceLater = await connect(hubA, "alice", alice.sid);
  assert.deepEqual(aliceLater.events[0], { type: "state", phase: "idle" });
});

test("closing the tab ends the chat immediately", async () => {
  const [hubA, hubB] = cluster();
  const alice = await connect(hubA, "alice");
  const bob = await connect(hubB, "bob");
  await chatting(alice, bob);

  const started = Date.now();
  alice.deliver({ type: "bye" });
  await until(() => last(bob) === "partner_left", "bob told alice left");
  assert.ok(
    Date.now() - started < SESSION_TTL_MS,
    "did not wait for the grace period",
  );
});

test("two people who skip each other are rematched after the block, not before", async () => {
  const [hubA, hubB] = cluster();
  const alice = await connect(hubA, "alice");
  const bob = await connect(hubB, "bob");
  await chatting(alice, bob);

  alice.deliver({ type: "find" }); // alice skips bob
  await until(() => last(bob) === "partner_left", "bob notified");
  const skippedAt = Date.now();
  bob.deliver({ type: "find" });
  await until(() => last(bob) === "searching", "bob searching");

  await until(
    () => last(alice) === "matched" && last(bob) === "matched",
    "rematched",
    3000,
  );
  const waited = Date.now() - skippedAt;
  assert.ok(
    waited >= REMATCH_BLOCK_MS - TICK_MS,
    `rematched too soon (${waited}ms)`,
  );
});

test("someone new is preferred over a previous partner", async () => {
  const [hubA, hubB] = cluster();
  const alice = await connect(hubA, "alice");
  const bob = await connect(hubB, "bob");
  const carol = await connect(hubA, "carol");

  await chatting(alice, bob);
  alice.deliver({ type: "leave" });
  await until(() => last(bob) === "partner_left", "alice and bob done");
  await sleep(REMATCH_BLOCK_MS + TICK_MS); // alice may rematch bob now, but only as a fallback

  await chatting(bob, carol);
  carol.deliver({ type: "leave" });
  await until(() => last(bob) === "partner_left", "bob and carol done");

  // bob and carol are blocked from each other, so both wait. bob has waited longer,
  // but alice gets carol because bob is her previous partner.
  bob.deliver({ type: "find" });
  carol.deliver({ type: "find" });
  await until(
    () => last(bob) === "searching" && last(carol) === "searching",
    "both waiting",
  );
  alice.deliver({ type: "find" });
  await until(
    () => last(alice) === "matched" && last(carol) === "matched",
    "alice matched carol",
  );
  assert.equal(last(bob), "searching");
});

test("a disconnected searcher is not matched and leaves the queue", async () => {
  const [hubA, hubB] = cluster();
  const alice = await connect(hubA, "alice");
  alice.deliver({ type: "find" });
  await until(() => last(alice) === "searching", "alice searching");
  alice.close();
  await sleep(TICK_MS);

  const bob = await connect(hubB, "bob");
  bob.deliver({ type: "find" });
  await sleep(TICK_MS * 3);
  assert.equal(last(bob), "searching");

  const aliceAgain = await connect(hubA, "alice", alice.sid);
  assert.deepEqual(aliceAgain.events[0], { type: "state", phase: "idle" });
});

test("a late close from a replaced connection doesn't disturb the new one", async () => {
  const [hubA, hubB] = cluster();
  const oldSocket = await connect(hubA, "alice");
  oldSocket.deliver({ type: "find" });
  await until(() => last(oldSocket) === "searching", "searching");

  const newSocket = await connect(hubB, "alice", oldSocket.sid); // reconnect lands elsewhere first
  oldSocket.close(); // the old instance only notices now
  await sleep(TICK_MS);

  const bob = await connect(hubA, "bob");
  bob.deliver({ type: "find" });
  await until(
    () => last(newSocket) === "matched" && last(bob) === "matched",
    "still matchable",
  );
});

test("rejects a session id owned by another user", async () => {
  const [hubA] = cluster();
  const alice = await connect(hubA, "alice");
  const mallory = await connect(hubA, "mallory", alice.sid);
  assert.equal(mallory.closeCode, CloseCode.SessionConflict);
  assert.equal(alice.readyState, 1);
});

test("a newer socket for the same session on one instance replaces the old one", async () => {
  const [hubA] = cluster();
  const first = await connect(hubA, "alice");
  const second = await connect(hubA, "alice", first.sid);
  assert.equal(first.closeCode, CloseCode.Replaced);
  second.deliver({ type: "find" });
  await until(() => last(second) === "searching", "new socket works");
});

test("a socket closed during attach preserves claimed messages for the next reconnect", async () => {
  const [hubA, hubB] = cluster();
  const alice = await connect(hubA, "alice");
  const bob = await connect(hubB, "bob");
  await chatting(alice, bob);
  alice.close();
  await sleep(TICK_MS);
  bob.deliver({ type: "message", text: "held message" });
  await sleep(TICK_MS);

  const closed = new FakeSocket();
  closed.close();
  await hubA.attach(closed as unknown as WebSocket, "alice", alice.sid);
  const resumed = await connect(hubB, "alice", alice.sid);
  assert.deepEqual(resumed.events[0], { type: "state", phase: "chatting" });
  const messages = resumed.events.filter((event) => event.type === "message");
  assert.deepEqual(
    messages.map((event) => event.text),
    ["held message"],
  );
});

test("a stale bye cannot end a replacement connection's chat", async () => {
  const [hubA, hubB] = cluster();
  const stale = await connect(hubA, "alice");
  const bob = await connect(hubB, "bob");
  await chatting(stale, bob);
  const replacement = await connect(hubB, "alice", stale.sid);

  stale.deliver({ type: "bye" });
  await until(() => stale.readyState !== stale.OPEN, "stale bye handled");
  bob.deliver({ type: "message", text: "still chatting" });
  await until(
    () => last(replacement) === "message",
    "replacement receives message",
  );
  assert.ok(!bob.types().includes("partner_left"));
  replacement.deliver({ type: "bye" });
  await until(() => last(bob) === "partner_left", "current bye ends chat");
});
