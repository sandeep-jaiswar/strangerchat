import assert from "node:assert/strict";
import { test } from "node:test";
import { analyzeGameMoves } from "./stockfish.ts";

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
