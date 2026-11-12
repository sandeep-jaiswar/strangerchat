"use client";

import { useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import { Button } from "@funstranger/ui/components/button";
import { CONSENT_CHANGE_EVENT, CONSENT_STORAGE_KEY } from "@/lib/analytics";
import { ADSENSE_CLIENT } from "@/lib/ads";

const STORAGE_KEY = CONSENT_STORAGE_KEY;

type ConsentChoice = "granted" | "denied" | null;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function pushConsent(choice: "granted" | "denied") {
  window.dataLayer = window.dataLayer ?? [];
  const gtag =
    window.gtag ??
    function (...args: unknown[]) {
      window.dataLayer?.push(args);
    };
  gtag("consent", "update", {
    ad_storage: choice,
    ad_user_data: choice,
    ad_personalization: choice,
    analytics_storage: choice,
  });
}

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot(): ConsentChoice {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    return val === "granted" || val === "denied" ? val : null;
  } catch {
    return "denied";
  }
}

function getServerSnapshot(): ConsentChoice {
  return "denied";
}

export function ConsentBanner() {
  const choice = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const choose = useCallback((value: "granted" | "denied") => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Ignore storage errors in private browsing.
    }
    pushConsent(value);
    window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: value }));
    for (const fn of listeners) fn();
  }, []);

  if (!ADSENSE_CLIENT || choice !== null) return null;

  return (
    <aside
      aria-label="Cookie and ad preferences"
      className="fixed right-4 bottom-4 left-4 z-40 mx-auto max-w-xl rounded-xl border bg-card/95 p-4 shadow-lg backdrop-blur"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Funstranger uses cookies for Google sign-in and to show ads that keep
          the site free. See our{" "}
          <Link href="/privacy" className="text-foreground underline">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => choose("denied")}
          >
            Non-personalized
          </Button>
          <Button size="sm" onClick={() => choose("granted")}>
            Accept all
          </Button>
        </div>
      </div>
    </aside>
  );
}
