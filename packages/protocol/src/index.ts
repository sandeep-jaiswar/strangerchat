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

export type ClientEvent =
  /** Join the matchmaking queue, leaving any current chat. */
  | { type: "find" }
  /** Send a chat message to the current partner. */
  | { type: "message"; text: string }
  | { type: "typing"; isTyping: boolean }
  /** Leave the current chat or queue, staying online. */
  | { type: "leave" }
  /** The tab is closing: end this session now instead of after the reconnect grace period. */
  | { type: "bye" };

export type ServerEvent =
  /** Sent on every (re)connect so the client can resume where the server left off. */
  | { type: "state"; phase: ChatPhase }
  | { type: "online"; count: number }
  | { type: "searching" }
  | { type: "matched" }
  | { type: "message"; id: string; text: string; sentAt: number }
  | { type: "typing"; isTyping: boolean }
  | { type: "partner_left" }
  | { type: "error"; code: ErrorCode; message: string };

export type ErrorCode = "rate_limited" | "invalid_message" | "not_in_chat";
