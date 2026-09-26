/** The logo tile rendered with inline styles so it works inside `ImageResponse`. */
export function BrandMark({
  size,
  rounded = false,
}: {
  size: number;
  rounded?: boolean;
}) {
  const glyph = Math.round(size * 0.56);
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #6d5ff5 0%, #4a3bd1 100%)",
        borderRadius: rounded ? size * 0.22 : 0,
      }}
    >
      {/* lucide "messages-square" */}
      <svg
        width={glyph}
        height={glyph}
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 10a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 14.286V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        <path d="M20 9a2 2 0 0 1 2 2v10.286a.71.71 0 0 1-1.212.502l-2.202-2.202A2 2 0 0 0 17.172 19H10a2 2 0 0 1-2-2v-1" />
      </svg>
    </div>
  );
}
