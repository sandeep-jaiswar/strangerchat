# syntax=docker/dockerfile:1.7
FROM node:24-alpine AS base
WORKDIR /app
RUN npm install -g pnpm@11.25.0

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/chat-server/package.json ./packages/chat-server/
COPY packages/db/package.json ./packages/db/
COPY packages/protocol/package.json ./packages/protocol/
COPY packages/typescript-config/package.json ./packages/typescript-config/
RUN pnpm install --frozen-lockfile --filter @repo/chat-server...

FROM base AS runner
ENV NODE_ENV=production \
    WS_PORT=3001

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 chatserver

COPY --from=deps --chown=chatserver:nodejs /app/package.json /app/pnpm-workspace.yaml ./
COPY --from=deps --chown=chatserver:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=chatserver:nodejs /app/packages/chat-server/node_modules ./packages/chat-server/node_modules
COPY --from=deps --chown=chatserver:nodejs /app/packages/db/node_modules ./packages/db/node_modules
COPY --chown=chatserver:nodejs packages/db ./packages/db
COPY --chown=chatserver:nodejs packages/protocol ./packages/protocol
COPY --chown=chatserver:nodejs packages/typescript-config ./packages/typescript-config
COPY --chown=chatserver:nodejs packages/chat-server ./packages/chat-server

USER chatserver
EXPOSE 3001
CMD ["pnpm", "--filter", "@repo/chat-server", "start"]
