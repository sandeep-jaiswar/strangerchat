#!/usr/bin/env node
/**
 * Submits all URLs from sitemap.xml to IndexNow (Bing, DuckDuckGo, Yahoo, Yandex, Naver).
 * Usage: pnpm seo:ping
 */

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://funstranger.in"
).replace(/\/$/, "");
const INDEXNOW_KEY =
  process.env.INDEXNOW_KEY || "3e2f6e540f92b5b78001f37dd4bd261a";

const host = new URL(SITE_URL).host;
const keyLocation = `${SITE_URL}/indexnow.txt`;

const keyRes = await fetch(keyLocation);
const keyBody = (await keyRes.text()).trim();
if (!keyRes.ok || keyBody !== INDEXNOW_KEY) {
  console.error(
    `IndexNow key check failed at ${keyLocation}: status=${keyRes.status}`,
  );
  process.exit(1);
}

const sitemapRes = await fetch(`${SITE_URL}/sitemap.xml`);
if (!sitemapRes.ok) {
  console.error(`Failed to fetch sitemap.xml: status=${sitemapRes.status}`);
  process.exit(1);
}
const sitemapXml = await sitemapRes.text();
const urlList = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
  (m) => m[1],
);

if (urlList.length === 0) {
  console.error("No URLs found in sitemap.xml");
  process.exit(1);
}

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host, key: INDEXNOW_KEY, keyLocation, urlList }),
});

const text = await response.text();
console.log(
  `IndexNow submitted ${urlList.length} URLs for ${host}: HTTP ${response.status}${text ? ` - ${text}` : ""}`,
);
if (!response.ok) process.exit(1);
