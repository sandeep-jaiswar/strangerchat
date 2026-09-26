import { randomUUID } from "node:crypto";
import { Redis } from "ioredis";
import type { WebSocket } from "ws";
import {
  CloseCode,
  MAX_MESSAGE_LENGTH,
  type ChatPhase,
  type ClientEvent,
  type ServerEvent,
} from "@repo/protocol";
import { TokenBucket } from "./rate-limit.ts";
import { CLAIM, FIND, LEAVE, REAP, RELAY, TOUCH } from "./scripts.ts";

export interface HubOptions {
  redisUrl: string;
  /** Namespace for Redis keys, so tests can run in isolation. */
  prefix?: string;
  /** How often sessions are refreshed, dead ones reaped and sockets pinged. */
  tickMs?: number;
  /**
   * How long a session outlives its last refresh. This is the grace period a dropped
   * socket has to reconnect (e.g. when Vercel recycles the function) before the chat ends.
   */
  sessionTtlMs?: number;
}

interface Connection {
  sid: string;
  userId: string;
  ws: WebSocket;
  bucket: TokenBucket;
  rateLimitNotifiedAt: number;
  lastPongAt: number;
}

interface ChatCommands {
  scClaim(
    ...args: (string | number)[]
  ): Promise<[ChatPhase | "forbidden", number]>;
  scFind(...args: (string | number)[]): Promise<number>;
  scLeave(...args: (string | number)[]): Promise<number>;
  scRelay(...args: (string | number)[]): Promise<number>;
  scTouch(...args: (string | number)[]): Promise<string[]>;
  scReap(...args: (string | number)[]): Promise<number>;
}

/**
 * Serves the sockets connected to this process. Shared state lives in Redis and
 * events reach sockets on other processes through pub/sub, so any number of
 * instances can run side by side.
 */
export class Hub {
  private readonly redis: Redis & ChatCommands;
  private readonly subscriber: Redis;
  private readonly prefix: string;
  private readonly tickMs: number;
  private readonly sessionTtlMs: number;
  private readonly connections = new Map<string, Connection>();
  private timer: NodeJS.Timeout | undefined;
  private online = 0;

  constructor(options: HubOptions) {
    this.prefix = options.prefix ?? "sc:";
    this.tickMs = options.tickMs ?? 5_000;
    this.sessionTtlMs = options.sessionTtlMs ?? 20_000;

    this.redis = new Redis(options.redisUrl) as Redis & ChatCommands;
    const scripts = {
      scClaim: CLAIM,
      scFind: FIND,
      scLeave: LEAVE,
      scRelay: RELAY,
      scTouch: TOUCH,
      scReap: REAP,
    };
    for (const [name, lua] of Object.entries(scripts)) {
      this.redis.defineCommand(name, { numberOfKeys: 0, lua });
    }

    this.subscriber = new Redis(options.redisUrl);
    const channelPrefix = `${this.prefix}to:`;
    this.subscriber.on("message", (channel: string, message: string) => {
      const connection = this.connections.get(
        channel.slice(channelPrefix.length),
      );
      if (connection && connection.ws.readyState === connection.ws.OPEN) {
        connection.ws.send(message);
      }
    });
  }

  async attach(ws: WebSocket, userId: string, sid: string): Promise<void> {
    const channel = this.channel(sid);
    const previous = this.connections.get(sid);
    // Subscribe before claiming so nothing sent to this session in between is lost.
    if (!previous) await this.subscriber.subscribe(channel);

    const now = Date.now();
    const [phase, online] = await this.redis.scClaim(
      this.prefix,
      sid,
      userId,
      now + this.sessionTtlMs,
      now,
    );
    if (phase === "forbidden" || ws.readyState !== ws.OPEN) {
      if (!previous) await this.subscriber.unsubscribe(channel);
      if (phase === "forbidden") {
        ws.close(CloseCode.SessionConflict, "Session belongs to another user");
      }
      return;
    }

    const connection: Connection = {
      sid,
      userId,
      ws,
      bucket: new TokenBucket(20, 5),
      rateLimitNotifiedAt: 0,
      lastPongAt: now,
    };
    this.connections.set(sid, connection);
    previous?.ws.close(CloseCode.Replaced, "Replaced by a newer connection");

    ws.on("pong", () => {
      connection.lastPongAt = Date.now();
    });
    ws.on("message", (data, isBinary) => {
      if (!isBinary) void this.receive(connection, data.toString());
    });
    ws.on("close", () => {
      if (this.connections.get(sid) !== connection) return;
      this.connections.delete(sid);
      void this.subscriber.unsubscribe(channel);
      if (this.connections.size === 0) this.stopTicking();
      // The session stays in Redis until its TTL lapses, giving the client time to reconnect.
    });

    this.send(connection, { type: "state", phase });
    this.send(connection, { type: "online", count: online });
    this.startTicking();
  }

  /** Stops timers and closes Redis connections. */
  async close(): Promise<void> {
    this.stopTicking();
    for (const connection of this.connections.values())
      connection.ws.terminate();
    this.connections.clear();
    await Promise.all([this.redis.quit(), this.subscriber.quit()]);
  }

  private channel(sid: string) {
    return `${this.prefix}to:${sid}`;
  }

  private send(connection: Connection, event: ServerEvent) {
    if (connection.ws.readyState === connection.ws.OPEN) {
      connection.ws.send(JSON.stringify(event));
    }
  }

  private async receive(connection: Connection, raw: string) {
    if (!connection.bucket.take()) {
      // Tell the client once, not once per dropped frame.
      const now = Date.now();
      if (now - connection.rateLimitNotifiedAt < 5_000) return;
      connection.rateLimitNotifiedAt = now;
      this.send(connection, {
        type: "error",
        code: "rate_limited",
        message: "Slow down a little.",
      });
      return;
    }
    const event = parseEvent(raw);
    if (!event) return;

    try {
      await this.handle(connection, event);
    } catch (error) {
      console.error("chat-server: failed to handle event", event.type, error);
    }
  }

  private async handle(connection: Connection, event: ClientEvent) {
    const { sid, userId } = connection;
    switch (event.type) {
      case "find": {
        const matched = await this.redis.scFind(
          this.prefix,
          sid,
          userId,
          Date.now(),
        );
        if (!matched) this.send(connection, { type: "searching" });
        return;
      }
      case "leave":
        await this.redis.scLeave(this.prefix, sid);
        return;
      case "typing":
        await this.redis.scRelay(this.prefix, sid, JSON.stringify(event));
        return;
      case "message": {
        const text = event.text.trim();
        if (!text || text.length > MAX_MESSAGE_LENGTH) {
          this.send(connection, {
            type: "error",
            code: "invalid_message",
            message: `Messages must be 1-${MAX_MESSAGE_LENGTH} characters.`,
          });
          return;
        }
        const message: ServerEvent = {
          type: "message",
          id: randomUUID(),
          text,
          sentAt: Date.now(),
        };
        const delivered = await this.redis.scRelay(
          this.prefix,
          sid,
          JSON.stringify(message),
        );
        if (!delivered) {
          this.send(connection, {
            type: "error",
            code: "not_in_chat",
            message: "You're not chatting with anyone right now.",
          });
        }
        return;
      }
    }
  }

  private startTicking() {
    this.timer ??= setInterval(() => {
      this.tick().catch((error: unknown) =>
        console.error("chat-server: tick failed", error),
      );
    }, this.tickMs);
  }

  private stopTicking() {
    clearInterval(this.timer);
    this.timer = undefined;
  }

  private async tick() {
    const now = Date.now();
    const live: string[] = [];
    for (const connection of this.connections.values()) {
      // Drop sockets that stopped answering pings, e.g. a phone that lost signal.
      if (
        connection.ws.readyState !== connection.ws.OPEN ||
        now - connection.lastPongAt > this.tickMs * 3
      ) {
        connection.ws.terminate();
        continue;
      }
      connection.ws.ping();
      live.push(connection.sid);
    }

    if (live.length > 0) {
      const reaped = await this.redis.scTouch(
        this.prefix,
        now + this.sessionTtlMs,
        ...live,
      );
      // This process stalled long enough for the session to be reaped elsewhere;
      // make the client reconnect so it learns its chat is over.
      for (const sid of reaped) {
        this.connections
          .get(sid)
          ?.ws.close(CloseCode.Expired, "Session expired");
      }
    }

    const online = await this.redis.scReap(this.prefix, now);
    if (online !== this.online) {
      this.online = online;
      for (const connection of this.connections.values()) {
        this.send(connection, { type: "online", count: online });
      }
    }
  }
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
