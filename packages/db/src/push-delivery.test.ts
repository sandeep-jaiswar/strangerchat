import assert from "node:assert/strict";
import { mock, test } from "node:test";

const subscriptions = Array.from({ length: 11 }, (_, i) => ({
  endpoint:
    i === 10
      ? "https://127.0.0.1/private"
      : `https://fcm.googleapis.com/send/${i}`,
  p256dh: "synthetic",
  auth: "synthetic",
}));
let active = 0;
let peak = 0;
let delivered = 0;
let removed = 0;
mock.module("./client.ts", {
  namedExports: {
    getDb: async () => ({
      select: () => ({ from: () => ({ where: async () => subscriptions }) }),
      delete: () => ({
        where: async () => {
          removed++;
        },
      }),
    }),
  },
});
mock.module("web-push", {
  namedExports: {
    sendNotification: async (
      sub: { endpoint: string },
      message: string,
      options: { timeout: number },
    ) => {
      assert.equal(options.timeout, 10_000);
      assert.deepEqual(JSON.parse(message), {
        title: "Hello",
        body: "Message",
        url: "/chat",
      });
      active++;
      peak = Math.max(peak, active);
      delivered++;
      await new Promise<void>((resolve) => setImmediate(resolve));
      active--;
      if (sub.endpoint.endsWith("/0")) throw { statusCode: 410 };
    },
  },
});
const { sendUserPush } = await import("./push.ts");

test("delivery bounds concurrency, skips unsafe stored URLs, times out requests and removes expired endpoints", async () => {
  process.env.VAPID_PUBLIC_KEY = "synthetic";
  process.env.VAPID_PRIVATE_KEY = "synthetic";
  await sendUserPush("user", { title: "Hello", body: "Message" });
  assert.equal(delivered, 10);
  assert.equal(peak, 4);
  assert.equal(active, 0);
  assert.equal(removed, 1);
});
