# StrangerChat

Sign in with Google and chat one-on-one with a random stranger. Works on phones and desktops.

## Structure

| Path | What |
| --- | --- |
| `apps/web` | Next.js app: landing page, Google sign-in (NextAuth), chat UI, AdSense, and the chat socket at `/api/ws` |
| `packages/chat-server` | Matchmaking and message relay over WebSockets, with shared state in Redis |
| `packages/ui` | shadcn/ui components and the shared Tailwind v4 theme |
| `packages/protocol` | Message types shared by the client and the server |

The chat socket runs as a Vercel Function (`apps/web/app/api/ws/route.ts`) and authenticates with the NextAuth session cookie. Function instances share the queue, pairs and presence through Redis, and deliver events to each other with Redis pub/sub. Messages are relayed and never stored.

Vercel closes each socket when the function reaches its max duration (5 minutes on Hobby). Each browser tab has a session id, so it reconnects and resumes the same chat; a partner is only told "left" if the session doesn't come back within ~20 seconds, or immediately when the tab is closed.

## Setup

```sh
pnpm install
cp apps/web/.env.example apps/web/.env.local
docker run -d --name strangerchat-redis -p 6379:6379 redis:7-alpine
```

1. Create an OAuth client at <https://console.cloud.google.com/apis/credentials> (type "Web application") with the redirect URI `http://localhost:3000/api/auth/callback/google`, and put its id and secret in `apps/web/.env.local`.
2. Generate `NEXTAUTH_SECRET` with `openssl rand -base64 32`.
3. `pnpm dev` starts the web app on :3000 and the chat dev server on :3001. Vercel's WebSocket upgrade only exists on Vercel, so locally the browser connects to the dev server instead (`NEXT_PUBLIC_WS_URL`); it runs the same code from `packages/chat-server`.

Run the chat server tests (they need the local Redis) with `pnpm --filter @repo/chat-server test`.

## Adding shadcn components

```sh
cd apps/web && pnpm dlx shadcn@latest add <component>
```

Components land in `packages/ui/src/components` and are imported as `@repo/ui/components/<name>`. The CLI sometimes rewrites the `cn` import to `from "cn"`; change it back to `@repo/ui/lib/utils`.

## AdSense

Set `NEXT_PUBLIC_ADSENSE_CLIENT` (`ca-pub-…`) and create two ad units in AdSense for `NEXT_PUBLIC_ADSENSE_SLOT_BANNER` (responsive) and `NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR` (vertical). `/ads.txt` is generated from the client id. Without these variables no ad code loads; in development dashed placeholders mark where ads go.

Ads appear on the landing page, the lobby (on mobile), and the chat sidebar (on desktop). They are kept away from the message composer on purpose — AdSense penalises placements that invite accidental clicks.

## Deploying to Vercel

1. Import the repo into Vercel with **Root Directory** `apps/web`. Fluid compute must be on (the default for new projects); WebSockets are in beta on Vercel.
2. Add Redis from the Vercel Marketplace (project → Storage), e.g. Upstash, and connect it to the project. It sets `REDIS_URL` (or `KV_URL`, which also works). Pick the region your functions run in.
3. Set `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` and the AdSense variables. Do **not** set `NEXT_PUBLIC_WS_URL` in production — the socket is served from the same domain.
4. Add `https://<your-domain>/api/auth/callback/google` as a redirect URI on the Google OAuth client, then deploy.

On a Pro plan you can raise `maxDuration` in `app/api/ws/route.ts` to 800 seconds, so sockets are recycled less often.
