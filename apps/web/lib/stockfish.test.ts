import assert from "node:assert/strict";
import { test } from "node:test";
import { StockfishClient, analyzeGameMoves } from "./stockfish.ts";

test("aborting analysis settles initialization and active evaluation and terminates its worker", async () => {
  const original = globalThis.Worker;
  for (const ready of [false, true]) {
    let worker: FakeWorker | undefined;
    let evaluating!: () => void;
    const started = new Promise<void>((resolve) => {
      evaluating = resolve;
    });
    class FakeWorker {
      onmessage: ((event: { data: string }) => void) | null = null;
      terminated = false;
      constructor() {
        worker = this;
      }
      postMessage(command: string) {
        if (!ready) {
          evaluating();
          return;
        }
        if (command === "uci")
          queueMicrotask(() => this.onmessage?.({ data: "uciok" }));
        if (command === "isready")
          queueMicrotask(() => this.onmessage?.({ data: "readyok" }));
        if (command.startsWith("go ")) evaluating();
      }
      terminate() {
        this.terminated = true;
      }
    }
    globalThis.Worker = FakeWorker as unknown as typeof Worker;
    try {
      const controller = new AbortController();
      const result = analyzeGameMoves(
        ["e4", "e5"],
        undefined,
        controller.signal,
      );
      await started;
      controller.abort();
      await assert.rejects(result, /disposed/);
      assert.equal(worker?.terminated, true);
    } finally {
      globalThis.Worker = original;
    }
  }
});

test("already cancelled analysis never starts a worker", async () => {
  await assert.rejects(
    analyzeGameMoves(["e4"], undefined, AbortSignal.abort()),
    { name: "AbortError" },
  );
});

test("worker runtime error settles active command and lets subsequent calls recover", async () => {
  const original = globalThis.Worker;
  let count = 0;
  let activeWorker: FakeWorker | undefined;
  class FakeWorker {
    onmessage: ((event: { data: string }) => void) | null = null;
    onerror: ((err: { message?: string }) => void) | null = null;
    terminated = false;
    constructor() {
      count++;
      activeWorker = this;
    }
    postMessage(command: string) {
      if (command === "uci") {
        queueMicrotask(() => this.onmessage?.({ data: "uciok" }));
      } else if (command === "isready") {
        queueMicrotask(() => this.onmessage?.({ data: "readyok" }));
      } else if (command.startsWith("go ")) {
        if (count === 1) {
          queueMicrotask(() => this.onerror?.({ message: "WASM crashed" }));
        } else {
          queueMicrotask(() => this.onmessage?.({ data: "bestmove e2e4" }));
        }
      }
    }
    terminate() {
      this.terminated = true;
    }
  }
  globalThis.Worker = FakeWorker as unknown as typeof Worker;
  const client = new StockfishClient();
  try {
    await assert.rejects(
      client.bestMove("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", "club"),
      /WASM crashed/,
    );
    assert.equal(activeWorker?.terminated, true);
    const recovered = await client.bestMove(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      "club",
    );
    assert.equal(recovered, "e2e4");
    assert.equal(count, 2);
  } finally {
    client.dispose();
    globalThis.Worker = original;
  }
});
