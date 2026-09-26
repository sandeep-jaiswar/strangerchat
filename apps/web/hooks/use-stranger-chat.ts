"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { toast } from "sonner";
import {
  CHAT_SOCKET_PATH,
  CloseCode,
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

interface State {
  connection: ConnectionStatus;
  phase: ChatPhase;
  online: number;
  messages: ChatItem[];
  partnerTyping: boolean;
}

type Action =
  | { type: "connection"; status: ConnectionStatus }
  | { type: "server"; event: ServerEvent }
  | { type: "sent"; item: ChatItem }
  | { type: "partnerTypingTimeout" }
  | { type: "left" };

const initialState: State = {
  connection: "connecting",
  phase: "idle",
  online: 0,
  messages: [],
  partnerTyping: false,
};

function systemItem(text: string): ChatItem {
  return { id: crypto.randomUUID(), from: "system", text, sentAt: Date.now() };
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
          return { ...state, phase: "searching", messages: [] };
        case "matched":
          return {
            ...state,
            phase: "chatting",
            partnerTyping: false,
            messages: [
              systemItem("You're now chatting with a random stranger. Say hi!"),
            ],
          };
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

export function useStrangerChat() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const socketRef = useRef<WebSocket | null>(null);
  const phaseRef = useRef(state.phase);
  useEffect(() => {
    phaseRef.current = state.phase;
  }, [state.phase]);

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
          socket.send(JSON.stringify({ type: "find" } satisfies ClientEvent));
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

  /** Start searching, or skip the current partner and search again. */
  const findStranger = useCallback(() => {
    stopTyping();
    send({ type: "find" });
  }, [send, stopTyping]);

  const leave = useCallback(() => {
    stopTyping();
    if (send({ type: "leave" })) dispatch({ type: "left" });
  }, [send, stopTyping]);

  return { ...state, findStranger, leave, sendMessage, notifyTyping };
}
