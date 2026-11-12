#!/usr/bin/env node
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { inspect } from "node:util";
import { chromium } from "playwright";

const requireWeb = createRequire(new URL("../apps/web/package.json", import.meta.url));
const requireDb = createRequire(new URL("../packages/db/package.json", import.meta.url));
const requireChat = createRequire(new URL("../packages/chat-server/package.json", import.meta.url));
const { encode } = requireWeb("next-auth/jwt");
const { Pool } = requireDb("pg");
const Redis = requireChat("ioredis");

const BASE_URL = process.env.E2E_BASE_URL || "http://localhost:3000";
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
const DATABASE_URL = process.env.DATABASE_URL;
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

if (!NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET must be set (run with --env-file-if-exists=apps/web/.env.local)");
}

const ALICE = {
  sub: "e2e-alice-user",
  name: "Alice Test",
  email: "alice-e2e@example.com",
};
const BOB = {
  sub: "e2e-bob-user",
  name: "Bob Test",
  email: "bob-e2e@example.com",
};

async function cleanupTestData() {
  if (DATABASE_URL) {
    const pool = new Pool({ connectionString: DATABASE_URL });
    try {
      await pool.query("DELETE FROM users WHERE id IN ($1, $2)", [ALICE.sub, BOB.sub]);
    } catch (err) {
      if (err?.code !== "42P01") throw err;
    } finally {
      await pool.end();
    }
  }
  const redis = new Redis(REDIS_URL);
  await redis.del(`sc:blocked:${ALICE.sub}`, `sc:blocked:${BOB.sub}`);
  await redis.quit();
}

async function createAuthedContext(browser, user) {
  const token = await encode({
    token: { sub: user.sub, name: user.name, email: user.email },
    secret: NEXTAUTH_SECRET,
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 860 } });
  context.setDefaultTimeout(60000);
  context.setDefaultNavigationTimeout(60000);
  const url = new URL(BASE_URL);
  await context.addCookies([
    {
      name: "next-auth.session-token",
      value: token,
      domain: url.hostname,
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
  return context;
}

async function clickMove(page, from, to) {
  await page.locator(`[data-square="${from}"]`).click();
  await page.locator(`[data-square="${to}"]`).click();
}

async function main() {
  await cleanupTestData();

  const launchOptions = existsSync("/usr/bin/google-chrome")
    ? { headless: true, executablePath: "/usr/bin/google-chrome" }
    : { headless: true };
  const browserA = await chromium.launch(launchOptions);
  const browserB = await chromium.launch(launchOptions);
  const errors = [];

  try {
    console.log("1. Checking public pages, AdSense, ConsentBanner & /puzzles...");
    const publicCtx = await browserA.newContext({ viewport: { width: 1280, height: 860 } });
    publicCtx.setDefaultTimeout(60000);
    publicCtx.setDefaultNavigationTimeout(60000);
    const publicPage = await publicCtx.newPage();
    publicPage.on("pageerror", (err) => errors.push(`public pageerror: ${err.message}`));

    await publicPage.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
    await publicPage.getByRole("heading", { level: 1 }).waitFor();
    const adsScript = publicPage.locator('head script[src*="adsbygoogle.js?client=ca-pub-3834685478743012"]');
    assert.equal(await adsScript.count(), 1, "AdSense script must be present in <head>");

    const acceptCookies = publicPage.getByRole("button", { name: "Accept all" });
    if (await acceptCookies.isVisible().catch(() => false)) {
      await acceptCookies.click();
    }

    await publicPage.goto(`${BASE_URL}/puzzles`, { waitUntil: "domcontentloaded" });
    await clickMove(publicPage, "a1", "a8");
    await publicPage.getByText("Solved! (Ra8#)").waitFor({ timeout: 5000 });

    for (const path of ["/play-chess-with-strangers", "/make-friends-online", "/ads.txt", "/indexnow.txt", "/sitemap.xml"]) {
      const res = await publicPage.request.get(`${BASE_URL}${path}`, { timeout: 60000 });
      assert.equal(res.status(), 200, `${path} must return 200`);
    }
    await publicCtx.close();

    console.log("2. Opening 2 authenticated Playwright browser instances (Alice & Bob)...");
    const ctxA = await createAuthedContext(browserA, ALICE);
    const ctxB = await createAuthedContext(browserB, BOB);
    const pageA = await ctxA.newPage();
    const pageB = await ctxB.newPage();
    pageA.on("pageerror", (err) => {
      const text = inspect(err);
      if (text.includes("googlesyndication") || text.includes("TagError")) return;
      errors.push(`Alice pageerror: ${text}`);
    });
    pageB.on("pageerror", (err) => {
      const text = inspect(err);
      if (text.includes("googlesyndication") || text.includes("TagError")) return;
      errors.push(`Bob pageerror: ${text}`);
    });

    await Promise.all([
      pageA.goto(`${BASE_URL}/chat`, { waitUntil: "domcontentloaded" }),
      pageB.goto(`${BASE_URL}/chat`, { waitUntil: "domcontentloaded" }),
    ]);

    await Promise.all([
      pageA.getByRole("button", { name: "Start chatting" }).waitFor({ state: "visible", timeout: 15000 }),
      pageB.getByRole("button", { name: "Start chatting" }).waitFor({ state: "visible", timeout: 15000 }),
    ]);
    await Promise.all([
      pageA.waitForFunction(
        () => {
          const btn = [...document.querySelectorAll("button")].find((el) =>
            el.textContent?.includes("Start chatting"),
          );
          return Boolean(btn && !btn.disabled);
        },
        null,
        { timeout: 15000 },
      ),
      pageB.waitForFunction(
        () => {
          const btn = [...document.querySelectorAll("button")].find((el) =>
            el.textContent?.includes("Start chatting"),
          );
          return Boolean(btn && !btn.disabled);
        },
        null,
        { timeout: 15000 },
      ),
    ]);

    await Promise.all([
      pageA.getByText("1200").first().waitFor({ timeout: 10000 }),
      pageB.getByText("1200").first().waitFor({ timeout: 10000 }),
    ]);

    console.log("3. Matching by #chess interest tag, testing live typing & moderation...");
    await pageA.getByRole("button", { name: "#chess" }).click();
    await pageB.getByRole("button", { name: "#chess" }).click();

    await pageA.getByRole("button", { name: "Start chatting" }).click();
    await pageB.getByRole("button", { name: "Start chatting" }).click();

    await Promise.all([
      pageA.getByText("Shared interests: #chess.").waitFor({ timeout: 15000 }),
      pageB.getByText("Shared interests: #chess.").waitFor({ timeout: 15000 }),
    ]);

    const inputA = pageA.getByRole("textbox", { name: "Message" });
    await inputA.fill("hi from alice");
    await pageB.getByText("Typing…").waitFor({ timeout: 5000 });
    await inputA.press("Enter");
    await pageB.getByText("hi from alice").waitFor({ timeout: 5000 });

    const inputB = pageB.getByRole("textbox", { name: "Message" });
    await inputB.fill("what the fuck is going on");
    await inputB.press("Enter");
    await pageA.getByText(/what the .+ is going on/).waitFor({ timeout: 5000 });
    const bodyTextA = await pageA.locator("ol").textContent();
    assert.ok(!bodyTextA?.includes("fuck"), "Profanity must be censored by obscenity");

    console.log("4. Inviting to play chess mid-chat and playing Fool's Mate to checkmate...");
    await pageA.getByRole("button", { name: /Play chess/i }).click();
    await pageB.getByText("Stranger wants to play a 10+0 chess game!").waitFor({ timeout: 5000 });
    await pageB.getByRole("button", { name: "Play", exact: true }).click();

    await Promise.all([
      pageA.locator('[data-square="f2"]').waitFor({ timeout: 10000 }),
      pageB.locator('[data-square="f2"]').waitFor({ timeout: 10000 }),
    ]);

    const aliceIsWhite = await pageA
      .getByText("Chess game started — you're playing white.")
      .isVisible()
      .catch(() => false);
    const whitePage = aliceIsWhite ? pageA : pageB;
    const blackPage = aliceIsWhite ? pageB : pageA;

    await whitePage.getByText(/First move:/).waitFor({ timeout: 5000 });
    await clickMove(whitePage, "f2", "f3");

    await blackPage.getByText(/First move:/).waitFor({ timeout: 5000 });
    await clickMove(blackPage, "e7", "e5");

    await whitePage.getByText("Your move").waitFor({ timeout: 5000 });
    await clickMove(whitePage, "g2", "g4");

    await blackPage.getByText("Your move").waitFor({ timeout: 5000 });
    await clickMove(blackPage, "d8", "h4");

    await Promise.all([
      blackPage.getByText("You won by checkmate").first().waitFor({ timeout: 10000 }),
      whitePage.getByText("You lost by checkmate").first().waitFor({ timeout: 10000 }),
    ]);

    console.log("5. Verifying Postgres Elo update + mutual Add Friend + persistent DM...");
    await blackPage.getByRole("banner").getByRole("button", { name: /Friends/i }).click();
    await blackPage.getByText(/Chess record: 1W · 0L · 0D/).waitFor({ timeout: 10000 });
    await blackPage.getByText("Elo 1216").waitFor({ timeout: 5000 });
    await blackPage.getByRole("button", { name: "Close drawer" }).click();

    await pageA.getByRole("button", { name: "Add friend" }).click();
    await pageB.getByRole("button", { name: "Accept friend" }).waitFor({ timeout: 5000 });
    await pageB.getByRole("button", { name: "Accept friend" }).click();

    await Promise.all([
      pageA.getByText(/are now friends!/).waitFor({ timeout: 10000 }),
      pageB.getByText(/are now friends!/).waitFor({ timeout: 10000 }),
    ]);

    await pageA.getByRole("banner").getByRole("button", { name: /Friends/i }).click();
    await pageA.getByRole("button", { name: "Message", exact: true }).first().click();
    const dmInput = pageA.locator('textarea[placeholder^="Message "]');
    await dmInput.fill("GG! Let us play again later");
    await dmInput.press("Enter");
    await pageA.getByText("GG! Let us play again later").waitFor({ timeout: 5000 });
    await pageA.getByRole("button", { name: "Close drawer" }).click();

    await pageB.getByRole("banner").getByRole("button", { name: /Friends/i }).click();
    await pageB.getByRole("button", { name: "Message", exact: true }).first().click();
    await pageB.getByText("GG! Let us play again later").waitFor({ timeout: 10000 });
    await pageB.getByRole("button", { name: "Close drawer" }).click();

    console.log("6. Verifying Block & Skip prevents re-matching...");
    await pageA.getByRole("button", { name: "Safety options" }).click();
    await pageA.getByRole("menuitem", { name: "Block & skip stranger" }).click();
    await Promise.all([
      pageA.getByText("User blocked. You won't be matched again.").first().waitFor({ timeout: 5000 }),
      pageB.getByText("Stranger has left the chat.").waitFor({ timeout: 5000 }),
    ]);

    await pageA.getByRole("button", { name: "Find a new stranger" }).click();
    await pageB.getByRole("button", { name: "Find a new stranger" }).click();
    await Promise.all([
      pageA.getByText("Looking for a stranger…").waitFor({ timeout: 5000 }),
      pageB.getByText("Looking for a stranger…").waitFor({ timeout: 5000 }),
    ]);
    await pageA.waitForTimeout(1500);
    assert.equal(await pageA.getByText("Looking for a stranger…").isVisible(), true, "Blocked users must stay separate");
    assert.equal(await pageB.getByText("Looking for a stranger…").isVisible(), true, "Blocked users must stay separate");

    assert.deepEqual(errors, [], `Unexpected browser errors: ${errors.join("; ")}`);
    console.log("ALL E2E FLOWS PASSED WITH 2 PLAYWRIGHT INSTANCES!");
  } finally {
    await browserA.close();
    await browserB.close();
    await cleanupTestData();
  }
}

main().catch((err) => {
  console.error("E2E FAILED:", err);
  process.exit(1);
});
