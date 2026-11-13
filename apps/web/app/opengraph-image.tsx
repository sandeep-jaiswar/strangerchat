import { ImageResponse } from "next/og";
import { BrandMark, BrandWordmark } from "@/lib/brand-mark";

export const alt = "Funstranger - chat with strangers, make friends & play chess";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 80,
        background:
          "radial-gradient(circle at 20% 0%, #3a2f8f 0%, #18171f 55%)",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <BrandMark size={96} rounded />
        <BrandWordmark fontSize={48} />
      </div>
      <div
        style={{
          marginTop: 56,
          fontSize: 72,
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: -2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <span>Talk to a stranger.</span>
        <span style={{ color: "#8f84ff" }}>Play chess &amp; make friends.</span>
      </div>
      <div style={{ marginTop: 36, fontSize: 30, color: "#b8b5c9" }}>
        funstranger.in · Anonymous chat · 1+0, 3+2, 5+0 &amp; 10+0 Chess · Daily Puzzles
      </div>
    </div>,
    size,
  );
}
