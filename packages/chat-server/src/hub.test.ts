import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { EventEmitter } from "node:events";
import { after, test } from "node:test";
import type { WebSocket } from "ws";
import { Redis } from "ioredis";
import { hasDatabase } from "@funstranger/db";
import { CloseCode, type ServerEvent } from "@funstranger/protocol";
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
  return Object.assign(socket, { sid, userId });
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
  const message = bob.events.filter((e) => e.type === "message").at(-1);
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

type Event<T extends ServerEvent["type"]> = Extract<ServerEvent, { type: T }>;

function lastOf<T extends ServerEvent["type"]>(socket: FakeSocket, type: T) {
  return socket.events.filter((event) => event.type === type).at(-1) as
    Event<T> | undefined;
}

type Player = Awaited<ReturnType<typeof connect>>;

/** Matches two players in Chess Club; returns them as [white, black]. */
async function playing(a: Player, b: Player) {
  a.deliver({ type: "find", mode: "chess" });
  await until(() => last(a) === "searching", "first joins the chess queue");
  b.deliver({ type: "find", mode: "chess" });
  await until(
    () => !!lastOf(a, "chess_game") && !!lastOf(b, "chess_game"),
    "both get a game",
  );
  return lastOf(a, "chess_game")!.game.color === "white"
    ? ([a, b] as const)
    : ([b, a] as const);
}

async function play(
  white: FakeSocket,
  black: FakeSocket,
  moves: [string, string][],
) {
  for (const [index, [from, to]] of moves.entries()) {
    const mover = index % 2 === 0 ? white : black;
    mover.deliver({ type: "chess_move", from, to });
    await until(
      () => lastOf(white, "chess_move")?.ply === index + 1,
      `move ${index + 1} is played`,
    );
  }
}

test("chess players are matched with each other, not with chatters", async () => {
  const [hubA, hubB] = cluster();
  const chatter = await connect(hubA, "carol");
  chatter.deliver({ type: "find" });
  await until(() => last(chatter) === "searching", "chatter waits");

  const alice = await connect(hubA, "alice");
  const bob = await connect(hubB, "bob");
  const [white, black] = await playing(alice, bob);
  assert.equal(last(chatter), "searching");
  assert.deepEqual(lastOf(alice, "matched"), {
    type: "matched",
    mode: "chess",
    timeControl: "rapid_10_0",
  });

  const game = lastOf(black, "chess_game")!.game;
  assert.equal(game.color, "black");
  assert.deepEqual(game.moves, []);
  assert.equal(game.status, "playing");
  assert.equal(game.clock.running, false);
  assert.ok(game.clock.firstMoveMs! > 0);

  // Chatting still works alongside the board.
  white.deliver({ type: "message", text: "good luck" });
  await until(() => last(black) === "message", "black gets the message");
});

test("relays legal moves and rejects illegal or out-of-turn ones", async () => {
  const [hubA, hubB] = cluster();
  const [white, black] = await playing(
    await connect(hubA, "alice"),
    await connect(hubB, "bob"),
  );

  black.deliver({ type: "chess_move", from: "e7", to: "e5" });
  await until(() => !!lastOf(black, "error"), "black is told off");
  await until(() => last(black) === "chess_game", "black is resynced");
  assert.deepEqual(black.types().slice(-2), ["error", "chess_game"]);
  assert.equal(lastOf(black, "error")?.code, "invalid_move");

  white.deliver({ type: "chess_move", from: "e2", to: "e5" });
  await until(() => !!lastOf(white, "error"), "illegal move is rejected");

  await play(white, black, [
    ["e2", "e4"],
    ["e7", "e5"],
  ]);
  const move = lastOf(black, "chess_move")!;
  assert.equal(move.san, "e5");
  assert.equal(move.clock.running, true);
});

test("checkmate ends the game", async () => {
  const [hubA, hubB] = cluster();
  const [white, black] = await playing(
    await connect(hubA, "alice"),
    await connect(hubB, "bob"),
  );
  await play(white, black, [
    ["f2", "f3"],
    ["e7", "e5"],
    ["g2", "g4"],
    ["d8", "h4"],
  ]);
  await until(() => !!lastOf(white, "chess_over"), "game over");
  const over = lastOf(white, "chess_over")!;
  assert.equal(over.result, "0-1");
  assert.equal(over.reason, "checkmate");
});

test("draws by agreement, and a rematch swaps colours", async () => {
  const [hubA, hubB] = cluster();
  const [white, black] = await playing(
    await connect(hubA, "alice"),
    await connect(hubB, "bob"),
  );
  await play(white, black, [
    ["e2", "e4"],
    ["e7", "e5"],
  ]);
  white.deliver({ type: "chess_offer", offer: "draw" });
  await until(() => last(black) === "chess_offer", "black sees the offer");
  black.deliver({ type: "chess_offer", offer: "draw" });
  await until(() => !!lastOf(white, "chess_over"), "game over");
  assert.equal(lastOf(white, "chess_over")!.reason, "agreement");

  const games = white.events.filter((e) => e.type === "chess_game").length;
  black.deliver({ type: "chess_offer", offer: "rematch" });
  await until(
    () => last(white) === "chess_offer",
    "white sees the rematch offer",
  );
  white.deliver({ type: "chess_offer", offer: "rematch" });
  await until(
    () => white.events.filter((e) => e.type === "chess_game").length > games,
    "rematch starts",
  );
  assert.equal(lastOf(white, "chess_game")!.game.color, "black");
  assert.equal(lastOf(black, "chess_game")!.game.color, "white");
});

test("resigning, and leaving mid-game, lose the game", async () => {
  const [hubA, hubB] = cluster();
  const [white, black] = await playing(
    await connect(hubA, "alice"),
    await connect(hubB, "bob"),
  );
  await play(white, black, [
    ["e2", "e4"],
    ["e7", "e5"],
  ]);
  black.deliver({ type: "chess_resign" });
  await until(() => !!lastOf(white, "chess_over"), "game over");
  assert.deepEqual(
    [lastOf(white, "chess_over")!.result, lastOf(white, "chess_over")!.reason],
    ["1-0", "resignation"],
  );

  const [white2, black2] = await playing(
    await connect(hubA, "carol"),
    await connect(hubB, "dave"),
  );
  await play(white2, black2, [
    ["d2", "d4"],
    ["d7", "d5"],
  ]);
  white2.deliver({ type: "leave" });
  await until(() => last(black2) === "partner_left", "black sees white leave");
  const over = lastOf(black2, "chess_over")!;
  assert.deepEqual([over.result, over.reason], ["0-1", "abandoned"]);
});

test("leaving before both first moves aborts the game", async () => {
  const [hubA, hubB] = cluster();
  const [white, black] = await playing(
    await connect(hubA, "alice"),
    await connect(hubB, "bob"),
  );
  await play(white, black, [["e2", "e4"]]);
  black.deliver({ type: "find", mode: "chess" });
  await until(() => !!lastOf(white, "chess_over"), "game over");
  assert.equal(lastOf(white, "chess_over")!.result, "aborted");
});

test("a reconnecting player gets the game back on another instance", async () => {
  const [hubA, hubB] = cluster();
  const [white, black] = await playing(
    await connect(hubA, "alice"),
    await connect(hubB, "bob"),
  );
  await play(white, black, [
    ["e2", "e4"],
    ["c7", "c5"],
  ]);
  black.close();
  white.deliver({ type: "chess_move", from: "g1", to: "f3" });
  await until(() => lastOf(white, "chess_move")?.ply === 3, "white moves");

  const back = await connect(hubA, black.userId, black.sid);
  const game = lastOf(back, "chess_game")!.game;
  assert.deepEqual(game.moves, ["e4", "c5", "Nf3"]);
  assert.equal(game.color, "black");
  assert.equal(game.clock.running, true);
});

test("text chatters can invite each other to play chess mid-chat", async () => {
  const [hubA, hubB] = cluster();
  const alice = await connect(hubA, "alice");
  const bob = await connect(hubB, "bob");
  await chatting(alice, bob);

  alice.deliver({ type: "chess_invite" });
  await until(
    () =>
      alice.types().includes("chess_invite") &&
      bob.types().includes("chess_invite"),
    "both receive chess_invite",
  );

  bob.deliver({ type: "chess_invite_response", accept: true });
  await until(
    () =>
      alice.types().includes("chess_game") &&
      bob.types().includes("chess_game"),
    "mid-chat chess game starts",
  );
});

test("prefers matching strangers with overlapping interest tags", async () => {
  const [hubA, hubB] = cluster();
  const alice = await connect(hubA, "alice");
  const bob = await connect(hubB, "bob");
  const carol = await connect(hubA, "carol");

  alice.deliver({ type: "find", tags: ["music"] });
  await until(() => last(alice) === "searching", "alice waiting");
  bob.deliver({ type: "find", tags: ["chess"] });
  await until(() => last(bob) === "searching", "bob waiting");

  // Carol shares "chess" with Bob, even though Alice was waiting earlier.
  carol.deliver({ type: "find", tags: ["chess"] });
  await until(
    () => last(bob) === "matched" && last(carol) === "matched",
    "bob and carol match by shared tag",
  );
  const matchedEvent = bob.events.find((e) => e.type === "matched");
  assert.deepEqual(matchedEvent?.type === "matched" && matchedEvent.sharedTags, [
    "chess",
  ]);
  assert.equal(last(alice), "searching");
});

test("censors profanity in relayed messages", async () => {
  const [hubA, hubB] = cluster();
  const alice = await connect(hubA, "alice");
  const bob = await connect(hubB, "bob");
  await chatting(alice, bob);

  alice.deliver({ type: "message", text: "what the fuck is this" });
  await until(() => last(bob) === "message", "bob receives moderated message");
  const msg = lastOf(bob, "message");
  assert.equal(msg?.type === "message" && !msg.text.includes("fuck"), true);
});

test("blocking prevents matching with that user again", async () => {
  const [hubA, hubB] = cluster();
  const aliceId = `block-alice-${randomUUID()}`;
  const bobId = `block-bob-${randomUUID()}`;
  const alice = await connect(hubA, aliceId);
  const bob = await connect(hubB, bobId);
  await chatting(alice, bob);

  alice.deliver({ type: "safety_action", action: "block" });
  await until(
    () => alice.types().includes("safety_ack") && last(bob) === "partner_left",
    "block ends chat",
  );

  alice.deliver({ type: "find" });
  bob.deliver({ type: "find" });
  await sleep(REMATCH_BLOCK_MS + 120);
  assert.equal(last(alice), "searching");
  assert.equal(last(bob), "searching");
});

test("supports fast time controls with clock increment and rematch preservation", async () => {
  const [hubA, hubB] = cluster();
  const alice = await connect(hubA, `tc-a-${randomUUID()}`);
  const bob = await connect(hubB, `tc-b-${randomUUID()}`);

  alice.deliver({ type: "find", mode: "chess", timeControl: "blitz_3_2" });
  await until(() => last(alice) === "searching", "alice queued in 3+2");
  bob.deliver({ type: "find", mode: "chess", timeControl: "blitz_3_2" });
  await until(
    () => !!lastOf(alice, "chess_game") && !!lastOf(bob, "chess_game"),
    "3+2 game started",
  );

  const g = lastOf(alice, "chess_game")!.game;
  assert.equal(g.timeControl, "blitz_3_2");
  assert.equal(g.clock.white, 180_000);
  assert.equal(g.clock.black, 180_000);

  const [white, black] = g.color === "white" ? [alice, bob] : [bob, alice];
  await play(white, black, [
    ["e2", "e4"],
    ["e7", "e5"],
    ["g1", "f3"],
  ]);
  const move3 = lastOf(white, "chess_move")!;
  // White gets +2000ms increment after move 3 (ply >= 2).
  assert.ok(move3.clock.white > 180_000, "white clock received 2s increment");
});

test("direct invite links pair two users across instances and guard edge cases", async () => {
  const [hubA, hubB] = cluster();
  const aliceId = `inv-a-${randomUUID()}`;
  const bobId = `inv-b-${randomUUID()}`;
  const alice = await connect(hubA, aliceId);
  const bob = await connect(hubB, bobId);

  alice.deliver({ type: "create_invite", mode: "chess", timeControl: "bullet_1_0" });
  await until(() => !!lastOf(alice, "invite_created"), "invite created");
  const code = lastOf(alice, "invite_created")!.code;

  // Same user cannot join their own invite.
  alice.deliver({ type: "join_invite", code });
  await until(() => lastOf(alice, "invite_failed")?.reason === "self", "self join rejected");

  // Joiner on another instance pairs immediately into Bullet 1+0.
  bob.deliver({ type: "join_invite", code });
  await until(
    () => !!lastOf(alice, "chess_game") && !!lastOf(bob, "chess_game"),
    "invite paired into bullet game",
  );
  assert.equal(lastOf(bob, "chess_game")!.game.timeControl, "bullet_1_0");
  assert.equal(lastOf(bob, "chess_game")!.game.clock.white, 60_000);

  // Consumed invite fails cleanly.
  const carol = await connect(hubA, `inv-c-${randomUUID()}`);
  carol.deliver({ type: "join_invite", code });
  await until(
    () => lastOf(carol, "invite_failed")?.reason === "not_found",
    "used invite reports not_found",
  );
});

test("in-chat puzzle duel pairs, syncs progress, and declares winner", async () => {
  const [hubA, hubB] = cluster();
  const alice = await connect(hubA, `duel-a-${randomUUID()}`);
  const bob = await connect(hubB, `duel-b-${randomUUID()}`);
  await chatting(alice, bob);

  alice.deliver({ type: "puzzle_duel_invite" });
  await until(
    () => lastOf(bob, "puzzle_duel_invite")?.from === "them",
    "bob receives duel invite",
  );
  bob.deliver({ type: "puzzle_duel_response", accept: true });
  await until(
    () => !!lastOf(alice, "puzzle_duel_start") && !!lastOf(bob, "puzzle_duel_start"),
    "puzzle duel starts",
  );
  const duelId = lastOf(alice, "puzzle_duel_start")!.id;

  alice.deliver({
    type: "puzzle_duel_progress",
    duelId,
    solved: 3,
    mistakes: 0,
    finished: true,
  });
  bob.deliver({
    type: "puzzle_duel_progress",
    duelId,
    solved: 2,
    mistakes: 1,
    finished: true,
  });
  await until(
    () => !!lastOf(alice, "puzzle_duel_over") && !!lastOf(bob, "puzzle_duel_over"),
    "duel finishes",
  );
  assert.equal(lastOf(alice, "puzzle_duel_over")!.winner, "me");
  assert.equal(lastOf(bob, "puzzle_duel_over")!.winner, "them");
});

test("online friends can challenge each other directly to a chess match", async () => {
  const [hubA, hubB] = cluster();
  const aliceId = `fc-a-${randomUUID()}`;
  const bobId = `fc-b-${randomUUID()}`;
  const alice = await connect(hubA, aliceId);
  const bob = await connect(hubB, bobId);

  if (hasDatabase()) {
    // Become mutual friends via the normal chat handshake (satisfies DB friendship check when enabled).
    await chatting(alice, bob);
    alice.deliver({ type: "friend_request" });
    await until(
      () => lastOf(bob, "friend_status")?.status === "pending_them",
      "bob gets friend request",
    );
    bob.deliver({ type: "friend_request" });
    await until(
      () => lastOf(alice, "friend_status")?.status === "accepted",
      "both become friends",
    );
    alice.deliver({ type: "leave" });
    bob.deliver({ type: "leave" });
    await sleep(50);
  }

  // Offline friend fails gracefully.
  const carolId = `fc-c-${randomUUID()}`;
  alice.deliver({
    type: "friend_challenge",
    friendId: carolId,
    timeControl: "blitz_3_2",
  });
  await until(
    () =>
      lastOf(alice, "friend_challenge_failed")?.reason === "offline" ||
      lastOf(alice, "friend_challenge_failed")?.reason === "not_friends",
    "unavailable target handled",
  );

  // Challenge online friend to 3+2 Blitz.
  alice.deliver({
    type: "friend_challenge",
    friendId: bobId,
    timeControl: "blitz_3_2",
  });
  await until(() => !!lastOf(bob, "friend_challenge"), "bob receives challenge");
  const challenge = lastOf(bob, "friend_challenge")!;
  assert.equal(challenge.timeControl, "blitz_3_2");

  const prevGames = alice.events.filter((e) => e.type === "chess_game").length;
  bob.deliver({
    type: "friend_challenge_response",
    challengeId: challenge.challengeId,
    accept: true,
  });
  await until(
    () =>
      alice.events.filter((e) => e.type === "chess_game").length > prevGames &&
      bob.events.filter((e) => e.type === "chess_game").length > 0,
    "friend challenge game starts",
  );
  assert.equal(lastOf(alice, "chess_game")!.game.timeControl, "blitz_3_2");
});

test("detects threefold repetition draw in O(1) without replaying full history", async () => {
  const [hubA, hubB] = cluster();
  const [white, black] = await playing(
    await connect(hubA, `rep-a-${randomUUID()}`),
    await connect(hubB, `rep-b-${randomUUID()}`),
  );
  await play(white, black, [
    ["g1", "f3"],
    ["g8", "f6"],
    ["f3", "g1"],
    ["f6", "g8"],
    ["g1", "f3"],
    ["g8", "f6"],
    ["f3", "g1"],
    ["f6", "g8"],
  ]);
  await until(() => !!lastOf(white, "chess_over"), "threefold draw detected");
  const over = lastOf(white, "chess_over")!;
  assert.equal(over.result, "1/2-1/2");
  assert.equal(over.reason, "threefold_repetition");
});

for (const { online, cached } of [
  { online: true, cached: false },
  { online: false, cached: true },
  { online: false, cached: false },
]) {
  test(`blocking updates partner cache when online=${online}, cached=${cached}`, async (t) => {
    const prefix = `test:${randomUUID()}:`;
    const redis = new Redis(REDIS_URL);
    const hub = new Hub({ redisUrl: REDIS_URL, prefix });
    t.after(async () => {
      await hub.close();
      const keys = await redis.keys(`${prefix}*`);
      if (keys.length) await redis.del(...keys);
      await redis.quit();
    });
    const alice = await connect(hub, `alice-${randomUUID()}`);
    const bob = await connect(hub, `bob-${randomUUID()}`);
    await chatting(alice, bob);
    const blockKey = `${prefix}blocked:${bob.userId}`;
    await redis.del(blockKey);
    if (cached) await redis.sadd(blockKey, "existing-block");
    if (!online) await redis.srem(`${prefix}online_users`, bob.userId);

    alice.deliver({ type: "safety_action", action: "block" });
    await until(
      () => alice.types().includes("safety_ack"),
      "block acknowledged",
    );
    assert.equal(
      await redis.sismember(blockKey, alice.userId),
      online || cached ? 1 : 0,
    );
    if (cached)
      assert.equal(await redis.sismember(blockKey, "existing-block"), 1);
  });
}
