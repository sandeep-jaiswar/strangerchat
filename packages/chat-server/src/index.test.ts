import assert from "node:assert/strict";
import { test } from "node:test";
import { Chess } from "chess.js";
import { CHESS_PUZZLES } from "@repo/protocol";
import { redisPrefix } from "./index.ts";

test("all shared chess puzzles have legal FENs and exact SAN solutions", () => {
  for (const puzzle of CHESS_PUZZLES) {
    const chess = new Chess(puzzle.fen);
    assert.ok(puzzle.solution.length > 0, `${puzzle.id} has non-empty solution`);
    for (const san of puzzle.solution) {
      const move = chess.move(san);
      assert.equal(move.san, san, `${puzzle.id} move ${san} matches exact SAN`);
    }
    if (puzzle.theme.startsWith("Mate")) {
      assert.equal(chess.isCheckmate(), true, `${puzzle.id} ends in checkmate`);
    }
  }
});

test("each environment gets its own pool of people unless told otherwise", () => {
  assert.equal(redisPrefix({}), "sc:");
  assert.equal(redisPrefix({ VERCEL_ENV: "production" }), "sc:");
  assert.equal(redisPrefix({ VERCEL_ENV: "preview" }), "sc:preview:");
  assert.equal(redisPrefix({ VERCEL_ENV: "development" }), "sc:development:");
  assert.equal(
    redisPrefix({ VERCEL_ENV: "preview", CHAT_REDIS_PREFIX: "sc:qa:" }),
    "sc:qa:",
  );
  assert.equal(redisPrefix({ CHAT_REDIS_PREFIX: "" }), "sc:");
});
