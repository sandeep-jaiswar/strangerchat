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
}

const hubs: Hub[] = [];
function newHub(prefix: string) {
  const hub = new Hub({
    redisUrl: REDIS_URL,
    prefix,
    tickMs: TICK_MS,
    sessionTtlMs: SESSION_TTL_MS,
  });
  hubs.push(hub);
  return hub;
}
after(() => Promise.all(hubs.map((hub) => hub.close())));

/** Two hubs sharing one Redis namespace stand in for two Vercel function instances. */
function cluster() {
  const prefix = `test:${randomUUID()}:`;
  return [newHub(prefix), newHub(prefix)] as const;
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
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

const last = (socket: FakeSocket) => socket.types().at(-1);

test("matches and relays between instances", async () => {
  const [hubA, hubB] = cluster();
  const alice = await connect(hubA, "alice");
  const bob = await connect(hubB, "bob");
  assert.deepEqual(alice.events[0], { type: "state", phase: "idle" });

  alice.deliver({ type: "find" });
  await until(() => last(alice) === "searching", "alice searching");
  bob.deliver({ type: "find" });
  await until(
    () => last(alice) === "matched" && last(bob) === "matched",
    "both matched",
  );

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
  await until(
    () => last(tab1) === "searching" && last(tab2) === "searching",
    "both searching",
  );
});

test("resumes a chat when the socket reconnects to another instance", async () => {
  const [hubA, hubB] = cluster();
  const alice = await connect(hubA, "alice");
  const bob = await connect(hubB, "bob");
  alice.deliver({ type: "find" });
  bob.deliver({ type: "find" });
  await until(() => last(bob) === "matched", "matched");

  alice.close(); // e.g. Vercel reached the function's max duration
  const aliceAgain = await connect(hubB, "alice", alice.sid);
  assert.deepEqual(aliceAgain.events[0], { type: "state", phase: "chatting" });

  bob.deliver({ type: "message", text: "still there?" });
  await until(
    () => last(aliceAgain) === "message",
    "resumed socket receives message",
  );
  await new Promise((resolve) => setTimeout(resolve, SESSION_TTL_MS * 2));
  assert.notEqual(last(bob), "partner_left", "a resumed chat must not end");
});

test("ends the chat once a dropped session's grace period lapses", async () => {
  const [hubA, hubB] = cluster();
  const alice = await connect(hubA, "alice");
  const bob = await connect(hubB, "bob");
  alice.deliver({ type: "find" });
  bob.deliver({ type: "find" });
  await until(() => last(bob) === "matched", "matched");

  alice.close();
  await until(() => last(bob) === "partner_left", "bob told alice left");

  const aliceLater = await connect(hubA, "alice", alice.sid);
  assert.deepEqual(aliceLater.events[0], { type: "state", phase: "idle" });
});

test("leaving and skipping notify the partner immediately and avoid rematches", async () => {
  const [hubA, hubB] = cluster();
  const alice = await connect(hubA, "alice");
  const bob = await connect(hubB, "bob");
  const carol = await connect(hubA, "carol");
  alice.deliver({ type: "find" });
  bob.deliver({ type: "find" });
  await until(() => last(bob) === "matched", "matched");

  alice.deliver({ type: "find" }); // alice skips bob
  await until(() => last(bob) === "partner_left", "bob notified");
  bob.deliver({ type: "find" });
  await until(
    () => last(bob) === "searching",
    "bob searching, not rematched with alice",
  );

  carol.deliver({ type: "find" });
  await until(() => last(carol) === "matched", "carol matched");
  carol.deliver({ type: "leave" });
  await until(
    () => last(alice) === "partner_left" || last(bob) === "partner_left",
    "carol's partner notified",
  );
});

test("rejects a session id owned by another user", async () => {
  const [hubA] = cluster();
  const alice = await connect(hubA, "alice");
  const mallory = await connect(hubA, "mallory", alice.sid);
  assert.equal(mallory.closeCode, CloseCode.SessionConflict);
  assert.equal(alice.readyState, 1);
});

test("a newer socket for the same session replaces the old one", async () => {
  const [hubA] = cluster();
  const first = await connect(hubA, "alice");
  const second = await connect(hubA, "alice", first.sid);
  assert.equal(first.closeCode, CloseCode.Replaced);
  second.deliver({ type: "find" });
  await until(() => last(second) === "searching", "new socket works");
});

test("reports how many sessions are online", async () => {
  const [hubA, hubB] = cluster();
  const alice = await connect(hubA, "alice");
  await connect(hubB, "bob");
  await until(
    () =>
      alice.events.some(
        (event) => event.type === "online" && event.count === 2,
      ),
    "count of 2",
  );
});
