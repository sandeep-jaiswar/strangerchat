/**
 * Wire protocol shared by the web client and the chat server.
 * Every frame is a single JSON object with a `type` discriminator.
 */

export const MAX_MESSAGE_LENGTH = 1000;

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

/** Chess Club games are casual 10+0. */
export const CHESS_INITIAL_MS = 10 * 60_000;
export const CHESS_INCREMENT_MS = 0;
/** Each side must make its first move within this long, or the game is aborted. */
export const CHESS_FIRST_MOVE_MS = 30_000;

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
  | { type: "find"; mode?: ChatMode }
  /** Send a chat message to the current partner. */
  | { type: "message"; text: string }
  | { type: "typing"; isTyping: boolean }
  /** Leave the current chat or queue, staying online. */
  | { type: "leave" }
  /** The tab is closing: end this session now instead of after the reconnect grace period. */
  | { type: "bye" }
  | { type: "chess_move"; from: string; to: string; promotion?: string }
  | { type: "chess_resign" }
  /** Offer a draw or rematch, or accept the partner's standing offer. */
  | { type: "chess_offer"; offer: ChessOffer }
  /** A clock looks like it ran out; asks the server to check and end the game. */
  | { type: "chess_flag" };

export type ServerEvent =
  /** Sent on every (re)connect so the client can resume where the server left off. */
  | { type: "state"; phase: ChatPhase }
  | { type: "online"; count: number }
  | { type: "searching" }
  | { type: "matched"; mode: ChatMode }
  | { type: "message"; id: string; text: string; sentAt: number }
  | { type: "typing"; isTyping: boolean }
  | { type: "partner_left" }
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
  | { type: "error"; code: ErrorCode; message: string };

export type ErrorCode =
  "rate_limited" | "invalid_message" | "not_in_chat" | "invalid_move";
