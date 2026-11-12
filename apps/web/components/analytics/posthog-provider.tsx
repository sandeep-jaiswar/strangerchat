"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  CONSENT_CHANGE_EVENT,
  POSTHOG_KEY,
  applyPostHogConsent,
  capturePageview,
  identifyUser,
  initPostHog,
  resetIdentifiedUser,
} from "@/lib/analytics";

function PostHogPageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastUrlRef = useRef<string>("");

  useEffect(() => {
    if (!pathname || !initPostHog()) return;
    const qs = searchParams?.toString();
    const url = qs ? `${window.location.origin}${pathname}?${qs}` : `${window.location.origin}${pathname}`;
    if (url === lastUrlRef.current) return;
    lastUrlRef.current = url;
    capturePageview(url);
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const prevUserIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!POSTHOG_KEY) return;
    initPostHog();

    const onConsentChange = (event: Event) => {
      const detail = (event as CustomEvent<"granted" | "denied">).detail;
      applyPostHogConsent(detail);
    };
    window.addEventListener(CONSENT_CHANGE_EVENT, onConsentChange);
    return () => {
      window.removeEventListener(CONSENT_CHANGE_EVENT, onConsentChange);
    };
  }, []);

  useEffect(() => {
    if (!POSTHOG_KEY) return;
    const userId = session?.user?.id;
    if (userId) {
      identifyUser(userId);
      prevUserIdRef.current = userId;
    } else if (prevUserIdRef.current) {
      resetIdentifiedUser();
      prevUserIdRef.current = undefined;
    }
  }, [session?.user?.id]);

  return (
    <>
      {POSTHOG_KEY ? (
        <Suspense fallback={null}>
          <PostHogPageviewTracker />
        </Suspense>
      ) : null}
      {children}
    </>
  );
}
