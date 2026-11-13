import type { CSSProperties } from "react";

export const BRAND_GRADIENT =
  "linear-gradient(140deg, #7668ff 0%, #5240de 54%, #1d8cf8 100%)";

/** Sculpted speech bubble framing a negative-space Staunton chess knight. */
const BRAND_GLYPH_PATH = [
  "M 32 8",
  "C 47.5 8 57 16.5 57 30.5",
  "C 57 44.5 47.5 53 32 53",
  "C 28.2 53 24.6 52.3 21.4 51.0",
  "C 18.2 53.2 13.8 55.2 9.4 56.4",
  "C 8.5 56.7 7.8 55.7 8.4 55.0",
  "C 10.3 52.8 11.9 49.8 12.8 46.6",
  "C 8.8 42.5 7 36.9 7 30.5",
  "C 7 16.5 16.5 8 32 8 Z",
  "M 23.0 41.3 A 1.2 1.2 0 0 0 21.8 42.5 L 21.8 43.1 A 1.2 1.2 0 0 0 23.0 44.3 L 39.6 44.3 A 1.2 1.2 0 0 0 40.8 43.1 L 40.8 42.5 A 1.2 1.2 0 0 0 39.6 41.3 Z",
  "M 23.2 39.5",
  "L 38.6 39.5",
  "C 38.6 34.0 35.9 29.9 32.1 28.0",
  "C 33.4 27.0 35.2 27.0 36.8 27.8",
  "L 40.5 29.7",
  "C 41.5 30.2 42.6 29.7 43.0 28.7",
  "L 43.7 26.9",
  "C 44.0 25.9 43.6 24.9 42.7 24.3",
  "L 37.3 20.4",
  "L 35.2 15.6",
  "C 34.8 14.8 33.8 14.7 33.2 15.3",
  "L 31.2 17.6",
  "C 26.4 20.8 22.8 26.8 23.0 34.6",
  "L 23.2 39.5 Z",
].join(" ");

export function BrandGlyph({
  size,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden
    >
      <path
        d={BRAND_GLYPH_PATH}
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  );
}

/** The logo tile rendered with inline styles so it works inside `ImageResponse`. */
export function BrandMark({
  size,
  rounded = false,
}: {
  size: number;
  rounded?: boolean;
}) {
  const glyph = Math.round(size * 0.78);
  const style: CSSProperties = {
    width: size,
    height: size,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    background: BRAND_GRADIENT,
    borderRadius: rounded ? Math.round(size * 0.24) : 0,
  };

  return (
    <div style={style}>
      <BrandGlyph size={glyph} />
    </div>
  );
}

/** Inline-styled wordmark for `ImageResponse` OG cards. */
export function BrandWordmark({
  fontSize,
  suffix,
}: {
  fontSize: number;
  suffix?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        fontSize,
        fontWeight: 700,
        letterSpacing: -fontSize * 0.03,
      }}
    >
      <span style={{ color: "#ffffff" }}>Fun</span>
      <span style={{ color: "#988dff" }}>stranger</span>
      {suffix ? <span style={{ color: "#ffffff" }}>{suffix}</span> : null}
    </div>
  );
}
