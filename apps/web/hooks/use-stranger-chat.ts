"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { Chess } from "chess.js";
import { toast } from "sonner";
import {
  CHAT_SOCKET_PATH,
  CloseCode,
  DEFAULT_TIME_CONTROL,
  getTimeControl,
  type ChatMode,
  type ChessClock,
  type ChessEndReason,
  type ChessGame,
  type ChessOffer,
  type ChessResult,
  type ClientEvent,
  type PublicFriendProfile,
  type PuzzleDuelPlayerState,
  type ServerEvent,
  type TimeControlId,
} from "@funstranger/protocol";
import { captureEvent } from "@/lib/analytics";

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

export type FriendHandshakeStatus =
  | "none"
  | "pending_me"
  | "pending_them"
  | "accepted"
  | "unavailable";

export interface PuzzleDuelView {
  id: string;
  puzzleIds: string[];
  durationMs: number;
  startedAt: number;
  me: PuzzleDuelPlayerState;
  them: PuzzleDuelPlayerState;
  winner: "me" | "them" | "draw" | null;
}

export interface IncomingFriendChallenge {
  challengeId: string;
  from: PublicFriendProfile;
  timeControl: TimeControlId;
}

interface State {
  connection: ConnectionStatus;
  phase: ChatPhase;
  /** The mode of the current (or last) search. */
  mode: ChatMode;
  timeControl: TimeControlId;
  tags: string[];
  sharedTags: string[];
  online: number;
  messages: ChatItem[];
  partnerTyping: boolean;
  game: ChessView | null;
  chessInvite: "me" | "them" | null;
  chessInviteTimeControl: TimeControlId | null;
  inviteCode: string | null;
  inviteMode: ChatMode | null;
  puzzleDuelInvite: "me" | "them" | null;
  puzzleDuel: PuzzleDuelView | null;
  incomingChallenge: IncomingFriendChallenge | null;
  friendStatus: FriendHandshakeStatus;
  friendPartner: PublicFriendProfile | null;
}

type Action =
  | { type: "connection"; status: ConnectionStatus }
  | { type: "server"; event: ServerEvent }
  | { type: "sent"; item: ChatItem }
  | {
      type: "find";
      mode: ChatMode;
      tags?: string[];
      timeControl?: TimeControlId;
    }
  | { type: "setTimeControl"; timeControl: TimeControlId }
  | { type: "setTags"; tags: string[] }
  | { type: "localMove"; san: string }
  | { type: "localOffer"; offer: ChessOffer }
  | { type: "dismissPuzzleDuel" }
  | { type: "clearChallenge" }
  | { type: "partnerTypingTimeout" }
  | { type: "left" };

const initialState: State = {
  connection: "connecting",
  phase: "idle",
  mode: "chat",
  timeControl: DEFAULT_TIME_CONTROL,
  tags: [],
  sharedTags: [],
  online: 0,
  messages: [],
  partnerTyping: false,
  game: null,
  chessInvite: null,
  chessInviteTimeControl: null,
  inviteCode: null,
  inviteMode: null,
  puzzleDuelInvite: null,
  puzzleDuel: null,
  incomingChallenge: null,
  friendStatus: "none",
  friendPartner: null,
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
      return {
        ...state,
        mode: action.mode,
        timeControl: action.timeControl ?? state.timeControl,
        tags: action.tags ?? state.tags,
        inviteCode: null,
        inviteMode: null,
      };
    case "setTimeControl":
      return { ...state, timeControl: action.timeControl };
    case "setTags":
      return { ...state, tags: action.tags };
    case "dismissPuzzleDuel":
      return { ...state, puzzleDuel: null };
    case "clearChallenge":
      return { ...state, incomingChallenge: null };
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
      return {
        ...state,
        phase: "idle",
        partnerTyping: false,
        chessInvite: null,
        chessInviteTimeControl: null,
        inviteCode: null,
        inviteMode: null,
        puzzleDuelInvite: null,
        puzzleDuel: null,
        sharedTags: [],
      };
    case "server": {
      const event = action.event;
      switch (event.type) {
        case "state":
          if (event.phase === "chatting" && state.phase !== "chatting") {
            return {
              ...state,
              phase: "chatting",
              inviteCode: null,
              inviteMode: null,
              messages: [systemItem("Reconnected to your chat.")],
            };
          }
          if (event.phase === "idle" && state.phase === "chatting") {
            return {
              ...state,
              phase: "ended",
              chessInvite: null,
              chessInviteTimeControl: null,
              puzzleDuelInvite: null,
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
          return {
            ...state,
            phase: "searching",
            messages: [],
            game: null,
            sharedTags: [],
            chessInvite: null,
            chessInviteTimeControl: null,
            inviteCode: null,
            inviteMode: null,
            puzzleDuelInvite: null,
            puzzleDuel: null,
            friendStatus: "none",
            friendPartner: null,
          };
        case "invite_created":
          return {
            ...state,
            phase: "idle",
            inviteCode: event.code,
            inviteMode: event.mode,
            timeControl: event.timeControl ?? state.timeControl,
          };
        case "invite_failed":
          return {
            ...state,
            inviteCode: null,
            inviteMode: null,
          };
        case "matched": {
          const shared = event.sharedTags ?? [];
          const tcLabel =
            event.mode === "chess"
              ? ` (${getTimeControl(event.timeControl).label})`
              : "";
          const baseMsg =
            event.mode === "chess"
              ? `You're now playing${tcLabel} chess with a random stranger. Say hi!`
              : "You're now chatting with a random stranger. Say hi!";
          const tagMsg =
            shared.length > 0
              ? ` Shared interests: ${shared.map((t) => `#${t}`).join(", ")}.`
              : "";
          return {
            ...state,
            phase: "chatting",
            mode: event.mode,
            timeControl: event.timeControl ?? state.timeControl,
            sharedTags: shared,
            partnerTyping: false,
            game: null,
            chessInvite: null,
            chessInviteTimeControl: null,
            inviteCode: null,
            inviteMode: null,
            puzzleDuelInvite: null,
            puzzleDuel: null,
            friendStatus: "none",
            friendPartner: null,
            messages: [systemItem(`${baseMsg}${tagMsg}`)],
          };
        }
        case "chess_invite":
          return {
            ...state,
            chessInvite: event.from,
            chessInviteTimeControl: event.timeControl ?? DEFAULT_TIME_CONTROL,
            messages:
              event.from === "them"
                ? [
                    ...state.messages,
                    systemItem(
                      `Stranger invited you to play ${getTimeControl(event.timeControl).label} chess while chatting.`,
                    ),
                  ]
                : state.messages,
          };
        case "chess_invite_declined":
          return {
            ...state,
            chessInvite: null,
            chessInviteTimeControl: null,
            messages: [
              ...state.messages,
              systemItem("Stranger declined the chess invite."),
            ],
          };
        case "chess_game": {
          const rematch =
            state.game !== null && state.game.id !== event.game.id;
          return {
            ...state,
            chessInvite: null,
            game: fromServer(event.game),
            messages: rematch
              ? [
                  ...state.messages,
                  systemItem(
                    `Rematch started — you're playing ${event.game.color}.`,
                  ),
                ]
              : state.game === null && state.mode === "chat"
                ? [
                    ...state.messages,
                    systemItem(
                      `Chess game started — you're playing ${event.game.color}.`,
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
        case "puzzle_duel_invite":
          return {
            ...state,
            puzzleDuelInvite: event.from,
            messages:
              event.from === "them"
                ? [
                    ...state.messages,
                    systemItem("Stranger challenged you to a 90s Puzzle Duel!"),
                  ]
                : state.messages,
          };
        case "puzzle_duel_declined":
          return {
            ...state,
            puzzleDuelInvite: null,
            messages: [
              ...state.messages,
              systemItem("Stranger declined the Puzzle Duel."),
            ],
          };
        case "puzzle_duel_start": {
          const empty = {
            solved: 0,
            mistakes: 0,
            finished: false,
            finishedAt: null,
          };
          return {
            ...state,
            puzzleDuelInvite: null,
            puzzleDuel: {
              id: event.id,
              puzzleIds: event.puzzleIds,
              durationMs: event.durationMs,
              startedAt: Date.now(),
              me: empty,
              them: empty,
              winner: null,
            },
            messages: [
              ...state.messages,
              systemItem("Puzzle Duel started! Solve 3 tactics faster than Stranger."),
            ],
          };
        }
        case "puzzle_duel_state":
          if (!state.puzzleDuel || state.puzzleDuel.id !== event.id) return state;
          return {
            ...state,
            puzzleDuel: {
              ...state.puzzleDuel,
              me: event.me,
              them: event.them,
            },
          };
        case "puzzle_duel_over": {
          if (!state.puzzleDuel || state.puzzleDuel.id !== event.id) return state;
          const summary =
            event.winner === "me"
              ? `Puzzle Duel complete — You won (${event.me.solved} vs ${event.them.solved})!`
              : event.winner === "them"
                ? `Puzzle Duel complete — Stranger won (${event.them.solved} vs ${event.me.solved}).`
                : `Puzzle Duel ended in a draw (${event.me.solved}-${event.them.solved})!`;
          return {
            ...state,
            puzzleDuel: {
              ...state.puzzleDuel,
              me: event.me,
              them: event.them,
              winner: event.winner,
            },
            messages: [...state.messages, systemItem(summary)],
          };
        }
        case "partner_left":
          return {
            ...state,
            phase: "ended",
            partnerTyping: false,
            chessInvite: null,
            chessInviteTimeControl: null,
            puzzleDuelInvite: null,
            messages: [
              ...state.messages,
              systemItem("Stranger has left the chat."),
            ],
          };
        case "friend_challenge":
          return {
            ...state,
            incomingChallenge: {
              challengeId: event.challengeId,
              from: event.from,
              timeControl: event.timeControl,
            },
          };
        case "friend_challenge_sent":
        case "friend_challenge_declined":
        case "friend_challenge_failed":
          return state;
        case "friend_status": {
          const acceptedText =
            event.status === "accepted"
              ? `You and ${event.partner?.handle ?? "Stranger"} are now friends! Open Friends to message anytime.`
              : event.status === "pending_them"
                ? "Stranger wants to add you as a friend!"
                : null;
          return {
            ...state,
            friendStatus: event.status,
            friendPartner: event.partner ?? state.friendPartner,
            messages: acceptedText
              ? [...state.messages, systemItem(acceptedText)]
              : state.messages,
          };
        }
        case "safety_ack":
          return {
            ...state,
            phase: "ended",
            partnerTyping: false,
            chessInvite: null,
            chessInviteTimeControl: null,
            puzzleDuelInvite: null,
            messages: [...state.messages, systemItem(event.message)],
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

export function useStrangerchat(initialInviteCode?: string | null) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const socketRef = useRef<WebSocket | null>(null);
  const phaseRef = useRef(state.phase);
  const modeRef = useRef(state.mode);
  const timeControlRef = useRef(state.timeControl);
  const tagsRef = useRef(state.tags);
  const gameRef = useRef(state.game);
  const pendingInviteRef = useRef<string | null>(initialInviteCode ?? null);
  useEffect(() => {
    phaseRef.current = state.phase;
    modeRef.current = state.mode;
    timeControlRef.current = state.timeControl;
    tagsRef.current = state.tags;
    gameRef.current = state.game;
  }, [state.phase, state.mode, state.timeControl, state.tags, state.game]);

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
        if (pendingInviteRef.current) {
          const code = pendingInviteRef.current;
          pendingInviteRef.current = null;
          socket.send(
            JSON.stringify({ type: "join_invite", code } satisfies ClientEvent),
          );
          if (location.search.includes("invite=")) {
            window.history.replaceState({}, "", "/chat");
          }
        }
      };
      socket.onmessage = (message) => {
        const event = JSON.parse(String(message.data)) as ServerEvent;
        if (event.type === "error") {
          toast.error(event.message);
        } else if (event.type === "friend_challenge_sent") {
          toast.success(
            `Sent ${getTimeControl(event.timeControl).label} chess challenge!`,
          );
        } else if (event.type === "friend_challenge_declined") {
          toast.info(
            `${event.byHandle ?? "Your friend"} declined the chess challenge.`,
          );
        } else if (event.type === "friend_challenge_failed") {
          const msg =
            event.reason === "offline"
              ? "Your friend is offline right now."
              : event.reason === "not_friends"
                ? "You can only challenge mutual friends."
                : event.reason === "expired"
                  ? "That challenge expired."
                  : "Unable to send chess challenge.";
          toast.info(msg);
        } else if (event.type === "matched") {
          dispatch({ type: "clearChallenge" });
        } else if (event.type === "invite_failed") {
          toast.info(
            event.reason === "self"
              ? "That is your own invite link — share it with someone else!"
              : event.reason === "blocked"
                ? "Unable to join this invite link."
                : "That invite link expired or was already used.",
          );
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
              tags: tagsRef.current,
              timeControl: timeControlRef.current,
            } satisfies ClientEvent),
          );
        } else if (event.type === "safety_ack") {
          toast.success(event.message);
        }
        dispatch({ type: "server", event });
      };
      socket.onclose = (event) => {
        // A socket we already replaced has nothing more to tell us.
        if (socketRef.current !== socket) return;
        socketRef.current = null;
        if (event.code === CloseCode.Unauthorized) {
          const target = encodeURIComponent(location.pathname + location.search);
          window.location.href = `/login?callbackUrl=${target}`;
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
    (
      mode: ChatMode = modeRef.current,
      tags: string[] = tagsRef.current,
      timeControl: TimeControlId = timeControlRef.current,
    ) => {
      stopTyping();
      if (send({ type: "find", mode, tags, timeControl })) {
        modeRef.current = mode;
        tagsRef.current = tags;
        timeControlRef.current = timeControl;
        dispatch({ type: "find", mode, tags, timeControl });
        captureEvent("match_search_started", {
          mode,
          time_control: mode === "chess" ? timeControl : null,
          tags_count: tags.length,
        });
      }
    },
    [send, stopTyping],
  );

  const setTags = useCallback((tags: string[]) => {
    tagsRef.current = tags;
    dispatch({ type: "setTags", tags });
  }, []);

  const setTimeControl = useCallback((timeControl: TimeControlId) => {
    timeControlRef.current = timeControl;
    dispatch({ type: "setTimeControl", timeControl });
  }, []);

  const createInvite = useCallback(
    (
      mode: ChatMode = "chess",
      timeControl: TimeControlId = timeControlRef.current,
    ) => {
      stopTyping();
      send({ type: "create_invite", mode, timeControl });
    },
    [send, stopTyping],
  );

  const joinInvite = useCallback(
    (code: string) => {
      stopTyping();
      send({ type: "join_invite", code });
    },
    [send, stopTyping],
  );

  const inviteToChess = useCallback(
    (timeControl: TimeControlId = timeControlRef.current) => {
      if (send({ type: "chess_invite", timeControl })) {
        captureEvent("chess_invite_sent", { time_control: timeControl });
      }
    },
    [send],
  );

  const respondChessInvite = useCallback(
    (accept: boolean) => {
      if (send({ type: "chess_invite_response", accept })) {
        captureEvent("chess_invite_responded", { accepted: accept });
      }
    },
    [send],
  );

  const invitePuzzleDuel = useCallback(() => {
    if (send({ type: "puzzle_duel_invite" })) {
      captureEvent("puzzle_duel_invited");
    }
  }, [send]);

  const respondPuzzleDuel = useCallback(
    (accept: boolean) => {
      if (send({ type: "puzzle_duel_response", accept })) {
        captureEvent("puzzle_duel_responded", { accepted: accept });
      }
    },
    [send],
  );

  const reportPuzzleDuelProgress = useCallback(
    (duelId: string, solved: number, mistakes: number, finished: boolean) => {
      send({
        type: "puzzle_duel_progress",
        duelId,
        solved,
        mistakes,
        finished,
      });
    },
    [send],
  );

  const dismissPuzzleDuel = useCallback(
    () => dispatch({ type: "dismissPuzzleDuel" }),
    [],
  );

  const sendFriendRequest = useCallback(() => {
    if (send({ type: "friend_request" })) {
      captureEvent("friend_action_clicked");
    }
  }, [send]);

  const safetyAction = useCallback(
    (action: "block" | "report", reason?: string) => {
      stopTyping();
      if (send({ type: "safety_action", action, reason })) {
        captureEvent("safety_action_submitted", { action });
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

  const challengeFriend = useCallback(
    (friendId: string, timeControl: TimeControlId = timeControlRef.current) => {
      if (send({ type: "friend_challenge", friendId, timeControl })) {
        captureEvent("friend_challenge_sent", { time_control: timeControl });
      }
    },
    [send],
  );

  const respondFriendChallenge = useCallback(
    (challengeId: string, accept: boolean) => {
      dispatch({ type: "clearChallenge" });
      if (
        send({
          type: "friend_challenge_response",
          challengeId,
          accept,
        })
      ) {
        captureEvent("friend_challenge_responded", { accepted: accept });
      }
    },
    [send],
  );

  return {
    ...state,
    findStranger,
    setTags,
    setTimeControl,
    createInvite,
    joinInvite,
    leave,
    sendMessage,
    notifyTyping,
    inviteToChess,
    respondChessInvite,
    invitePuzzleDuel,
    respondPuzzleDuel,
    reportPuzzleDuelProgress,
    dismissPuzzleDuel,
    playMove,
    resign,
    offer,
    claimFlag,
    sendFriendRequest,
    challengeFriend,
    respondFriendChallenge,
    safetyAction,
  };
}
