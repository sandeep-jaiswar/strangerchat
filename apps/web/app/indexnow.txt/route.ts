import { INDEXNOW_KEY } from "@/lib/indexnow";

export const dynamic = "force-static";

/** IndexNow key file so Bing, DuckDuckGo, Yahoo, and Yandex can verify ownership. */
export function GET() {
  if (!INDEXNOW_KEY) return new Response("Not found", { status: 404 });
  return new Response(`${INDEXNOW_KEY}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
