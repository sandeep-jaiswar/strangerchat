import process from "node:process";

const posthogHost = (
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com"
).replace(/\/$/, "");
const posthogAssetsHost = posthogHost.includes("eu.")
  ? "https://eu-assets.i.posthog.com"
  : "https://us-assets.i.posthog.com";

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  skipTrailingSlashRedirect: true,
  transpilePackages: [
    "@repo/ui",
    "@repo/protocol",
    "@repo/chat-server",
    "@repo/db",
  ],
  // Bundling breaks ws/pg native/optional helpers; load these from node_modules.
  serverExternalPackages: ["ws", "ioredis", "pg"],
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: `${posthogAssetsHost}/static/:path*`,
      },
      {
        source: "/ingest/:path*",
        destination: `${posthogHost}/:path*`,
      },
    ];
  },
};

export default nextConfig;
