import { ADSENSE_CLIENT } from "@/lib/ads";

export const dynamic = "force-static";

/** AdSense requires /ads.txt to authorize this site to sell ads under our publisher id. */
export function GET() {
  if (!ADSENSE_CLIENT) return new Response("Not found", { status: 404 });
  const publisherId = ADSENSE_CLIENT.replace(/^ca-/, "");
  return new Response(
    `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`,
    {
      headers: { "Content-Type": "text/plain" },
    },
  );
}
