"use client";

import { useEffect, useRef, useState } from "react";
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

const NUMERIC_SLOT = /^\d+$/;

export function AdSlot({ slot, format = "auto", className }: AdSlotProps) {
  const ref = useRef<HTMLModElement>(null);
  const [unfilled, setUnfilled] = useState(false);
  const validSlot = NUMERIC_SLOT.test(slot);
  const enabled = Boolean(ADSENSE_CLIENT && validSlot);

  useEffect(() => {
    const ins = ref.current;
    if (!enabled || !ins) return;

    const observer = new MutationObserver(() => {
      if (ins.dataset.adStatus === "unfilled") setUnfilled(true);
      else if (ins.dataset.adStatus === "filled") setUnfilled(false);
    });
    observer.observe(ins, {
      attributes: true,
      attributeFilter: ["data-ad-status"],
    });

    // AdSense marks a filled unit with data-adsbygoogle-status; pushing twice throws.
    if (!ins.dataset.adsbygoogleStatus) {
      try {
        (window.adsbygoogle = window.adsbygoogle ?? []).push({});
      } catch {
        // Ad blockers and not-yet-approved sites land here; the page should still work.
      }
    }

    return () => observer.disconnect();
  }, [enabled]);

  if (!enabled) {
    if (process.env.NODE_ENV !== "development") return null;
    return (
      <div
        className={cn(
          "flex min-h-24 items-center justify-center rounded-lg border border-dashed px-3 text-center text-xs text-muted-foreground",
          className,
        )}
      >
        {slot && !validSlot
          ? `Invalid AdSense slot "${slot}" (use numeric Display unit ID, not ca-app-pub-…)`
          : `Ad placeholder (${format})`}
      </div>
    );
  }

  if (unfilled) return null;

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
