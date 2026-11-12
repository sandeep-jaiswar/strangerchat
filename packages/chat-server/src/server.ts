/**
 * Standalone WebSocket server for self-hosted deployments (e.g. Docker + Caddy on OCI).
 * Serves `/api/ws` alongside Next.js without serverless maxDuration timeouts, and exposes
 * `/healthz` for container health checks.
 */
import http from "node:http";
import { WebSocketServer } from "ws";
import { CHAT_SOCKET_PATH, CloseCode } from "@funstranger/protocol";
import {
  authenticate,
  getHub,
  isAllowedOrigin,
  isValidSessionId,
} from "./index.ts";

const PORT = Number(process.env.WS_PORT ?? process.env.PORT ?? 3001);
const APP_ORIGIN = process.env.NEXTAUTH_URL
  ? new URL(process.env.NEXTAUTH_URL).origin
  : null;

const hub = getHub();
const wss = new WebSocketServer({ noServer: true, maxPayload: 8 * 1024 });

const server = http.createServer((req, res) => {
  if (req.url === "/healthz") {
    res.writeHead(200, { "Content-Type": "text/plain" }).end("ok");
    return;
  }
  res.writeHead(426).end("Expected a WebSocket upgrade");
});

server.on("upgrade", async (req, socket, head) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  const sid = url.searchParams.get("sid");
  const origin = req.headers.origin;
  const rawHost = req.headers["x-forwarded-host"] ?? req.headers.host;
  const host = Array.isArray(rawHost) ? rawHost[0] : rawHost;
  const originOk =
    isAllowedOrigin(origin, host) || (APP_ORIGIN !== null && origin === APP_ORIGIN);

  if (url.pathname !== CHAT_SOCKET_PATH || !originOk || !isValidSessionId(sid)) {
    socket.end("HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n");
    return;
  }

  const userId = await authenticate(req.headers.cookie);
  wss.handleUpgrade(req, socket, head, (ws) => {
    if (!userId) ws.close(CloseCode.Unauthorized, "Unauthorized");
    else void hub.attach(ws, userId, sid);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Chat server listening on 0.0.0.0:${PORT}${CHAT_SOCKET_PATH}`);
});

async function shutdown() {
  server.close();
  await hub.close();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
