import { useState, useEffect, useRef, useCallback } from "react"
import type { User } from "@/lib/chatState"

export type ChatMessage = {
    id: string
    content: string
    senderId: string
    timestamp: string
    isMine?: boolean
}

type ChatState = "connecting" | "idle" | "matching" | "chatting"

export function useChatWebSocket(user: User) {
    const [socket, setSocket] = useState<WebSocket | null>(null)
    const [state, setState] = useState<ChatState>("connecting")
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [partner, setPartner] = useState<User | null>(null)
    const [partnerIsTyping, setPartnerIsTyping] = useState(false)
    const [onlineCount, setOnlineCount] = useState(0)

    const socketRef = useRef<WebSocket | null>(null)
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const connect = useCallback(() => {
        if (socketRef.current?.readyState === WebSocket.OPEN) return

        setState("connecting")
        // Use relative path for Next.js API route proxying or full URL if outside
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
        const wsUrl = `${protocol}//${window.location.host}/api/ws`

        const ws = new WebSocket(wsUrl)
        socketRef.current = ws

        ws.onopen = () => {
            ws.send(JSON.stringify({ type: "register", userId: user.id, user }))
            setState("idle")
            setSocket(ws)
        }

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)

                switch (data.type) {
                    case "registered":
                        setOnlineCount(data.onlineCount || 0)
                        break
                    case "waiting":
                        setState("matching")
                        break
                    case "match_found":
                        setPartner(data.partner)
                        setState("chatting")
                        setMessages([])
                        break
                    case "message":
                        setMessages((prev) => [...prev, { ...data, id: Date.now().toString(), isMine: false }])
                        break
                    case "message_sent":
                        setMessages((prev) => [...prev, { ...data, id: Date.now().toString(), isMine: true }])
                        break
                    case "partner_typing":
                        setPartnerIsTyping(data.isTyping)
                        break
                    case "partner_disconnected":
                    case "session_ended":
                        setState("idle")
                        setPartner(null)
                        setPartnerIsTyping(false)
                        // Auto re-find match after partner disconnected? For now just go idle
                        break
                    case "error":
                        console.error("WS Error:", data.message)
                        break
                }
            } catch (e) {
                console.error("Failed to parse message:", e)
            }
        }

        ws.onclose = () => {
            setSocket(null)
            setState("connecting")
            socketRef.current = null
            // Reconnect after delay
            setTimeout(connect, 3000)
        }

        ws.onerror = (error) => {
            console.error("WebSocket error:", error)
        }
    }, [user])

    useEffect(() => {
        connect()
        return () => {
            if (socketRef.current) {
                socketRef.current.close()
            }
        }
    }, [connect])

    const findMatch = useCallback(() => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            setState("matching")
            socketRef.current.send(JSON.stringify({ type: "find_match" }))
        }
    }, [])

    const sendMessage = useCallback((content: string) => {
        if (socketRef.current?.readyState === WebSocket.OPEN && content.trim()) {
            socketRef.current.send(JSON.stringify({ type: "send_message", content }))
        }
    }, [])

    const sendTyping = useCallback((isTyping: boolean) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type: "typing", isTyping }))
        }
    }, [])

    const handleTyping = useCallback(() => {
        sendTyping(true)
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
        }
        typingTimeoutRef.current = setTimeout(() => {
            sendTyping(false)
        }, 2000)
    }, [sendTyping])

    const endSession = useCallback(() => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type: "end_session" }))
        }
    }, [])

    return {
        state,
        messages,
        partner,
        partnerIsTyping,
        onlineCount,
        findMatch,
        sendMessage,
        handleTyping,
        endSession,
    }
}
