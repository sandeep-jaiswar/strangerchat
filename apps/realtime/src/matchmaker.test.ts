import assert from "node:assert/strict";
import { test } from "node:test";
import type { ServerEvent } from "@repo/protocol";
import { Matchmaker, type Peer } from "./matchmaker.ts";

function peer(id: string, userId = id): Peer & { events: ServerEvent[] } {
  const events: ServerEvent[] = [];
  return { id, userId, events, send: (event) => events.push(event) };
}

test("pairs two waiting peers", () => {
  const mm = new Matchmaker();
  const a = peer("a");
  const b = peer("b");
  mm.find(a);
  assert.deepEqual(a.events, [{ type: "searching" }]);
  mm.find(b);
  assert.deepEqual(a.events.at(-1), { type: "matched" });
  assert.deepEqual(b.events, [{ type: "matched" }]);
  assert.equal(mm.waitingCount, 0);
});

test("never pairs two connections of the same user", () => {
  const mm = new Matchmaker();
  mm.find(peer("a1", "alice"));
  mm.find(peer("a2", "alice"));
  assert.equal(mm.waitingCount, 2);
});

test("relays only to the partner", () => {
  const mm = new Matchmaker();
  const [a, b, c] = [peer("a"), peer("b"), peer("c")];
  mm.find(a);
  mm.find(b);
  mm.find(c);
  assert.equal(mm.relay(a, { type: "typing", isTyping: true }), true);
  assert.deepEqual(b.events.at(-1), { type: "typing", isTyping: true });
  assert.equal(
    c.events.some((e) => e.type === "typing"),
    false,
  );
  assert.equal(mm.relay(c, { type: "typing", isTyping: true }), false);
});

test("skipping notifies the partner and avoids an immediate rematch", () => {
  const mm = new Matchmaker();
  const [a, b, c] = [peer("a"), peer("b"), peer("c")];
  mm.find(a);
  mm.find(b);
  mm.find(a); // a skips b
  assert.deepEqual(b.events.at(-1), { type: "partner_left" });
  mm.find(b);
  assert.equal(mm.waitingCount, 2, "a and b should not be rematched");
  mm.find(c);
  assert.deepEqual(c.events, [{ type: "matched" }]);
  assert.deepEqual(a.events.at(-1), { type: "matched" });
});

test("disconnect removes a peer from the queue", () => {
  const mm = new Matchmaker();
  const a = peer("a");
  mm.find(a);
  mm.disconnect(a);
  assert.equal(mm.waitingCount, 0);
});
