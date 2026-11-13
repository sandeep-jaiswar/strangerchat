import { ImageResponse } from "next/og";
import { getChessGameById } from "@funstranger/db";
import { getTimeControl, type TimeControlId } from "@funstranger/protocol";
import { BrandMark, BrandWordmark } from "@/lib/brand-mark";

export const alt = "Funstranger Chess Match Replay";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function GameOpengraphImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const game = await getChessGameById(id);

  if (!game) {
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#18171f",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <BrandMark size={80} rounded />
          <BrandWordmark fontSize={44} suffix=" Chess" />
        </div>
        <div style={{ marginTop: 32, fontSize: 56, fontWeight: 800 }}>
          Match Replay &amp; Analysis
        </div>
      </div>,
      size,
    );
  }

  const tc = getTimeControl(game.timeControl as TimeControlId).label;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background:
          "radial-gradient(circle at 15% 15%, #372d87 0%, #15141c 65%)",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <BrandMark size={72} rounded />
          <BrandWordmark fontSize={38} />
        </div>
        <div
          style={{
            padding: "10px 24px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.1)",
            fontSize: 28,
            color: "#d4d0f0",
          }}
        >
          {tc} Chess · {game.moveCount} plies
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 16,
            fontSize: 52,
            fontWeight: 800,
            lineHeight: 1.15,
          }}
        >
          <span>
            {game.whiteHandle} ({game.whiteRating})
          </span>
          <span style={{ color: "#8f84ff" }}>vs</span>
          <span>
            {game.blackHandle} ({game.blackRating})
          </span>
        </div>
        <div style={{ fontSize: 40, fontWeight: 700, color: "#4ade80" }}>
          Result: {game.result} · {game.reason.replaceAll("_", " ")}
        </div>
      </div>

      <div style={{ fontSize: 28, color: "#b8b5c9" }}>
        funstranger.in · Step-by-step replay &amp; Stockfish analysis
      </div>
    </div>,
    size,
  );
}
