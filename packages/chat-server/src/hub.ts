import { randomUUID } from "node:crypto";
import { Chess } from "chess.js";
import { Redis } from "ioredis";
import type { WebSocket } from "ws";
import {
  CloseCode,
  MAX_MESSAGE_LENGTH,
  MAX_TAGS,
  MAX_TAG_LENGTH,
  type ChatPhase,
  type ChessEndReason,
  type ChessResult,
  type ClientEvent,
  type ServerEvent,
} from "@repo/protocol";
import {
  blockUser,
  ensureUser,
  getBlockedRelationIds,
  hasDatabase,
  isUserBanned,
  recordChessGameAndUpdateElo,
  reportUser,
  requestOrAcceptFriend,
} from "@repo/db";
import { captureServerEvent, closeServerAnalytics } from "./analytics.ts";
import { moderateMessageText } from "./moderation.ts";
import { TokenBucket } from "./rate-limit.ts";
import {
  BYE,
  CHESS_INVITE,
  CHESS_INVITE_RESPOND,
  CLAIM,
  DETACH,
  FIND,
  FLAG,
  GAME,
  LEAVE,
  MOVE,
  OFFER,
  PARTNER,
  RELAY,
  RESIGN,
  SYNC,
  TICK,
  TOUCH,
} from "./scripts.ts";

export interface HubOptions {
  redisUrl: string;
  /** Namespace for Redis keys, so tests can run in isolation. */
  prefix?: string;
  /** How often sessions are refreshed, the queue re-matched, dead sessions reaped and sockets pinged. */
  tickMs?: number;
  /**
   * How long a session outlives its last refresh: the grace period a dropped socket has
   * to reconnect (e.g. when Vercel recycles the function) before its chat ends.
   */
  sessionTtlMs?: number;
  /** Two users who just stopped chatting can't be matched again for this long. */
  rematchBlockMs?: number;
  /** After the block, a previous partner is only picked when nobody new is waiting, for this long. */
  rematchWindowMs?: number;
}

interface Connection {
  id: string;
  sid: string;
  userId: string;
  ws: WebSocket;
  bucket: TokenBucket;
  rateLimitNotifiedAt: number;
  lastPongAt: number;
}

type Args = (string | number)[];

interface ChatCommands {
  scClaim(
    ...args: Args
  ): Promise<["forbidden"] | [ChatPhase, number, string, ...string[]]>;
  scDetach(...args: Args): Promise<number>;
  scBye(...args: Args): Promise<number>;
  scFind(...args: Args): Promise<number>;
  scLeave(...args: Args): Promise<number>;
  scRelay(...args: Args): Promise<number>;
  scTouch(...args: Args): Promise<string[]>;
  scTick(...args: Args): Promise<number>;
  scGame(...args: Args): Promise<string[]>;
  scMove(...args: Args): Promise<number>;
  scResign(...args: Args): Promise<number>;
  scOffer(...args: Args): Promise<number>;
  scFlag(...args: Args): Promise<number>;
  scSync(...args: Args): Promise<string>;
  scChessInvite(...args: Args): Promise<number>;
  scChessInviteRespond(...args: Args): Promise<number>;
  scPartner(...args: Args): Promise<[string?, string?]>;
}

/**
 * Serves the sockets connected to this process. Shared state lives in Redis and
 * events reach sockets on other processes through pub/sub, so any number of
 * instances can run side by side. The rules themselves live in ./scripts.ts.
 */
export class Hub {
  private readonly redis: Redis & ChatCommands;
  private readonly subscriber: Redis;
  private readonly prefix: string;
  private readonly tickMs: number;
  private readonly sessionTtlMs: number;
  private readonly rematchBlockMs: number;
  private readonly rematchWindowMs: number;
  private readonly connections = new Map<string, Connection>();
  private timer: NodeJS.Timeout | undefined;
  private online = 0;
  private closed = false;

  constructor(options: HubOptions) {
    this.prefix = options.prefix ?? "sc:";
    this.tickMs = options.tickMs ?? 5_000;
    this.sessionTtlMs = options.sessionTtlMs ?? 20_000;
    this.rematchBlockMs = options.rematchBlockMs ?? 15_000;
    this.rematchWindowMs = options.rematchWindowMs ?? 10 * 60_000;

    this.redis = new Redis(options.redisUrl) as Redis & ChatCommands;
    const scripts = {
      scClaim: CLAIM,
      scDetach: DETACH,
      scBye: BYE,
      scFind: FIND,
      scLeave: LEAVE,
      scRelay: RELAY,
      scTouch: TOUCH,
      scTick: TICK,
      scGame: GAME,
      scMove: MOVE,
      scResign: RESIGN,
      scOffer: OFFER,
      scFlag: FLAG,
      scSync: SYNC,
      scChessInvite: CHESS_INVITE,
      scChessInviteRespond: CHESS_INVITE_RESPOND,
      scPartner: PARTNER,
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
      if (connection) this.sendRaw(connection, message);
    });
  }

  async attach(ws: WebSocket, userId: string, sid: string): Promise<void> {
    if (hasDatabase()) {
      try {
        if (await isUserBanned(userId)) {
          this.sendRaw(
            { ws } as Connection,
            JSON.stringify({
              type: "error",
              code: "banned",
              message:
                "Your account is temporarily suspended due to safety reports.",
            } satisfies ServerEvent),
          );
          ws.close(CloseCode.Unauthorized, "Suspended");
          return;
        }
        await ensureUser(userId);
        const blocked = await getBlockedRelationIds(userId);
        const blockKey = `${this.prefix}blocked:${userId}`;
        await this.redis.del(blockKey);
        if (blocked.length > 0) await this.redis.sadd(blockKey, ...blocked);
      } catch (error: unknown) {
        console.error("chat-server: db sync on attach failed", error);
      }
    }

    const channel = this.channel(sid);
    const previous = this.connections.get(sid);
    // Subscribe before claiming so nothing sent to this session in between is lost.
    if (!previous) await this.subscriber.subscribe(channel);

    const id = randomUUID();
    const now = Date.now();
    const claim = await this.redis.scClaim(
      ...this.common(now),
      sid,
      userId,
      id,
      now + this.sessionTtlMs,
    );

    if (claim[0] === "forbidden") {
      if (!previous) await this.subscriber.unsubscribe(channel);
      ws.close(CloseCode.SessionConflict, "Session belongs to another user");
      return;
    }
    const [phase, online, game, ...held] = claim;
    if (ws.readyState !== ws.OPEN) {
      // The socket closed while we were claiming; undo so the session isn't marked connected.
      if (!previous) await this.subscriber.unsubscribe(channel);
      await this.redis.scDetach(...this.common(now), sid, id, ...held);
      return;
    }
    const connection: Connection = {
      id,
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
      // Keep the session (and its chat) for the grace period so the client can resume it.
      this.redis
        .scDetach(...this.common(Date.now()), sid, id)
        .catch((error: unknown) =>
          console.error("chat-server: detach failed", error),
        );
    });

    this.send(connection, { type: "state", phase });
    this.send(connection, { type: "online", count: online });
    if (game) this.sendRaw(connection, game);
    for (const message of held) this.sendRaw(connection, message);
    this.startTicking();
  }

  /** Stops timers and closes Redis connections. */
  async close(): Promise<void> {
    this.closed = true;
    this.stopTicking();
    for (const connection of this.connections.values())
      connection.ws.terminate();
    this.connections.clear();
    await Promise.all([
      this.redis.quit(),
      this.subscriber.quit(),
      closeServerAnalytics(),
    ]);
  }

  /** Leading arguments every script takes (see ./scripts.ts). */
  private common(now: number): Args {
    return [this.prefix, now, this.rematchBlockMs, this.rematchWindowMs];
  }

  private channel(sid: string) {
    return `${this.prefix}to:${sid}`;
  }

  private send(connection: Connection, event: ServerEvent) {
    this.sendRaw(connection, JSON.stringify(event));
  }

  private sendRaw(connection: Connection, data: string) {
    if (connection.ws.readyState === connection.ws.OPEN)
      connection.ws.send(data);
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
    const { sid } = connection;
    const common = this.common(Date.now());
    switch (event.type) {
      case "find": {
        const tags = normalizeTags(event.tags);
        const matched = await this.redis.scFind(
          ...common,
          sid,
          event.mode ?? "chat",
          ...tags,
        );
        if (matched) {
          captureServerEvent(connection.userId, "chat_matched", {
            mode: event.mode ?? "chat",
            tags_count: tags.length,
          });
        } else {
          this.send(connection, { type: "searching" });
        }
        return;
      }
      case "leave":
        await this.redis.scLeave(...common, sid);
        return;
      case "bye":
        await this.redis.scBye(...common, sid, connection.id);
        connection.ws.close(1000, "Bye");
        return;
      case "typing":
        // Typing is only meaningful live, so it isn't held for a reconnecting partner.
        await this.redis.scRelay(...common, sid, JSON.stringify(event), 0);
        return;
      case "message": {
        const rawText = event.text.trim();
        if (!rawText || rawText.length > MAX_MESSAGE_LENGTH) {
          this.send(connection, {
            type: "error",
            code: "invalid_message",
            message: `Messages must be 1-${MAX_MESSAGE_LENGTH} characters.`,
          });
          return;
        }
        const { text } = moderateMessageText(rawText);
        const message: ServerEvent = {
          type: "message",
          id: randomUUID(),
          text,
          sentAt: Date.now(),
        };
        const inChat = await this.redis.scRelay(
          ...common,
          sid,
          JSON.stringify(message),
          1,
        );
        if (!inChat) {
          this.send(connection, {
            type: "error",
            code: "not_in_chat",
            message: "You're not chatting with anyone right now.",
          });
        }
        return;
      }
      case "chess_invite":
        await this.redis.scChessInvite(...common, sid);
        return;
      case "chess_invite_response":
        await this.redis.scChessInviteRespond(
          ...common,
          sid,
          event.accept ? "1" : "0",
        );
        return;
      case "chess_move":
        await this.move(connection, event);
        void this.flushEndedGames();
        return;
      case "chess_resign":
        await this.redis.scResign(...common, sid);
        void this.flushEndedGames();
        return;
      case "chess_offer":
        await this.redis.scOffer(...common, sid, event.offer);
        void this.flushEndedGames();
        return;
      case "chess_flag":
        await this.redis.scFlag(...common, sid);
        void this.flushEndedGames();
        return;
      case "friend_request":
        await this.handleFriendRequest(connection);
        return;
      case "safety_action":
        await this.handleSafetyAction(connection, event.action, event.reason);
        return;
    }
  }

  /** Checks a move against the game so far, then plays it. */
  private async move(
    connection: Connection,
    event: Extract<ClientEvent, { type: "chess_move" }>,
  ) {
    const { sid } = connection;
    const [gid, color, ply, status, ...moves] = await this.redis.scGame(
      ...this.common(Date.now()),
      sid,
    );
    const turn = Number(ply) % 2 === 0 ? "white" : "black";
    let played:
      { san: string; result: ChessResult | ""; reason: string } | undefined;
    if (gid && status === "playing" && color === turn) {
      const chess = new Chess();
      for (const san of moves) chess.move(san);
      try {
        const { san } = chess.move({
          from: event.from,
          to: event.to,
          promotion: event.promotion,
        });
        played = { san, ...outcome(chess) };
      } catch {
        // Illegal move: fall through and resync the client.
      }
    }
    const ok =
      played &&
      (await this.redis.scMove(
        ...this.common(Date.now()),
        sid,
        gid!,
        Number(ply),
        played.san,
        played.result,
        played.reason,
      ));
    if (ok) return;

    this.send(connection, {
      type: "error",
      code: "invalid_move",
      message: "That move can't be played right now.",
    });
    // Put the client's board back to the server's position.
    const game = await this.redis.scSync(...this.common(Date.now()), sid);
    if (game) this.sendRaw(connection, game);
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
    if (this.closed) return;
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
      const missing = await this.redis.scTouch(
        ...this.common(now),
        now + this.sessionTtlMs,
        ...live,
      );
      // This process stalled long enough for the session to be reaped elsewhere;
      // make the client reconnect so it learns its chat is over.
      for (const sid of missing) {
        this.connections
          .get(sid)
          ?.ws.close(CloseCode.Expired, "Session expired");
      }
    }

    if (this.closed) return;
    const online = await this.redis.scTick(...this.common(now));
    void this.flushEndedGames();
    if (online !== this.online) {
      this.online = online;
      for (const connection of this.connections.values()) {
        this.send(connection, { type: "online", count: online });
      }
    }
  }

  private async handleFriendRequest(connection: Connection) {
    const [partnerSid, partnerUid] = await this.redis.scPartner(
      ...this.common(Date.now()),
      connection.sid,
    );
    if (!partnerSid || !partnerUid) {
      this.send(connection, {
        type: "error",
        code: "not_in_chat",
        message: "You're not chatting with anyone right now.",
      });
      return;
    }
    if (!hasDatabase()) {
      this.send(connection, { type: "friend_status", status: "unavailable" });
      return;
    }
    const result = await requestOrAcceptFriend(connection.userId, partnerUid);
    if (result.status === "pending") {
      this.send(connection, { type: "friend_status", status: "pending_me" });
      await this.redis.publish(
        this.channel(partnerSid),
        JSON.stringify({
          type: "friend_status",
          status: "pending_them",
        } satisfies ServerEvent),
      );
      return;
    }
    if (result.status === "accepted") {
      const [me, them] = await Promise.all([
        ensureUser(connection.userId),
        ensureUser(partnerUid),
      ]);
      this.send(connection, {
        type: "friend_status",
        status: "accepted",
        partner: them
          ? {
              id: them.id,
              handle: them.handle,
              avatarSeed: them.avatarSeed,
              chessRating: them.chessRating,
            }
          : undefined,
      });
      await this.redis.publish(
        this.channel(partnerSid),
        JSON.stringify({
          type: "friend_status",
          status: "accepted",
          partner: me
            ? {
                id: me.id,
                handle: me.handle,
                avatarSeed: me.avatarSeed,
                chessRating: me.chessRating,
              }
            : undefined,
        } satisfies ServerEvent),
      );
      captureServerEvent(connection.userId, "friendship_accepted");
      captureServerEvent(partnerUid, "friendship_accepted");
      return;
    }
    this.send(connection, { type: "friend_status", status: "unavailable" });
  }

  private async handleSafetyAction(
    connection: Connection,
    action: "block" | "report",
    reason?: string,
  ) {
    const now = Date.now();
    const [partnerSid, partnerUid] = await this.redis.scPartner(
      ...this.common(now),
      connection.sid,
    );
    if (!partnerSid || !partnerUid) return;

    if (hasDatabase()) {
      await blockUser(connection.userId, partnerUid);
      if (action === "report") {
        await reportUser(
          connection.userId,
          partnerUid,
          reason ?? "inappropriate",
        );
      }
    }
    await this.redis.sadd(`${this.prefix}blocked:${connection.userId}`, partnerUid);
    await this.redis.scLeave(...this.common(now), connection.sid);
    captureServerEvent(
      connection.userId,
      action === "report" ? "user_reported" : "user_blocked",
      { reason: reason ?? null },
    );

    this.send(connection, {
      type: "safety_ack",
      action,
      message:
        action === "report"
          ? "Report submitted and user blocked."
          : "User blocked. You won't be matched again.",
    });
  }

  private async flushEndedGames() {
    if (!hasDatabase()) return;
    const key = `${this.prefix}ended_games`;
    for (let i = 0; i < 10; i++) {
      const raw = await this.redis.lpop(key);
      if (!raw) break;
      try {
        const game = JSON.parse(raw) as {
          whiteId: string;
          blackId: string;
          result: ChessResult;
          reason: string;
          moves: string[];
        };
        await recordChessGameAndUpdateElo(game);
        captureServerEvent(game.whiteId, "chess_game_ended", {
          result: game.result,
          reason: game.reason,
          moves_count: game.moves.length,
          color: "white",
        });
        captureServerEvent(game.blackId, "chess_game_ended", {
          result: game.result,
          reason: game.reason,
          moves_count: game.moves.length,
          color: "black",
        });
      } catch (error: unknown) {
        console.error("chat-server: failed to record chess game", error);
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
    case "leave":
    case "bye":
      return { type: event.type };
    case "typing":
      return { type: "typing", isTyping: event.isTyping === true };
    case "message":
      return typeof event.text === "string"
        ? { type: "message", text: event.text }
        : undefined;
    case "find": {
      const tags = Array.isArray(event.tags)
        ? event.tags.filter((t): t is string => typeof t === "string")
        : undefined;
      return event.mode === "chess"
        ? { type: "find", mode: "chess", tags }
        : { type: "find", tags };
    }
    case "chess_invite":
      return { type: "chess_invite" };
    case "chess_invite_response":
      return typeof event.accept === "boolean"
        ? { type: "chess_invite_response", accept: event.accept }
        : undefined;
    case "chess_move":
      return typeof event.from === "string" &&
        typeof event.to === "string" &&
        (event.promotion === undefined || typeof event.promotion === "string")
        ? {
            type: "chess_move",
            from: event.from,
            to: event.to,
            promotion: event.promotion,
          }
        : undefined;
    case "chess_resign":
    case "chess_flag":
      return { type: event.type };
    case "chess_offer":
      return event.offer === "draw" || event.offer === "rematch"
        ? { type: "chess_offer", offer: event.offer }
        : undefined;
    case "friend_request":
      return { type: "friend_request" };
    case "safety_action":
      return event.action === "block" || event.action === "report"
        ? {
            type: "safety_action",
            action: event.action,
            reason: typeof event.reason === "string" ? event.reason : undefined,
          }
        : undefined;
    default:
      return undefined;
  }
}

function normalizeTags(raw?: string[]): string[] {
  if (!raw || raw.length === 0) return [];
  const unique = new Set<string>();
  for (const tag of raw) {
    const clean = tag
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, MAX_TAG_LENGTH);
    if (clean) unique.add(clean);
    if (unique.size >= MAX_TAGS) break;
  }
  return [...unique];
}

/** How a game ends after the last move, if it does. */
function outcome(chess: Chess): {
  result: ChessResult | "";
  reason: ChessEndReason | "";
} {
  if (chess.isCheckmate())
    return {
      result: chess.turn() === "w" ? "0-1" : "1-0",
      reason: "checkmate",
    };
  const draw = (reason: ChessEndReason) => ({
    result: "1/2-1/2" as const,
    reason,
  });
  if (chess.isStalemate()) return draw("stalemate");
  if (chess.isInsufficientMaterial()) return draw("insufficient_material");
  if (chess.isThreefoldRepetition()) return draw("threefold_repetition");
  if (chess.isDrawByFiftyMoves()) return draw("fifty_moves");
  return { result: "", reason: "" };
}
