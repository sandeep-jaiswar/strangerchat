"use client";

import { useEffect, useState } from "react";

/**
 * Height of the visible viewport. iOS Safari ignores `interactive-widget`, so when the
 * keyboard opens `100dvh` still includes the area behind it; this tracks the real size.
 */
export function useViewportHeight() {
  const [height, setHeight] = useState<number>();

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const update = () => {
      setHeight(viewport.height);
      // iOS scrolls the page up to reveal the input; pin it so the header stays visible.
      window.scrollTo(0, 0);
    };
    update();
    viewport.addEventListener("resize", update);
    return () => viewport.removeEventListener("resize", update);
  }, []);

  return height;
}
