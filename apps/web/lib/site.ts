import type { Metadata } from "next";

/** Canonical origin used for metadata, sitemap and structured data. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://strangerchat.vercel.app"
).replace(/\/$/, "");

export const SITE_NAME = "StrangerChat";

export const SITE_TITLE = "StrangerChat — Free Anonymous Chat with Strangers";

export const SITE_DESCRIPTION =
  "Talk to strangers online for free. StrangerChat instantly matches you with a random person for an anonymous one-on-one text chat — no bots, no profiles, no messages stored. A safer Omegle alternative.";

export const SITE_KEYWORDS = [
  "stranger chat",
  "chat with strangers",
  "talk to strangers",
  "random chat",
  "anonymous chat",
  "free chat rooms",
  "online chat with strangers",
  "random text chat",
  "Omegle alternative",
  "chat with random people",
  "meet new people online",
];

const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "StrangerChat — free anonymous chat with strangers",
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
