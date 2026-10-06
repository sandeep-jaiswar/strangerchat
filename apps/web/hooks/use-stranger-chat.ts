"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { Chess } from "chess.js";
import { toast } from "sonner";
import {
  CHAT_SOCKET_PATH,
  CloseCode,
  type ChatMode,
  type ChessClock,
  type ChessEndReason,
  type ChessGame,
  type ChessOffer,
  type ChessResult,
  type ClientEvent,
  type ServerEvent,
} from "@repo/protocol";

export type ChatPhase = "idle" | "searching" | "chatting" | "ended";
export type ConnectionStatus = "connecting" | "open" | "reconnecting";

export interface ChatItem {
  id: string;
  from: "me" | "stranger" | "system";
  text: string;
  sentAt: number;
}

/** A chess game as shown on this client. */
export interface ChessView extends ChessGame {
  fen: string;
  /** Squares of the last move, for highlighting. */
  lastMove: { from: string; to: string } | null;
  /** When `clock` was received (client time), so the running side can count down. */
  clockAt: number;
}

interface State {
  connection: ConnectionStatus;
  phase: ChatPhase;
  /** The mode of the current (or last) search. */
  mode: ChatMode;
  online: number;
  messages: ChatItem[];
  partnerTyping: boolean;
  game: ChessView | null;
}

type Action =
  | { type: "connection"; status: ConnectionStatus }
  | { type: "server"; event: ServerEvent }
  | { type: "sent"; item: ChatItem }
  | { type: "find"; mode: ChatMode }
  | { type: "localMove"; san: string }
  | { type: "localOffer"; offer: ChessOffer }
  | { type: "partnerTypingTimeout" }
  | { type: "left" };

const initialState: State = {
  connection: "connecting",
  phase: "idle",
  mode: "chat",
  online: 0,
  messages: [],
  partnerTyping: false,
  game: null,
};

function systemItem(text: string): ChatItem {
  return { id: crypto.randomUUID(), from: "system", text, sentAt: Date.now() };
}

/** Replays SAN moves from the start into a position. */
function replay(moves: string[]) {
  const chess = new Chess();
  for (const san of moves) chess.move(san);
  return chess;
}

/** Plays one more move on a game, or returns undefined if it doesn't fit. */
function withMove(game: ChessView, san: string): ChessView | undefined {
  const chess = new Chess(game.fen);
  try {
    const move = chess.move(san);
    const mine = (move.color === "w") === (game.color === "white");
    return {
      ...game,
      fen: chess.fen(),
      moves: [...game.moves, move.san],
      lastMove: { from: move.from, to: move.to },
      // Moving declines the other side's draw offer.
      offers: {
        ...game.offers,
        draw:
          game.offers.draw === (mine ? "them" : "me") ? null : game.offers.draw,
      },
    };
  } catch {
    return undefined;
  }
}

function fromServer(game: ChessGame): ChessView {
  const chess = replay(game.moves);
  const last = chess.history({ verbose: true }).at(-1);
  return {
    ...game,
    fen: chess.fen(),
    lastMove: last ? { from: last.from, to: last.to } : null,
    clockAt: Date.now(),
  };
}

const REASONS: Record<ChessEndReason, string> = {
  checkmate: "by checkmate",
  resignation: "by resignation",
  timeout: "on time",
  abandoned: "— opponent left",
  aborted: "",
  stalemate: "by stalemate",
  insufficient_material: "— insufficient material",
  threefold_repetition: "by threefold repetition",
  fifty_moves: "by the fifty-move rule",
  agreement: "by agreement",
};

/** A one-line summary of how the game ended, from this player's side. */
export function describeResult(
  game: Pick<ChessView, "color" | "result" | "reason">,
) {
  if (!game.result || !game.reason) return "";
  if (game.result === "aborted") return "Game aborted";
  if (game.result === "1/2-1/2") return `Draw ${REASONS[game.reason]}`;
  const won = (game.result === "1-0") === (game.color === "white");
  const reason =
    game.reason === "abandoned"
      ? won
        ? "— opponent left"
        : "— you left"
      : REASONS[game.reason];
  return `${won ? "You won" : "You lost"} ${reason}`;
}

function gameOver(
  game: ChessView,
  result: ChessResult,
  reason: ChessEndReason,
  clock: ChessClock,
): ChessView {
  return {
    ...game,
    status: "over",
    result,
    reason,
    clock,
    clockAt: Date.now(),
    offers: { ...game.offers, draw: null },
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "connection":
      // The server keeps the chat alive while we reconnect; its "state" event says
      // whether it survived.
      return {
        ...state,
        connection: action.status,
        partnerTyping: action.status === "open" && state.partnerTyping,
      };
    case "sent":
      return { ...state, messages: [...state.messages, action.item] };
    case "find":
      return { ...state, mode: action.mode };
    case "localMove": {
      const game = state.game && withMove(state.game, action.san);
      return game ? { ...state, game } : state;
    }
    case "localOffer":
      if (!state.game || state.game.offers[action.offer]) return state;
      return {
        ...state,
        game: {
          ...state.game,
          offers: { ...state.game.offers, [action.offer]: "me" },
        },
      };
    case "partnerTypingTimeout":
      return { ...state, partnerTyping: false };
    case "left":
      return { ...state, phase: "idle", partnerTyping: false };
    case "server": {
      const event = action.event;
      switch (event.type) {
        case "state":
          if (event.phase === "chatting" && state.phase !== "chatting") {
            return {
              ...state,
              phase: "chatting",
              messages: [systemItem("Reconnected to your chat.")],
            };
          }
          if (event.phase === "idle" && state.phase === "chatting") {
            return {
              ...state,
              phase: "ended",
              messages: [
                ...state.messages,
                systemItem("Stranger has left the chat."),
              ],
            };
          }
          return state;
        case "online":
          return { ...state, online: event.count };
        case "searching":
          return { ...state, phase: "searching", messages: [], game: null };
        case "matched":
          return {
            ...state,
            phase: "chatting",
            mode: event.mode,
            partnerTyping: false,
            game: null,
            messages: [
              systemItem(
                event.mode === "chess"
                  ? "You're now playing chess with a random stranger. Say hi!"
                  : "You're now chatting with a random stranger. Say hi!",
              ),
            ],
          };
        case "chess_game": {
          const rematch =
            state.game !== null && state.game.id !== event.game.id;
          return {
            ...state,
            mode: "chess",
            game: fromServer(event.game),
            messages: rematch
              ? [
                  ...state.messages,
                  systemItem(
                    `Rematch started — you're playing ${event.game.color}.`,
                  ),
                ]
              : state.messages,
          };
        }
        case "chess_move": {
          const game = state.game;
          if (!game) return state;
          // Our own moves are already on the board; only the clock is news.
          const next =
            event.ply <= game.moves.length
              ? game
              : event.ply === game.moves.length + 1
                ? withMove(game, event.san)
                : undefined;
          if (!next) return state;
          return {
            ...state,
            game: { ...next, clock: event.clock, clockAt: Date.now() },
          };
        }
        case "chess_over": {
          if (!state.game) return state;
          const game = gameOver(
            state.game,
            event.result,
            event.reason,
            event.clock,
          );
          return {
            ...state,
            game,
            messages: [...state.messages, systemItem(describeResult(game))],
          };
        }
        case "chess_offer": {
          if (!state.game) return state;
          return {
            ...state,
            game: {
              ...state.game,
              offers: { ...state.game.offers, [event.offer]: "them" },
            },
            messages: [
              ...state.messages,
              systemItem(
                event.offer === "draw"
                  ? "Stranger offers a draw."
                  : "Stranger wants a rematch.",
              ),
            ],
          };
        }
        case "message":
          return {
            ...state,
            partnerTyping: false,
            messages: [
              ...state.messages,
              {
                id: event.id,
                from: "stranger",
                text: event.text,
                sentAt: event.sentAt,
              },
            ],
          };
        case "typing":
          return { ...state, partnerTyping: event.isTyping };
        case "partner_left":
          return {
            ...state,
            phase: "ended",
            partnerTyping: false,
            messages: [
              ...state.messages,
              systemItem("Stranger has left the chat."),
            ],
          };
        case "error":
          return state;
      }
    }
  }
}

const TYPING_THROTTLE_MS = 2_000;
const TYPING_IDLE_MS = 3_000;
const PARTNER_TYPING_TIMEOUT_MS = 6_000;
const MAX_RECONNECT_DELAY_MS = 15_000;

function socketUrl(sid: string) {
  // In development the socket is served by a separate dev server (see packages/chat-server).
  const base =
    process.env.NEXT_PUBLIC_WS_URL ||
    `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}${CHAT_SOCKET_PATH}`;
  const url = new URL(base);
  url.searchParams.set("sid", sid);
  return url;
}

export function useStrangerchat() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const socketRef = useRef<WebSocket | null>(null);
  const phaseRef = useRef(state.phase);
  const modeRef = useRef(state.mode);
  const gameRef = useRef(state.game);
  useEffect(() => {
    phaseRef.current = state.phase;
    modeRef.current = state.mode;
    gameRef.current = state.game;
  }, [state.phase, state.mode, state.game]);

  const typingSentAt = useRef(0);
  const typingIdleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const partnerTypingTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const send = useCallback((event: ClientEvent) => {
    const socket = socketRef.current;
    if (socket?.readyState !== WebSocket.OPEN) return false;
    socket.send(JSON.stringify(event));
    return true;
  }, []);

  useEffect(() => {
    let disposed = false;
    let attempt = 0;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    // Identifies this tab's chat to the server so a dropped socket can resume it.
    let sid = crypto.randomUUID();

    const scheduleReconnect = () => {
      if (disposed) return;
      dispatch({ type: "connection", status: "reconnecting" });
      // Vercel recycles sockets routinely, so retry the first time almost immediately.
      const delay =
        attempt === 0
          ? 250
          : Math.min(1000 * 2 ** (attempt - 1), MAX_RECONNECT_DELAY_MS);
      attempt++;
      retryTimer = setTimeout(connect, delay);
    };

    function connect() {
      if (disposed) return;
      const socket = new WebSocket(socketUrl(sid));
      socketRef.current = socket;

      socket.onopen = () => {
        attempt = 0;
        dispatch({ type: "connection", status: "open" });
      };
      socket.onmessage = (message) => {
        const event = JSON.parse(String(message.data)) as ServerEvent;
        if (event.type === "error") {
          toast.error(event.message);
        } else if (event.type === "typing") {
          clearTimeout(partnerTypingTimer.current);
          if (event.isTyping) {
            partnerTypingTimer.current = setTimeout(
              () => dispatch({ type: "partnerTypingTimeout" }),
              PARTNER_TYPING_TIMEOUT_MS,
            );
          }
        } else if (
          event.type === "state" &&
          event.phase === "idle" &&
          phaseRef.current === "searching"
        ) {
          // We fell out of the queue while disconnected; rejoin it.
          socket.send(
            JSON.stringify({
              type: "find",
              mode: modeRef.current,
            } satisfies ClientEvent),
          );
        }
        dispatch({ type: "server", event });
      };
      socket.onclose = (event) => {
        // A socket we already replaced has nothing more to tell us.
        if (socketRef.current !== socket) return;
        socketRef.current = null;
        if (event.code === CloseCode.Unauthorized) {
          window.location.href = "/login?callbackUrl=/chat";
          return;
        }
        if (event.code === CloseCode.SessionConflict) sid = crypto.randomUUID();
        scheduleReconnect();
      };
    }

    // End the session when the tab closes, so the partner and the online count update
    // right away instead of after the reconnect grace period.
    const onPageHide = () => {
      const socket = socketRef.current;
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "bye" } satisfies ClientEvent));
      }
    };
    window.addEventListener("pagehide", onPageHide);

    connect();

    return () => {
      disposed = true;
      window.removeEventListener("pagehide", onPageHide);
      clearTimeout(retryTimer);
      clearTimeout(typingIdleTimer.current);
      clearTimeout(partnerTypingTimer.current);
      const socket = socketRef.current;
      socketRef.current = null;
      socket?.close();
    };
  }, []);

  const stopTyping = useCallback(() => {
    clearTimeout(typingIdleTimer.current);
    if (typingSentAt.current) {
      typingSentAt.current = 0;
      send({ type: "typing", isTyping: false });
    }
  }, [send]);

  /** Call on every keystroke; sends throttled typing events to the partner. */
  const notifyTyping = useCallback(() => {
    if (phaseRef.current !== "chatting") return;
    const now = Date.now();
    if (now - typingSentAt.current > TYPING_THROTTLE_MS) {
      typingSentAt.current = now;
      send({ type: "typing", isTyping: true });
    }
    clearTimeout(typingIdleTimer.current);
    typingIdleTimer.current = setTimeout(stopTyping, TYPING_IDLE_MS);
  }, [send, stopTyping]);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || phaseRef.current !== "chatting") return false;
      if (!send({ type: "message", text: trimmed })) return false;
      stopTyping();
      dispatch({
        type: "sent",
        item: {
          id: crypto.randomUUID(),
          from: "me",
          text: trimmed,
          sentAt: Date.now(),
        },
      });
      return true;
    },
    [send, stopTyping],
  );

  /** Start searching (in `mode`, or the last one), or skip the current partner and search again. */
  const findStranger = useCallback(
    (mode: ChatMode = modeRef.current) => {
      stopTyping();
      if (send({ type: "find", mode })) {
        modeRef.current = mode;
        dispatch({ type: "find", mode });
      }
    },
    [send, stopTyping],
  );

  /** Plays a move if it's legal on our board; returns whether it was sent. */
  const playMove = useCallback(
    (from: string, to: string, promotion?: string) => {
      const game = gameRef.current;
      if (!game || game.status !== "playing") return false;
      const chess = new Chess(game.fen);
      if ((chess.turn() === "w") !== (game.color === "white")) return false;
      let san: string;
      try {
        san = chess.move({ from, to, promotion }).san;
      } catch {
        return false;
      }
      if (!send({ type: "chess_move", from, to, promotion })) return false;
      dispatch({ type: "localMove", san });
      return true;
    },
    [send],
  );

  const resign = useCallback(() => send({ type: "chess_resign" }), [send]);

  /** Offer a draw or rematch, or accept the stranger's. */
  const offer = useCallback(
    (kind: ChessOffer) => {
      if (send({ type: "chess_offer", offer: kind })) {
        dispatch({ type: "localOffer", offer: kind });
      }
    },
    [send],
  );

  /** Asks the server to end the game if a clock looks out of time. */
  const claimFlag = useCallback(() => send({ type: "chess_flag" }), [send]);

  const leave = useCallback(() => {
    stopTyping();
    if (send({ type: "leave" })) dispatch({ type: "left" });
  }, [send, stopTyping]);

  return {
    ...state,
    findStranger,
    leave,
    sendMessage,
    notifyTyping,
    playMove,
    resign,
    offer,
    claimFlag,
  };
}
