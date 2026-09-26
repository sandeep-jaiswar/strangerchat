"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { toast } from "sonner";
import type { ClientEvent, ServerEvent } from "@repo/protocol";

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
      // Losing the socket also loses the partner, so drop back to the lobby.
      return action.status === "reconnecting" && state.phase !== "idle"
        ? {
            ...state,
            connection: action.status,
            phase: state.phase === "chatting" ? "ended" : "idle",
            partnerTyping: false,
            messages:
              state.phase === "chatting"
                ? [...state.messages, systemItem("Connection lost.")]
                : state.messages,
          }
        : { ...state, connection: action.status };
    case "sent":
      return { ...state, messages: [...state.messages, action.item] };
    case "partnerTypingTimeout":
      return { ...state, partnerTyping: false };
    case "left":
      return { ...state, phase: "idle", partnerTyping: false };
    case "server": {
      const event = action.event;
      switch (event.type) {
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

    const scheduleReconnect = () => {
      if (disposed) return;
      dispatch({ type: "connection", status: "reconnecting" });
      const delay = Math.min(1000 * 2 ** attempt, MAX_RECONNECT_DELAY_MS);
      attempt++;
      retryTimer = setTimeout(connect, delay);
    };

    async function connect() {
      let token: string;
      try {
        const res = await fetch("/api/realtime-token", { cache: "no-store" });
        if (res.status === 401) {
          window.location.href = "/login?callbackUrl=/chat";
          return;
        }
        if (!res.ok) throw new Error(`Token request failed: ${res.status}`);
        ({ token } = (await res.json()) as { token: string });
      } catch {
        scheduleReconnect();
        return;
      }
      if (disposed) return;

      const url = new URL(
        process.env.NEXT_PUBLIC_REALTIME_URL ?? "ws://localhost:4000",
      );
      url.searchParams.set("token", token);
      const socket = new WebSocket(url);
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
        }
        dispatch({ type: "server", event });
      };
      socket.onclose = () => {
        if (socketRef.current === socket) socketRef.current = null;
        scheduleReconnect();
      };
    }

    void connect();

    return () => {
      disposed = true;
      clearTimeout(retryTimer);
      clearTimeout(typingIdleTimer.current);
      clearTimeout(partnerTypingTimer.current);
      socketRef.current?.close();
      socketRef.current = null;
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
