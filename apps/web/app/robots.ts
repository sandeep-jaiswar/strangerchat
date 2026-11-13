import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The chat room is behind auth and has nothing to index. /login is NOT
      // disallowed: it must stay crawlable so its `noindex` tag can be seen.
      disallow: ["/api/", "/chat"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
