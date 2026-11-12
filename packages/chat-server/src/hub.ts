import { randomBytes, randomUUID } from "node:crypto";
import { Chess } from "chess.js";
import { Redis } from "ioredis";
import type { WebSocket } from "ws";
import {
  CHESS_PUZZLES,
  CloseCode,
  MAX_MESSAGE_LENGTH,
  MAX_TAGS,
  MAX_TAG_LENGTH,
  PUZZLE_DUEL_COUNT,
  PUZZLE_DUEL_DURATION_MS,
  getTimeControl,
  isTimeControlId,
  normalizeInviteCode,
  type ChatPhase,
  type ChessEndReason,
  type ChessResult,
  type ClientEvent,
  type PuzzleDuelPlayerState,
  type ServerEvent,
  type TimeControlId,
} from "@funstranger/protocol";
import {
  areFriends,
  blockUser,
  ensureUser,
  getBlockedRelationIds,
  hasDatabase,
  isBlockedBetween,
  isUserBanned,
  recordChessGameAndUpdateElo,
  reportUser,
  requestOrAcceptFriend,
} from "@funstranger/db";
import { captureServerEvent, closeServerAnalytics } from "./analytics.ts";
import { moderateMessageText } from "./moderation.ts";
import { TokenBucket } from "./rate-limit.ts";
import {
  BYE,
  CHESS_INVITE,
  CHESS_INVITE_RESPOND,
  CLAIM,
  CREATE_INVITE,
  DETACH,
  FIND,
  FLAG,
  GAME,
  JOIN_INVITE,
  LEAVE,
  MOVE,
  OFFER,
  PAIR_DIRECT,
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
  scCreateInvite(...args: Args): Promise<number>;
  scJoinInvite(
    ...args: Args
  ): Promise<"ok" | "not_found" | "self" | "blocked">;
  scPairDirect(...args: Args): Promise<"ok" | "unavailable">;
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
  private readonly duelTimers = new Map<string, NodeJS.Timeout>();
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
      scCreateInvite: CREATE_INVITE,
      scJoinInvite: JOIN_INVITE,
      scPairDirect: PAIR_DIRECT,
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
    for (const timer of this.duelTimers.values()) clearTimeout(timer);
    this.duelTimers.clear();
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
        const mode = event.mode ?? "chat";
        const tc = getTimeControl(event.timeControl);
        const modeKey = mode === "chess" ? `chess:${tc.id}` : "chat";
        const tags = normalizeTags(event.tags);
        const matched = await this.redis.scFind(
          ...common,
          sid,
          modeKey,
          ...tags,
        );
        if (matched) {
          captureServerEvent(connection.userId, "chat_matched", {
            mode,
            time_control: mode === "chess" ? tc.id : null,
            tags_count: tags.length,
          });
        } else {
          this.send(connection, { type: "searching" });
        }
        return;
      }
      case "create_invite": {
        const mode = event.mode ?? "chat";
        const tc = getTimeControl(event.timeControl);
        const modeKey = mode === "chess" ? `chess:${tc.id}` : "chat";
        const code = randomBytes(6).toString("base64url");
        await this.redis.scCreateInvite(...common, sid, code, modeKey);
        this.send(connection, {
          type: "invite_created",
          code,
          mode,
          timeControl: mode === "chess" ? tc.id : undefined,
        });
        captureServerEvent(connection.userId, "invite_link_created", {
          mode,
          time_control: mode === "chess" ? tc.id : null,
        });
        return;
      }
      case "join_invite": {
        const code = normalizeInviteCode(event.code);
        if (!code) {
          this.send(connection, {
            type: "invite_failed",
            reason: "not_found",
          });
          return;
        }
        const status = await this.redis.scJoinInvite(...common, sid, code);
        if (status !== "ok") {
          this.send(connection, { type: "invite_failed", reason: status });
          return;
        }
        captureServerEvent(connection.userId, "invite_link_joined");
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
        await this.redis.scChessInvite(
          ...common,
          sid,
          getTimeControl(event.timeControl).id,
        );
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
      case "puzzle_duel_invite":
        await this.handlePuzzleDuelInvite(connection);
        return;
      case "puzzle_duel_response":
        await this.handlePuzzleDuelResponse(connection, event.accept);
        return;
      case "puzzle_duel_progress":
        await this.handlePuzzleDuelProgress(connection, event);
        return;
      case "friend_challenge":
        await this.handleFriendChallenge(
          connection,
          event.friendId,
          getTimeControl(event.timeControl).id,
        );
        return;
      case "friend_challenge_response":
        await this.handleFriendChallengeResponse(
          connection,
          event.challengeId,
          event.accept,
        );
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

  private async handleFriendChallenge(
    connection: Connection,
    friendId: string,
    timeControl: TimeControlId,
  ) {
    if (friendId === connection.userId) {
      this.send(connection, { type: "friend_challenge_failed", reason: "self" });
      return;
    }
    if (hasDatabase()) {
      if (await isBlockedBetween(connection.userId, friendId)) {
        this.send(connection, {
          type: "friend_challenge_failed",
          reason: "blocked",
        });
        return;
      }
      if (!(await areFriends(connection.userId, friendId))) {
        this.send(connection, {
          type: "friend_challenge_failed",
          reason: "not_friends",
        });
        return;
      }
    }

    const candidateSids = await this.redis.smembers(
      `${this.prefix}usids:${friendId}`,
    );
    const liveSids: string[] = [];
    if (candidateSids.length > 0) {
      const conns = await this.redis.hmget(`${this.prefix}conn`, ...candidateSids);
      for (let i = 0; i < candidateSids.length; i++) {
        if (conns[i]) liveSids.push(candidateSids[i]!);
      }
    }
    if (liveSids.length === 0) {
      this.send(connection, {
        type: "friend_challenge_failed",
        reason: "offline",
      });
      return;
    }

    const me = hasDatabase() ? await ensureUser(connection.userId) : null;
    const challengeId = randomUUID();
    const key = `${this.prefix}fch:${challengeId}`;
    await this.redis.hset(key, {
      fromUid: connection.userId,
      fromSid: connection.sid,
      toUid: friendId,
      tc: timeControl,
    });
    await this.redis.expire(key, 60);

    const incomingPayload = JSON.stringify({
      type: "friend_challenge",
      challengeId,
      from: me
        ? {
            id: me.id,
            handle: me.handle,
            avatarSeed: me.avatarSeed,
            chessRating: me.chessRating,
          }
        : {
            id: connection.userId,
            handle: "Friend",
            avatarSeed: connection.userId.slice(0, 8),
            chessRating: 1200,
          },
      timeControl,
    } satisfies ServerEvent);

    await Promise.all(
      liveSids.map((sid) => this.redis.publish(this.channel(sid), incomingPayload)),
    );
    this.send(connection, {
      type: "friend_challenge_sent",
      challengeId,
      toId: friendId,
      timeControl,
    });
    captureServerEvent(connection.userId, "friend_challenge_sent", {
      time_control: timeControl,
    });
  }

  private async handleFriendChallengeResponse(
    connection: Connection,
    challengeId: string,
    accept: boolean,
  ) {
    const key = `${this.prefix}fch:${challengeId}`;
    const lock = await this.redis.set(`${key}:lock`, "1", "EX", 60, "NX");
    if (lock !== "OK") {
      this.send(connection, {
        type: "friend_challenge_failed",
        reason: "expired",
      });
      return;
    }
    const ch = await this.redis.hgetall(key);
    await this.redis.del(key);
    if (!ch.fromSid || !ch.fromUid || ch.toUid !== connection.userId) {
      this.send(connection, {
        type: "friend_challenge_failed",
        reason: "expired",
      });
      return;
    }

    if (!accept) {
      const me = hasDatabase() ? await ensureUser(connection.userId) : null;
      await this.redis.publish(
        this.channel(ch.fromSid),
        JSON.stringify({
          type: "friend_challenge_declined",
          challengeId,
          byHandle: me?.handle,
        } satisfies ServerEvent),
      );
      return;
    }

    const tc = isTimeControlId(ch.tc) ? ch.tc : undefined;
    const status = await this.redis.scPairDirect(
      ...this.common(Date.now()),
      ch.fromSid,
      connection.sid,
      getTimeControl(tc).id,
    );
    if (status !== "ok") {
      this.send(connection, {
        type: "friend_challenge_failed",
        reason: "expired",
      });
      return;
    }
    captureServerEvent(connection.userId, "friend_challenge_accepted", {
      time_control: getTimeControl(tc).id,
    });
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

  private async handlePuzzleDuelInvite(connection: Connection) {
    const [partnerSid] = await this.redis.scPartner(
      ...this.common(Date.now()),
      connection.sid,
    );
    if (!partnerSid) return;

    const invKey = `${this.prefix}duel_inv:${connection.sid}`;
    const partnerInvKey = `${this.prefix}duel_inv:${partnerSid}`;
    const reciprocal = await this.redis.get(partnerInvKey);
    if (reciprocal === connection.sid) {
      await this.redis.del(partnerInvKey);
      await this.startPuzzleDuel(partnerSid, connection.sid);
      return;
    }

    await this.redis.set(invKey, partnerSid, "EX", 120);
    await Promise.all([
      this.redis.publish(
        this.channel(connection.sid),
        JSON.stringify({ type: "puzzle_duel_invite", from: "me" } satisfies ServerEvent),
      ),
      this.redis.publish(
        this.channel(partnerSid),
        JSON.stringify({ type: "puzzle_duel_invite", from: "them" } satisfies ServerEvent),
      ),
    ]);
  }

  private async handlePuzzleDuelResponse(connection: Connection, accept: boolean) {
    const [partnerSid] = await this.redis.scPartner(
      ...this.common(Date.now()),
      connection.sid,
    );
    if (!partnerSid) return;

    const partnerInvKey = `${this.prefix}duel_inv:${partnerSid}`;
    if ((await this.redis.get(partnerInvKey)) !== connection.sid) return;
    await this.redis.del(partnerInvKey);

    if (!accept) {
      await this.redis.publish(
        this.channel(partnerSid),
        JSON.stringify({ type: "puzzle_duel_declined" } satisfies ServerEvent),
      );
      return;
    }

    await this.startPuzzleDuel(partnerSid, connection.sid);
  }

  private async startPuzzleDuel(sidA: string, sidB: string) {
    const duelId = randomUUID();
    const pool = [...CHESS_PUZZLES];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j]!, pool[i]!];
    }
    const puzzleIds = pool.slice(0, PUZZLE_DUEL_COUNT).map((p) => p.id);
    const startedAt = Date.now();
    const emptyState: PuzzleDuelPlayerState = {
      solved: 0,
      mistakes: 0,
      finished: false,
      finishedAt: null,
    };

    const key = `${this.prefix}duel:${duelId}`;
    await this.redis.hset(key, {
      sidA,
      sidB,
      startedAt: String(startedAt),
      durationMs: String(PUZZLE_DUEL_DURATION_MS),
      puzzleIds: JSON.stringify(puzzleIds),
      stateA: JSON.stringify(emptyState),
      stateB: JSON.stringify(emptyState),
    });
    await this.redis.expire(key, 600);

    const startPayload = JSON.stringify({
      type: "puzzle_duel_start",
      id: duelId,
      puzzleIds,
      durationMs: PUZZLE_DUEL_DURATION_MS,
      startedAt,
    } satisfies ServerEvent);
    await Promise.all([
      this.redis.publish(this.channel(sidA), startPayload),
      this.redis.publish(this.channel(sidB), startPayload),
    ]);

    const timer = setTimeout(() => {
      this.duelTimers.delete(duelId);
      void this.finishPuzzleDuel(duelId);
    }, PUZZLE_DUEL_DURATION_MS + 250);
    this.duelTimers.set(duelId, timer);
  }

  private async handlePuzzleDuelProgress(
    connection: Connection,
    event: Extract<ClientEvent, { type: "puzzle_duel_progress" }>,
  ) {
    const key = `${this.prefix}duel:${event.duelId}`;
    const duel = await this.redis.hgetall(key);
    if (!duel.sidA || !duel.sidB) return;

    const isA = duel.sidA === connection.sid;
    const isB = duel.sidB === connection.sid;
    if (!isA && !isB) return;

    const now = Date.now();
    const nextState: PuzzleDuelPlayerState = {
      solved: Math.max(0, Math.min(PUZZLE_DUEL_COUNT, Math.floor(event.solved))),
      mistakes: Math.max(0, Math.floor(event.mistakes)),
      finished: Boolean(event.finished || event.solved >= PUZZLE_DUEL_COUNT),
      finishedAt: event.finished ? now : null,
    };
    const field = isA ? "stateA" : "stateB";
    await this.redis.hset(key, field, JSON.stringify(nextState));
    // Read both states after the write so concurrent finishes never miss each other.
    const [rawA, rawB] = await this.redis.hmget(key, "stateA", "stateB");
    const stateA = rawA
      ? (JSON.parse(rawA) as PuzzleDuelPlayerState)
      : nextState;
    const stateB = rawB
      ? (JSON.parse(rawB) as PuzzleDuelPlayerState)
      : nextState;

    await Promise.all([
      this.redis.publish(
        this.channel(duel.sidA),
        JSON.stringify({
          type: "puzzle_duel_state",
          id: event.duelId,
          me: stateA,
          them: stateB,
        } satisfies ServerEvent),
      ),
      this.redis.publish(
        this.channel(duel.sidB),
        JSON.stringify({
          type: "puzzle_duel_state",
          id: event.duelId,
          me: stateB,
          them: stateA,
        } satisfies ServerEvent),
      ),
    ]);

    const expired = now >= Number(duel.startedAt) + Number(duel.durationMs);
    if ((stateA.finished && stateB.finished) || expired) {
      await this.finishPuzzleDuel(event.duelId);
    }
  }

  private async finishPuzzleDuel(duelId: string) {
    const doneKey = `${this.prefix}duel_done:${duelId}`;
    const wonLock = await this.redis.set(doneKey, "1", "EX", 600, "NX");
    if (wonLock !== "OK") return;

    const existingTimer = this.duelTimers.get(duelId);
    if (existingTimer) {
      clearTimeout(existingTimer);
      this.duelTimers.delete(duelId);
    }

    const duel = await this.redis.hgetall(`${this.prefix}duel:${duelId}`);
    if (!duel.sidA || !duel.sidB) return;

    const stateA = JSON.parse(duel.stateA ?? "{}") as PuzzleDuelPlayerState;
    const stateB = JSON.parse(duel.stateB ?? "{}") as PuzzleDuelPlayerState;
    const winnerForA = compareDuelStates(stateA, stateB);
    const winnerForB =
      winnerForA === "draw" ? "draw" : winnerForA === "me" ? "them" : "me";

    await Promise.all([
      this.redis.publish(
        this.channel(duel.sidA),
        JSON.stringify({
          type: "puzzle_duel_over",
          id: duelId,
          winner: winnerForA,
          me: stateA,
          them: stateB,
        } satisfies ServerEvent),
      ),
      this.redis.publish(
        this.channel(duel.sidB),
        JSON.stringify({
          type: "puzzle_duel_over",
          id: duelId,
          winner: winnerForB,
          me: stateB,
          them: stateA,
        } satisfies ServerEvent),
      ),
    ]);
  }

  private async flushEndedGames() {
    if (this.closed || !hasDatabase()) return;
    const key = `${this.prefix}ended_games`;
    for (let i = 0; i < 10; i++) {
      if (this.closed) return;
      let raw: string | null;
      try {
        raw = await this.redis.lpop(key);
      } catch {
        return;
      }
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
      const timeControl = isTimeControlId(event.timeControl)
        ? event.timeControl
        : undefined;
      return event.mode === "chess"
        ? { type: "find", mode: "chess", tags, timeControl }
        : { type: "find", tags };
    }
    case "create_invite": {
      const mode = event.mode === "chess" ? "chess" : "chat";
      const timeControl = isTimeControlId(event.timeControl)
        ? event.timeControl
        : undefined;
      return { type: "create_invite", mode, timeControl };
    }
    case "join_invite":
      return typeof event.code === "string"
        ? { type: "join_invite", code: event.code }
        : undefined;
    case "chess_invite":
      return {
        type: "chess_invite",
        timeControl: isTimeControlId(event.timeControl)
          ? event.timeControl
          : undefined,
      };
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
    case "puzzle_duel_invite":
      return { type: "puzzle_duel_invite" };
    case "puzzle_duel_response":
      return typeof event.accept === "boolean"
        ? { type: "puzzle_duel_response", accept: event.accept }
        : undefined;
    case "puzzle_duel_progress":
      return typeof event.duelId === "string" &&
        typeof event.solved === "number" &&
        typeof event.mistakes === "number" &&
        typeof event.finished === "boolean"
        ? {
            type: "puzzle_duel_progress",
            duelId: event.duelId,
            solved: event.solved,
            mistakes: event.mistakes,
            finished: event.finished,
          }
        : undefined;
    case "friend_challenge":
      return typeof event.friendId === "string" && event.friendId.length > 0
        ? {
            type: "friend_challenge",
            friendId: event.friendId,
            timeControl: isTimeControlId(event.timeControl)
              ? event.timeControl
              : undefined,
          }
        : undefined;
    case "friend_challenge_response":
      return typeof event.challengeId === "string" &&
        event.challengeId.length > 0 &&
        typeof event.accept === "boolean"
        ? {
            type: "friend_challenge_response",
            challengeId: event.challengeId,
            accept: event.accept,
          }
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

function compareDuelStates(
  a: PuzzleDuelPlayerState,
  b: PuzzleDuelPlayerState,
): "me" | "them" | "draw" {
  if (a.solved !== b.solved) return a.solved > b.solved ? "me" : "them";
  if (a.mistakes !== b.mistakes) return a.mistakes < b.mistakes ? "me" : "them";
  if (a.finishedAt !== null && b.finishedAt !== null && a.finishedAt !== b.finishedAt) {
    return a.finishedAt < b.finishedAt ? "me" : "them";
  }
  if (a.finished !== b.finished) return a.finished ? "me" : "them";
  return "draw";
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
