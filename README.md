# Funstranger (`https://funstranger.in`)

Sign in with Google and chat one-on-one with a random stranger, match by interest tags, play live 10+0 chess while talking, solve tactical puzzles, and stay connected with mutual friends using anonymous handles. Works on desktop and mobile.

## Structure

| Path | What |
| --- | --- |
| `apps/web` | Next.js App Router site: landing/SEO pages, chess puzzle trainer, Google sign-in (NextAuth), chat/chess UI, friends drawer, AdSense, and PostHog proxy (`/ingest`) |
| `packages/chat-server` | Long-lived Node WebSocket server (`/api/ws`): Redis matchmaking, profanity moderation (`obscenity`), chess referee, Elo updates, and `posthog-node` events |
| `packages/db` | PostgreSQL schema and queries via `drizzle-orm` (`users`, `friendships`, `direct_messages`, `user_blocks`, `user_reports`, `chess_games`) |
| `packages/ui` | shadcn/ui components and the shared Tailwind v4 theme |
| `packages/protocol` | Shared WebSocket protocol types and limits |
| `infra/oci` | OpenTofu / Terraform Oracle Cloud Infrastructure (Always Free ARM64 VM + VCN) config |
| `infra/docker` | Caddy reverse proxy config with automatic Let's Encrypt HTTPS and security headers |

### Chat & Chess rules

The matchmaking, relay, and chess state transitions live in `packages/chat-server/src/scripts.ts` as atomic Redis Lua scripts:

- **Online:** distinct Google accounts with at least one connected tab.
- **Sessions & Reconnect:** each tab has a session ID; dropped sockets are preserved briefly so users can resume chats/games cleanly after network blips.
- **Interest Tags:** optional up to 3 tags with a 5-second shared-interest preference window before falling back to open matching.
- **Chess Club & Mid-chat Chess:** 10+0 rapid games validated server-side with `chess.js` (`react-chessboard` MIT client board), server-enforced clocks, draws/rematches, and persistent Elo ratings in PostgreSQL.
- **Friends & Safety:** mutual friend requests reveal customizable anonymous handles and unlock persistent DMs; blocking prevents future rematching across both Redis and PostgreSQL.

## Local Setup

```sh
pnpm install
cp apps/web/.env.example apps/web/.env.local
pnpm dev:deps
```

1. Create a Google OAuth client (`Web application`) with authorized redirect URI `http://localhost:3000/api/auth/callback/google` and set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET` (`openssl rand -base64 32`), `DATABASE_URL`, and `REDIS_URL` in `apps/web/.env.local`.
2. Start local Postgres 17 & Redis 7 with `pnpm dev:deps` (`docker-compose.dev.yml`).
3. Run `pnpm dev` (Next.js on `:3000` and WebSocket dev server on `:3001` via `NEXT_PUBLIC_WS_URL=ws://localhost:3001/api/ws`).
4. Run unit tests (`pnpm --filter @funstranger/chat-server test`) or two-browser Playwright E2E tests (`pnpm test:e2e`).

## Production Deployment (Oracle Cloud + GitHub Actions CI/CD)

Production runs at **`https://funstranger.in`** via `docker-compose.yml` (Caddy + Next.js `web` + `chat-server` + PostgreSQL 17 + Redis 7) on Oracle Cloud Always Free ARM64 (`infra/oci/`). Legacy `strangerchat.vercel.app` redirects permanently (`308`) to `https://funstranger.in` via `apps/web/vercel.json`.

- **Pull Requests (`.github/workflows/ci.yml`):** runs `pnpm check-types`, `pnpm lint`, `pnpm build`, `@funstranger/chat-server` Redis tests, and Docker build checks.
- **Merges to `main` (`.github/workflows/deploy.yml`):** verifies checks & tests, syncs the repo to the Oracle VM (preserving server `.env` and Terraform state), rebuilds & restarts containers, checks `/healthz` and live HTTPS routes, and submits `sitemap.xml` URLs to IndexNow (`scripts/submit-indexnow.mjs`).
