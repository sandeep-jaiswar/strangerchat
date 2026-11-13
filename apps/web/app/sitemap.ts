import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

const routes: {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  {
    path: "/play-chess-with-strangers",
    priority: 0.95,
    changeFrequency: "weekly",
  },
  { path: "/puzzles", priority: 0.9, changeFrequency: "weekly" },
  { path: "/leaderboard", priority: 0.9, changeFrequency: "daily" },
  { path: "/make-friends-online", priority: 0.9, changeFrequency: "weekly" },
  { path: "/omegle-alternative", priority: 0.85, changeFrequency: "monthly" },
  { path: "/safety", priority: 0.8, changeFrequency: "monthly" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  // No lastModified: a per-request `new Date()` is a false freshness signal,
  // and a single shared date is just as misleading. Add real dates per route
  // once content has an actual edit timestamp.
  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency,
    priority,
  }));
}
