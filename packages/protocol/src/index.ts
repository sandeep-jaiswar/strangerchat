/**
 * Wire protocol shared by the web client and the realtime server.
 * Every frame is a single JSON object with a `type` discriminator.
 */

export const MAX_MESSAGE_LENGTH = 1000;

/** Audience claim for tokens minted by the web app for the realtime server. */
export const REALTIME_TOKEN_AUDIENCE = "strangerchat-realtime";

export type ClientEvent =
  /** Join the matchmaking queue. */
  | { type: "find" }
  /** Send a chat message to the current partner. */
  | { type: "message"; text: string }
  | { type: "typing"; isTyping: boolean }
  /** Leave the current chat or queue. */
  | { type: "leave" };

export type ServerEvent =
  | { type: "online"; count: number }
  | { type: "searching" }
  | { type: "matched" }
  | { type: "message"; id: string; text: string; sentAt: number }
  | { type: "typing"; isTyping: boolean }
  | { type: "partner_left" }
  | { type: "error"; code: ErrorCode; message: string };

export type ErrorCode = "rate_limited" | "invalid_message" | "not_in_chat";
