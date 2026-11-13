import type { Metadata } from "next";

/** Canonical origin used for metadata, sitemap and structured data. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://funstranger.in"
).replace(/\/$/, "");

export const SITE_NAME = "Funstranger";

// Kept within common SERP display limits (~60 chars title, ~160 chars description).
export const SITE_TITLE =
  "Funstranger - Free Anonymous Chat with Strangers & Chess";

export const SITE_DESCRIPTION =
  "Chat with strangers anonymously for free on Funstranger. Play 1-on-1 chess (Bullet, Blitz, Rapid), solve daily puzzles, and make friends safely.";

export const SITE_KEYWORDS = [
  "funstranger",
  "funstranger.in",
  "stranger chat",
  "chat with strangers",
  "talk to strangers",
  "play chess with strangers",
  "make friends online",
  "random chat",
  "anonymous chat",
  "Omegle alternative",
  "chess chat",
  "meet new people online",
];

const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Funstranger - free anonymous chat with strangers and live chess",
};

/**
 * Per-page metadata with a canonical URL and complete social cards. Next replaces
 * (rather than merges) `openGraph`/`twitter` objects from the layout, so every page
 * sets them in full here.
 */
export function pageMetadata({
  path,
  title,
  description,
  socialTitle,
}: {
  path: string;
  /** `<title>` text; the layout template appends the site name. Omit on the home page. */
  title?: string;
  description: string;
  /** Headline for share cards when it should differ from `<title>`. */
  socialTitle?: string;
}): Metadata {
  const ogTitle =
    socialTitle ?? (title ? `${title} · ${SITE_NAME}` : SITE_TITLE);
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_US",
      url: path,
      title: ogTitle,
      description,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [OG_IMAGE.url],
    },
  };
}
