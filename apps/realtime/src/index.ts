import { randomUUID } from "node:crypto";
import http from "node:http";
import { jwtVerify } from "jose";
import { WebSocketServer, type WebSocket } from "ws";
import {
  MAX_MESSAGE_LENGTH,
  REALTIME_TOKEN_AUDIENCE,
  type ClientEvent,
  type ServerEvent,
} from "@repo/protocol";
import { Matchmaker, type Peer } from "./matchmaker.ts";
import { TokenBucket } from "./rate-limit.ts";

const PORT = Number(process.env.PORT ?? 4000);
const SECRET = process.env.REALTIME_JWT_SECRET ?? "";
const ALLOWED_ORIGINS = new Set(
  (process.env.ALLOWED_ORIGINS ?? "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);
const MAX_CONNECTIONS_PER_USER = 3;
const HEARTBEAT_MS = 30_000;
const ONLINE_BROADCAST_MS = 2_000;

if (SECRET.length < 32) {
  console.error("REALTIME_JWT_SECRET must be set to at least 32 characters.");
  process.exit(1);
}
const secretKey = new TextEncoder().encode(SECRET);

interface Connection extends Peer {
  socket: WebSocket;
  bucket: TokenBucket;
  rateLimitNotifiedAt: number;
  alive: boolean;
}

const matchmaker = new Matchmaker();
const connections = new Set<Connection>();

function countUserConnections(userId: string): number {
  let count = 0;
  for (const connection of connections) {
    if (connection.userId === userId) count++;
  }
  return count;
}

let onlineBroadcastTimer: NodeJS.Timeout | undefined;
function scheduleOnlineBroadcast() {
  onlineBroadcastTimer ??= setTimeout(() => {
    onlineBroadcastTimer = undefined;
    const event: ServerEvent = { type: "online", count: connections.size };
    for (const connection of connections) connection.send(event);
  }, ONLINE_BROADCAST_MS);
}

function parseEvent(raw: string): ClientEvent | undefined {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return undefined;
  }
  if (typeof data !== "object" || data === null) return undefined;
  const event = data as Record<string, unknown>;
  switch (event.type) {
    case "find":
    case "leave":
      return { type: event.type };
    case "typing":
      return { type: "typing", isTyping: event.isTyping === true };
    case "message":
      return typeof event.text === "string"
        ? { type: "message", text: event.text }
        : undefined;
    default:
      return undefined;
  }
}

function handleEvent(connection: Connection, event: ClientEvent) {
  switch (event.type) {
    case "find":
      matchmaker.find(connection);
      return;
    case "leave":
      matchmaker.leave(connection);
      return;
    case "typing":
      matchmaker.relay(connection, event);
      return;
    case "message": {
      const text = event.text.trim();
      if (!text || text.length > MAX_MESSAGE_LENGTH) {
        connection.send({
          type: "error",
          code: "invalid_message",
          message: `Messages must be 1-${MAX_MESSAGE_LENGTH} characters.`,
        });
        return;
      }
      const delivered = matchmaker.relay(connection, {
        type: "message",
        id: randomUUID(),
        text,
        sentAt: Date.now(),
      });
      if (!delivered) {
        connection.send({
          type: "error",
          code: "not_in_chat",
          message: "You're not chatting with anyone right now.",
        });
      }
      return;
    }
  }
}

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true, online: connections.size }));
    return;
  }
  res.writeHead(404).end();
});

const wss = new WebSocketServer({ noServer: true, maxPayload: 8 * 1024 });

function reject(socket: import("node:stream").Duplex, status: string) {
  socket.end(`HTTP/1.1 ${status}\r\nConnection: close\r\n\r\n`);
}

server.on("upgrade", async (req, socket, head) => {
  const origin = req.headers.origin;
  if (!origin || !ALLOWED_ORIGINS.has(origin)) {
    reject(socket, "403 Forbidden");
    return;
  }

  const token = new URL(req.url ?? "/", "http://localhost").searchParams.get(
    "token",
  );
  let userId: string;
  try {
    const { payload } = await jwtVerify(token ?? "", secretKey, {
      audience: REALTIME_TOKEN_AUDIENCE,
      algorithms: ["HS256"],
    });
    if (!payload.sub) throw new Error("Token has no subject");
    userId = payload.sub;
  } catch {
    reject(socket, "401 Unauthorized");
    return;
  }

  if (countUserConnections(userId) >= MAX_CONNECTIONS_PER_USER) {
    reject(socket, "429 Too Many Requests");
    return;
  }

  wss.handleUpgrade(req, socket, head, (ws) => {
    const connection: Connection = {
      id: randomUUID(),
      userId,
      socket: ws,
      bucket: new TokenBucket(20, 5),
      rateLimitNotifiedAt: 0,
      alive: true,
      send(event) {
        if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(event));
      },
    };
    connections.add(connection);
    connection.send({ type: "online", count: connections.size });
    scheduleOnlineBroadcast();

    ws.on("pong", () => {
      connection.alive = true;
    });

    ws.on("message", (data, isBinary) => {
      if (isBinary) return;
      if (!connection.bucket.take()) {
        // Tell the client once, not once per dropped frame.
        const now = Date.now();
        if (now - connection.rateLimitNotifiedAt < 5_000) return;
        connection.rateLimitNotifiedAt = now;
        connection.send({
          type: "error",
          code: "rate_limited",
          message: "Slow down a little.",
        });
        return;
      }
      const event = parseEvent(data.toString());
      if (event) handleEvent(connection, event);
    });

    ws.on("close", () => {
      connections.delete(connection);
      matchmaker.disconnect(connection);
      scheduleOnlineBroadcast();
    });
  });
});

// Drop connections that stopped answering pings (e.g. a phone that lost signal).
const heartbeat = setInterval(() => {
  for (const connection of connections) {
    if (!connection.alive) {
      connection.socket.terminate();
      continue;
    }
    connection.alive = false;
    connection.socket.ping();
  }
}, HEARTBEAT_MS);

server.listen(PORT, () => {
  console.log(`Realtime server listening on :${PORT}`);
});

function shutdown() {
  clearInterval(heartbeat);
  for (const connection of connections) connection.socket.close(1001);
  server.close(() => process.exit(0));
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
