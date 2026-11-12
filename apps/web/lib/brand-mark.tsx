/** The logo tile rendered with inline styles so it works inside `ImageResponse`. */
export function BrandMark({
  size,
  rounded = false,
}: {
  size: number;
  rounded?: boolean;
}) {
  const glyph = Math.round(size * 0.62);
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #6d5ff5 0%, #4a3bd1 60%, #0ea5e9 100%)",
        borderRadius: rounded ? size * 0.24 : 0,
      }}
    >
      {/* Funstranger mark: speech bubble framing a chess crown */}
      <svg
        width={glyph}
        height={glyph}
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        <path
          d="M8.5 14.5h7l-.7-4-2 1.7-1.3-2.5-1.3 2.5-2-1.7-.7 4z"
          fill="white"
          stroke="white"
          strokeWidth={1.2}
        />
      </svg>
    </div>
  );
}
