/**
 * Local stand-in for the /api/ws route. Vercel's WebSocket upgrade only exists on its
 * runtime, so in development the browser connects here instead (NEXT_PUBLIC_WS_URL).
 * Cookies ignore ports, so the NextAuth session cookie from :3000 arrives here too.
 */
import http from "node:http";
import { WebSocketServer } from "ws";
import { CHAT_SOCKET_PATH, CloseCode } from "@repo/protocol";
import { authenticate, getHub, isValidSessionId } from "./index.ts";

const PORT = Number(process.env.WS_DEV_PORT ?? 3001);
const APP_ORIGIN = new URL(process.env.NEXTAUTH_URL ?? "http://localhost:3000")
  .origin;

const hub = getHub();
const wss = new WebSocketServer({ noServer: true, maxPayload: 8 * 1024 });

const server = http.createServer((_req, res) => {
  res.writeHead(426).end("Expected a WebSocket upgrade");
});

server.on("upgrade", async (req, socket, head) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  const sid = url.searchParams.get("sid");
  if (
    url.pathname !== CHAT_SOCKET_PATH ||
    req.headers.origin !== APP_ORIGIN ||
    !isValidSessionId(sid)
  ) {
    socket.end("HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n");
    return;
  }
  const userId = await authenticate(req.headers.cookie);
  wss.handleUpgrade(req, socket, head, (ws) => {
    if (!userId) ws.close(CloseCode.Unauthorized, "Unauthorized");
    else void hub.attach(ws, userId, sid);
  });
});

server.listen(PORT, () => {
  console.log(
    `Chat dev server: ws://localhost:${PORT}${CHAT_SOCKET_PATH} (for ${APP_ORIGIN})`,
  );
});

async function shutdown() {
  server.close();
  await hub.close();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
