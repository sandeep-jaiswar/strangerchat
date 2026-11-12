import assert from "node:assert/strict";
import { test } from "node:test";
import { isSafePushEndpoint } from "./push.ts";

test("push destinations require a recognized HTTPS service", () => {
  for (const host of [
    "fcm.googleapis.com",
    "updates.push.services.mozilla.com",
    "web.push.apple.com",
  ]) {
    assert.equal(isSafePushEndpoint(`https://${host}/send/token`), true);
  }
  for (const endpoint of [
    "http://fcm.googleapis.com/send/token",
    "https://127.0.0.1/",
    "https://[::1]/",
    "https://169.254.169.254/",
    "https://localhost/",
    "https://example.com/",
    "https://fcm.googleapis.com.evil.example/",
    "https://fcm.googleapis.com@127.0.0.1/",
    "https://user@fcm.googleapis.com/",
    "https://fcm.googleapis.com:8443/",
    "https://fcm.googleapis.com/#fragment",
    "not a URL",
  ])
    assert.equal(isSafePushEndpoint(endpoint), false, endpoint);
});
