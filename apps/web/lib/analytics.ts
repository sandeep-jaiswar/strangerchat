"use client";

import posthog from "posthog-js";

export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim() || "";
export const POSTHOG_HOST = (
  process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://eu.i.posthog.com"
).replace(/\/$/, "");
export const POSTHOG_UI_HOST = POSTHOG_HOST.includes("eu.")
  ? "https://eu.posthog.com"
  : "https://us.posthog.com";

export const CONSENT_STORAGE_KEY = "sc_ad_consent_v1";
export const CONSENT_CHANGE_EVENT = "sc-consent-change";

let initialized = false;

export function isPostHogReady(): boolean {
  return typeof window !== "undefined" && Boolean(POSTHOG_KEY) && initialized;
}

export function applyPostHogConsent(choice: "granted" | "denied" | null) {
  if (!initPostHog()) return;
  if (choice === "granted") {
    posthog.opt_in_capturing();
  } else if (choice === "denied") {
    posthog.opt_out_capturing();
  }
}

export function initPostHog(): boolean {
  if (typeof window === "undefined" || !POSTHOG_KEY) return false;
  if (initialized) return true;

  posthog.init(POSTHOG_KEY, {
    api_host: "/ingest",
    ui_host: POSTHOG_UI_HOST,
    capture_pageview: false,
    capture_pageleave: true,
    cookieless_mode: "on_reject",
    person_profiles: "identified_only",
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: ".ph-no-capture",
    },
    loaded: (ph) => {
      try {
        const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
        if (stored === "granted") ph.opt_in_capturing();
        else if (stored === "denied") ph.opt_out_capturing();
      } catch {
        // Ignore storage errors in private browsing.
      }
    },
  });

  initialized = true;
  return true;
}

export function capturePageview(url: string) {
  if (!initPostHog()) return;
  posthog.capture("$pageview", { $current_url: url });
}

export function captureEvent(
  event: string,
  properties?: Record<string, string | number | boolean | null>,
) {
  if (!initPostHog()) return;
  posthog.capture(event, properties);
}

export function identifyUser(userId: string | undefined | null) {
  if (!initPostHog() || !userId) return;
  if (posthog.get_distinct_id() !== userId) {
    posthog.identify(userId);
  }
}

export function resetIdentifiedUser() {
  if (!isPostHogReady()) return;
  posthog.reset();
}
