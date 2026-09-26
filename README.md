# StrangerChat

Sign in with Google and chat one-on-one with a random stranger. Works on phones and desktops.

## Structure

| Path | What |
| --- | --- |
| `apps/web` | Next.js app: landing page, Google sign-in (NextAuth), chat UI, AdSense |
| `apps/realtime` | WebSocket server: matchmaking queue and message relay (Node, `ws`) |
| `packages/ui` | shadcn/ui components and the shared Tailwind v4 theme |
| `packages/protocol` | Message types shared by the client and the server |

The web app mints a 2-minute JWT at `/api/realtime-token` for the signed-in user; the browser presents it when opening the socket, and the realtime server verifies it with the shared `REALTIME_JWT_SECRET`. Messages are relayed and never stored.

## Setup

```sh
pnpm install
cp apps/web/.env.example apps/web/.env.local
cp apps/realtime/.env.example apps/realtime/.env
```

1. Create an OAuth client at <https://console.cloud.google.com/apis/credentials> (type "Web application") with the redirect URI `http://localhost:3000/api/auth/callback/google`, and put its id and secret in `apps/web/.env.local`.
2. Generate `NEXTAUTH_SECRET` and `REALTIME_JWT_SECRET` with `openssl rand -base64 32`. Use the **same** `REALTIME_JWT_SECRET` in both env files.
3. `pnpm dev` starts the web app on :3000 and the realtime server on :4000.

## Adding shadcn components

```sh
cd apps/web && pnpm dlx shadcn@latest add <component>
```

Components land in `packages/ui/src/components` and are imported as `@repo/ui/components/<name>`. The CLI sometimes rewrites the `cn` import to `from "cn"`; change it back to `@repo/ui/lib/utils`.

## AdSense

Set `NEXT_PUBLIC_ADSENSE_CLIENT` (`ca-pub-…`) and create two ad units in AdSense for `NEXT_PUBLIC_ADSENSE_SLOT_BANNER` (responsive) and `NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR` (vertical). `/ads.txt` is generated from the client id. Without these variables no ad code loads; in development dashed placeholders mark where ads go.

Ads appear on the landing page, the lobby (on mobile), and the chat sidebar (on desktop). They are kept away from the message composer on purpose — AdSense penalises placements that invite accidental clicks.

## Deploying

- **Web**: any Next.js host (e.g. Vercel). Update `NEXTAUTH_URL` and add the production redirect URI to the Google OAuth client.
- **Realtime**: needs a host that keeps long-lived WebSocket connections open (Fly.io, Railway, Render, a VPS) — not a serverless function. Run `pnpm --filter realtime start`, set `ALLOWED_ORIGINS` to the web app's URL, and point `NEXT_PUBLIC_REALTIME_URL` at it with `wss://`.
- The matchmaking queue lives in memory, so run a single realtime instance. Scaling past one needs a shared queue (e.g. Redis pub/sub).
