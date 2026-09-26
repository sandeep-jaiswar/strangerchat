# Build from the repo root so the pnpm workspace is available:
#   fly deploy --config apps/realtime/fly.toml --ha=false
FROM node:26-slim AS build
RUN npm install -g pnpm@11.25.0
WORKDIR /repo
COPY . .
# Install only the realtime server and the workspace packages it depends on.
RUN pnpm install --frozen-lockfile --prod --filter realtime...

FROM node:26-slim
ENV NODE_ENV=production
WORKDIR /repo
# pnpm links packages with relative symlinks, so keep the same layout.
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/packages/protocol ./packages/protocol
COPY --from=build /repo/apps/realtime ./apps/realtime
WORKDIR /repo/apps/realtime
USER node
EXPOSE 8080
CMD ["node", "src/index.ts"]
