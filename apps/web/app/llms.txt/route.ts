import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

/**
 * llms.txt: a plain-Markdown map of the public pages for LLM tools.
 * Community format (llmstxt.org). Lighthouse checks its format; Google Search ignores it.
 * Only public, indexable pages are listed. /chat, /login and /api are excluded.
 */
const PAGES: { title: string; path: string; note: string }[] = [
  {
    title: "Play chess with strangers",
    path: "/play-chess-with-strangers",
    note: "Live 1-on-1 chess: Bullet, Blitz and Rapid.",
  },
  {
    title: "Chess puzzles",
    path: "/puzzles",
    note: "Free interactive tactics trainer.",
  },
  {
    title: "Leaderboard",
    path: "/leaderboard",
    note: "Top anonymous chess players and daily puzzle standings.",
  },
  {
    title: "Make friends online",
    path: "/make-friends-online",
    note: "Meet people by shared interests, one-on-one.",
  },
  {
    title: "Omegle alternative",
    path: "/omegle-alternative",
    note: "Random chat with strangers, as a free alternative.",
  },
  {
    title: "Safety tips",
    path: "/safety",
    note: "Practical advice for chatting with strangers safely.",
  },
  {
    title: "About",
    path: "/about",
    note: "What the site is and how it works.",
  },
  {
    title: "Privacy policy",
    path: "/privacy",
    note: "How accounts, chats and sign-in data are handled.",
  },
  {
    title: "Terms of service",
    path: "/terms",
    note: "Eligibility (18+) and rules of use.",
  },
];

export function GET() {
  const lines = [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    "## Pages",
    "",
    ...PAGES.map((p) => `- [${p.title}](${SITE_URL}${p.path}): ${p.note}`),
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
