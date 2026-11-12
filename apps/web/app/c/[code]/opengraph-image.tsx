import { ImageResponse } from "next/og";
import { BrandMark } from "@/lib/brand-mark";

export const alt = "You're invited to chat and play chess on Funstranger";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function InviteOpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background:
          "radial-gradient(circle at 20% 10%, #3a2f8f 0%, #15141c 65%)",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <BrandMark size={88} rounded />
        <div style={{ fontSize: 44, fontWeight: 700 }}>Funstranger</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 66, fontWeight: 800, lineHeight: 1.1 }}>
          You&apos;re invited to play 1-on-1!
        </div>
        <div style={{ fontSize: 34, color: "#b9b3ff" }}>
          Open this link to join your private Chess &amp; Chat room instantly.
        </div>
      </div>
      <div style={{ fontSize: 28, color: "#b8b5c9" }}>
        funstranger.in · 1+0, 3+2, 5+0 &amp; 10+0 Chess · Google anti-spam verified
      </div>
    </div>,
    size,
  );
}
