/**
 * Wire protocol shared by the web client and the chat server.
 * Every frame is a single JSON object with a `type` discriminator.
 */

export const MAX_MESSAGE_LENGTH = 1000;
export const MAX_TAGS = 3;
export const MAX_TAG_LENGTH = 24;

/** Path of the WebSocket endpoint, relative to the site origin. */
export const CHAT_SOCKET_PATH = "/api/ws";

/**
 * Close codes the server uses. The client reacts to each differently:
 * re-authenticate, start a fresh session, or quietly reconnect.
 */
export const CloseCode = {
  /** The session was taken over by a newer socket for the same tab. */
  Replaced: 4000,
  /** The server forgot this session (it was offline too long); reconnect to resync. */
  Expired: 4001,
  Unauthorized: 4401,
  /** The session id belongs to another user; pick a new one. */
  SessionConflict: 4403,
} as const;

export type ChatPhase = "idle" | "searching" | "chatting";

/** What two strangers are matched for. Each mode has its own queue. */
export type ChatMode = "chat" | "chess";

/** Chess Club games default to 10+0, with fast Bullet and Blitz controls supported. */
export type TimeControlId =
  | "bullet_1_0"
  | "blitz_3_2"
  | "blitz_5_0"
  | "rapid_10_0";

export interface TimeControlSpec {
  id: TimeControlId;
  label: string;
  category: "Bullet" | "Blitz" | "Rapid";
  initialMs: number;
  incrementMs: number;
}

export const DEFAULT_TIME_CONTROL: TimeControlId = "rapid_10_0";

export const TIME_CONTROLS: Record<TimeControlId, TimeControlSpec> = {
  bullet_1_0: {
    id: "bullet_1_0",
    label: "1+0",
    category: "Bullet",
    initialMs: 60_000,
    incrementMs: 0,
  },
  blitz_3_2: {
    id: "blitz_3_2",
    label: "3+2",
    category: "Blitz",
    initialMs: 3 * 60_000,
    incrementMs: 2_000,
  },
  blitz_5_0: {
    id: "blitz_5_0",
    label: "5+0",
    category: "Blitz",
    initialMs: 5 * 60_000,
    incrementMs: 0,
  },
  rapid_10_0: {
    id: "rapid_10_0",
    label: "10+0",
    category: "Rapid",
    initialMs: 10 * 60_000,
    incrementMs: 0,
  },
};

export function isTimeControlId(value: unknown): value is TimeControlId {
  return typeof value === "string" && Object.hasOwn(TIME_CONTROLS, value);
}

export function getTimeControl(id?: TimeControlId): TimeControlSpec {
  return id && isTimeControlId(id)
    ? TIME_CONTROLS[id]
    : TIME_CONTROLS[DEFAULT_TIME_CONTROL];
}

export const CHESS_INITIAL_MS = TIME_CONTROLS[DEFAULT_TIME_CONTROL].initialMs;
export const CHESS_INCREMENT_MS = TIME_CONTROLS[DEFAULT_TIME_CONTROL].incrementMs;
/** Each side must make its first move within this long, or the game is aborted. */
export const CHESS_FIRST_MOVE_MS = 30_000;

export const PUZZLE_DUEL_COUNT = 3;
export const PUZZLE_DUEL_DURATION_MS = 90_000;

export interface PuzzleDuelPlayerState {
  solved: number;
  mistakes: number;
  finished: boolean;
  finishedAt: number | null;
}

export function normalizeInviteCode(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const clean = raw.trim().replace(/[^a-zA-Z0-9_-]/g, "");
  return clean.length >= 6 && clean.length <= 24 ? clean : null;
}

export type ChessColor = "white" | "black";
export type ChessResult = "1-0" | "0-1" | "1/2-1/2" | "aborted";
export type ChessEndReason =
  | "checkmate"
  | "resignation"
  | "timeout"
  | "abandoned"
  | "aborted"
  | "stalemate"
  | "insufficient_material"
  | "threefold_repetition"
  | "fifty_moves"
  | "agreement";
export type ChessOffer = "draw" | "rematch";

export interface PublicFriendProfile {
  id: string;
  handle: string;
  avatarSeed: string;
  chessRating: number;
}

/** Remaining time on each clock (ms) as of when the event was sent. */
export interface ChessClock {
  white: number;
  black: number;
  /** Whether the side to move is on the clock (from both sides' first move on). */
  running: boolean;
  /** Time left to make the first move before the game is aborted, while it applies. */
  firstMoveMs: number | null;
}

/** Everything needed to show a game, sent when it starts and whenever a client resyncs. */
export interface ChessGame {
  id: string;
  color: ChessColor;
  /** Time control key used for this game (defaults to `rapid_10_0` if omitted). */
  timeControl?: TimeControlId;
  /** Moves so far in SAN, from the starting position. */
  moves: string[];
  clock: ChessClock;
  status: "playing" | "over";
  result: ChessResult | null;
  reason: ChessEndReason | null;
  /** Who has a standing draw or rematch offer. */
  offers: Record<ChessOffer, "me" | "them" | null>;
}

export type ClientEvent =
  /** Join the matchmaking queue for `mode` (default "chat"), leaving any current chat. */
  | { type: "find"; mode?: ChatMode; tags?: string[]; timeControl?: TimeControlId }
  /** Create a direct invite code so someone with the link joins immediately without queuing. */
  | { type: "create_invite"; mode?: ChatMode; timeControl?: TimeControlId }
  /** Join an existing direct invite room by code. */
  | { type: "join_invite"; code: string }
  /** Send a chat message to the current partner. */
  | { type: "message"; text: string }
  | { type: "typing"; isTyping: boolean }
  /** Leave the current chat or queue, staying online. */
  | { type: "leave" }
  /** The tab is closing: end this session now instead of after the reconnect grace period. */
  | { type: "bye" }
  /** Invite the current text-chat partner to play a chess game right inside the chat. */
  | { type: "chess_invite"; timeControl?: TimeControlId }
  | { type: "chess_invite_response"; accept: boolean }
  | { type: "chess_move"; from: string; to: string; promotion?: string }
  | { type: "chess_resign" }
  /** Offer a draw or rematch, or accept the partner's standing offer. */
  | { type: "chess_offer"; offer: ChessOffer }
  /** A clock looks like it ran out; asks the server to check and end the game. */
  | { type: "chess_flag" }
  /** Invite the current chat partner to a live head-to-head puzzle duel. */
  | { type: "puzzle_duel_invite" }
  | { type: "puzzle_duel_response"; accept: boolean }
  | {
      type: "puzzle_duel_progress";
      duelId: string;
      solved: number;
      mistakes: number;
      finished: boolean;
    }
  /** Challenge an online mutual friend directly to a chess match. */
  | {
      type: "friend_challenge";
      friendId: string;
      timeControl?: TimeControlId;
    }
  | {
      type: "friend_challenge_response";
      challengeId: string;
      accept: boolean;
    }
  /** Send or accept a mutual friend request with the current partner. */
  | { type: "friend_request" }
  /** Block or report the current partner. */
  | { type: "safety_action"; action: "block" | "report"; reason?: string };

export type ServerEvent =
  /** Sent on every (re)connect so the client can resume where the server left off. */
  | { type: "state"; phase: ChatPhase }
  | { type: "online"; count: number }
  | { type: "searching" }
  | {
      type: "invite_created";
      code: string;
      mode: ChatMode;
      timeControl?: TimeControlId;
    }
  | {
      type: "invite_failed";
      reason: "not_found" | "self" | "blocked";
    }
  | {
      type: "matched";
      mode: ChatMode;
      sharedTags?: string[];
      timeControl?: TimeControlId;
    }
  | { type: "message"; id: string; text: string; sentAt: number }
  | { type: "typing"; isTyping: boolean }
  | { type: "partner_left" }
  | { type: "chess_invite"; from: "me" | "them"; timeControl?: TimeControlId }
  | { type: "chess_invite_declined" }
  /** The full game: on start, on reconnect and after a rejected move. */
  | { type: "chess_game"; game: ChessGame }
  /** A move was played (by either side); `ply` is its 1-based number. */
  | { type: "chess_move"; san: string; ply: number; clock: ChessClock }
  | {
      type: "chess_over";
      result: ChessResult;
      reason: ChessEndReason;
      clock: ChessClock;
    }
  /** The partner made an offer. */
  | { type: "chess_offer"; offer: ChessOffer }
  | { type: "puzzle_duel_invite"; from: "me" | "them" }
  | { type: "puzzle_duel_declined" }
  | {
      type: "puzzle_duel_start";
      id: string;
      puzzleIds: string[];
      durationMs: number;
      startedAt: number;
    }
  | {
      type: "puzzle_duel_state";
      id: string;
      me: PuzzleDuelPlayerState;
      them: PuzzleDuelPlayerState;
    }
  | {
      type: "puzzle_duel_over";
      id: string;
      winner: "me" | "them" | "draw";
      me: PuzzleDuelPlayerState;
      them: PuzzleDuelPlayerState;
    }
  | {
      type: "friend_challenge";
      challengeId: string;
      from: PublicFriendProfile;
      timeControl: TimeControlId;
    }
  | {
      type: "friend_challenge_sent";
      challengeId: string;
      toId: string;
      timeControl: TimeControlId;
    }
  | {
      type: "friend_challenge_declined";
      challengeId: string;
      byHandle?: string;
    }
  | {
      type: "friend_challenge_failed";
      reason: "offline" | "not_friends" | "blocked" | "self" | "expired";
    }
  | {
      type: "friend_status";
      status: "pending_me" | "pending_them" | "accepted" | "unavailable";
      partner?: PublicFriendProfile;
    }
  | { type: "safety_ack"; action: "block" | "report"; message: string }
  | { type: "error"; code: ErrorCode; message: string };

export type ErrorCode =
  | "rate_limited"
  | "invalid_message"
  | "invalid_invite"
  | "not_in_chat"
  | "invalid_move"
  | "banned";

export {
  CHESS_PUZZLES,
  CHESS_PUZZLE_BY_ID,
  type ChessPuzzle,
} from "./puzzles.ts";

export {
  RANK_TIERS,
  getDailyPuzzleIndex,
  getIsoWeekKey,
  getRankTier,
  getUtcDateKey,
  type RankTier,
  type RankTierId,
} from "./ranks.ts";
