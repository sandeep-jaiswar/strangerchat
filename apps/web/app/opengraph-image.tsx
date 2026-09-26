import { ImageResponse } from "next/og";
import { BrandMark } from "@/lib/brand-mark";

export const alt = "StrangerChat — free anonymous chat with strangers";
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
        <div style={{ fontSize: 48, fontWeight: 700 }}>StrangerChat</div>
      </div>
      <div
        style={{
          marginTop: 56,
          fontSize: 76,
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: -2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <span>Talk to a stranger.</span>
        <span style={{ color: "#8f84ff" }}>Instantly.</span>
      </div>
      <div style={{ marginTop: 36, fontSize: 32, color: "#b8b5c9" }}>
        Free, anonymous one-on-one chat · No bots · Nothing stored
      </div>
    </div>,
    size,
  );
}
