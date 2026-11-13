import Link from "next/link";
import { BRAND_GRADIENT, BrandGlyph } from "@/lib/brand-mark";

export function Logo() {
  return (
    <Link
      href="/"
      className="group flex items-center gap-2.5 tracking-[-0.03em]"
    >
      <span
        className="flex size-8 items-center justify-center rounded-[9px] text-white shadow-sm ring-1 ring-inset ring-white/20 transition-transform group-hover:scale-[1.03]"
        style={{ background: BRAND_GRADIENT }}
      >
        <BrandGlyph className="size-6" />
      </span>
      <span className="text-[17px] leading-none">
        <span className="font-bold text-foreground">Fun</span>
        <span className="font-semibold text-primary">stranger</span>
      </span>
    </Link>
  );
}
