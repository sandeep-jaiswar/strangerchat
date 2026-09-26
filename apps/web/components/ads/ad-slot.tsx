"use client";

import { useEffect, useRef } from "react";
import { cn } from "@repo/ui/lib/utils";
import { ADSENSE_CLIENT } from "@/lib/ads";

declare global {
  interface Window {
    adsbygoogle?: object[];
  }
}

interface AdSlotProps {
  slot: string;
  /** "auto" lets AdSense pick a size that fits the container; "vertical" suits sidebars. */
  format?: "auto" | "horizontal" | "vertical" | "rectangle";
  className?: string;
}

export function AdSlot({ slot, format = "auto", className }: AdSlotProps) {
  const ref = useRef<HTMLModElement>(null);
  const enabled = Boolean(ADSENSE_CLIENT && slot);

  useEffect(() => {
    const ins = ref.current;
    // AdSense marks a filled unit with data-adsbygoogle-status; pushing twice throws.
    if (!enabled || !ins || ins.dataset.adsbygoogleStatus) return;
    try {
      (window.adsbygoogle = window.adsbygoogle ?? []).push({});
    } catch {
      // Ad blockers and not-yet-approved sites land here; the page should still work.
    }
  }, [enabled]);

  if (!enabled) {
    if (process.env.NODE_ENV !== "development") return null;
    return (
      <div
        className={cn(
          "flex min-h-24 items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground",
          className,
        )}
      >
        Ad placeholder ({format})
      </div>
    );
  }

  return (
    <div className={cn("w-full overflow-hidden", className)}>
      <p className="mb-1 text-center text-[10px] tracking-wider text-muted-foreground uppercase">
        Advertisement
      </p>
      <ins
        ref={ref}
        className="adsbygoogle block"
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
