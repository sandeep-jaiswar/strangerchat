/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui", "@repo/protocol", "@repo/chat-server"],
  // Bundling breaks ws's optional native helpers; load these from node_modules.
  serverExternalPackages: ["ws", "ioredis"],
};

export default nextConfig;
