import assert from "node:assert/strict";
import { test } from "node:test";
import { redisPrefix } from "./index.ts";

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
