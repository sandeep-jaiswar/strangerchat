"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useSession } from "next-auth/react"

export type WSMessage = {
  type: string
  [key: string]: unknown
}

export type ChatPartner = {
  id: string
  name: string | null
  email: string | null
  image: string | null
}

export type ChatMessage = {
  content: string
  senderId: string
  timestamp: string
  isOwn?: boolean
}

export type Friend = {
  id: string
  name: string | null
  email: string | null
  image: string | null
}

export type FriendRequestType = {
  id: string
  fromUserId: string
  toUserId: string
  from?: Friend
}

export function useWebSocket() {
  const { data: session } = useSession()
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [partner, setPartner] = useState<ChatPartner | null>(null)
  const [isMatching, setIsMatching] = useState(false)
  const [isPartnerTyping, setIsPartnerTyping] = useState(false)
  const [onlineCount, setOnlineCount] = useState(0)
  const [availableCount, setAvailableCount] = useState(0)
  const [friends, setFriends] = useState<Friend[]>([])
  const [friendRequests, setFriendRequests] = useState<FriendRequestType[]>([])

  const ws = useRef<WebSocket | null>(null)
  const reconnectTimeout = useRef<NodeJS.Timeout | undefined>(undefined)

  const connect = useCallback(() => {
    if (!session?.user?.id || ws.current?.readyState === WebSocket.OPEN) {
      return
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
    const wsUrl = `${protocol}//${window.location.host}/api/ws`
    
    ws.current = new WebSocket(wsUrl)

    ws.current.onopen = () => {
      console.log("WebSocket connected")
      setIsConnected(true)
      
      // Register user
      if (session?.user?.id) {
        ws.current?.send(
          JSON.stringify({
            type: "register",
            userId: session.user.id,
            user: {
              id: session.user.id,
              name: session.user.name,
              email: session.user.email,
              image: session.user.image,
            },
          })
        )
      }
    }

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WSMessage
        handleMessage(data)
      } catch (error) {
        console.error("Error parsing message:", error)
      }
    }

    ws.current.onclose = () => {
      console.log("WebSocket disconnected")
      setIsConnected(false)
      
      // Attempt to reconnect after 3 seconds
      reconnectTimeout.current = setTimeout(() => {
        if (session?.user?.id) {
          connect()
        }
      }, 3000)
    }

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error)
    }
  }, [session?.user])

  const handleMessage = (data: WSMessage) => {
    switch (data.type) {
      case "registered":
        setOnlineCount(data.onlineCount as number)
        setAvailableCount(data.availableCount as number)
        break
      case "waiting":
        setIsMatching(true)
        break
      case "match_found":
        setPartner(data.partner as ChatPartner)
        setMessages([])
        setIsMatching(false)
        break
      case "message":
        setMessages((prev) => [
          ...prev,
          {
            content: data.content as string,
            senderId: data.senderId as string,
            timestamp: data.timestamp as string,
            isOwn: false,
          },
        ])
        break
      case "message_sent":
        setMessages((prev) => [
          ...prev,
          {
            content: data.content as string,
            senderId: data.senderId as string,
            timestamp: data.timestamp as string,
            isOwn: true,
          },
        ])
        break
      case "partner_typing":
        setIsPartnerTyping(data.isTyping as boolean)
        break
      case "partner_disconnected":
      case "session_ended":
        setPartner(null)
        setIsMatching(false)
        break
      case "error":
        console.error("WebSocket error:", data.message)
        break
      case "friends_list":
        setFriends(data.friends as Friend[])
        break
      case "friend_requests":
        setFriendRequests(data.requests as FriendRequestType[])
        break
      case "friend_request_received":
        setFriendRequests((prev) => [...prev, data.request as FriendRequestType])
        break
      case "friend_request_sent":
        // Acknowledge friend request sent
        break
      case "friend_request_accepted":
        setFriendRequests((prev) => prev.filter((r) => r.id !== data.requestId))
        // Refresh friends list
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({ type: "get_friends" }))
        }
        break
      case "friend_request_rejected":
        setFriendRequests((prev) => prev.filter((r) => r.id !== data.requestId))
        break
    }
  }

  const findMatch = useCallback(() => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket not connected")
      return
    }

    setIsMatching(true)
    ws.current.send(JSON.stringify({ type: "find_match" }))
  }, [])

  const sendMessage = useCallback((content: string) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket not connected")
      return
    }

    ws.current.send(JSON.stringify({ type: "send_message", content }))
  }, [])

  const sendTyping = useCallback((isTyping: boolean) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      return
    }

    ws.current.send(JSON.stringify({ type: "typing", isTyping }))
  }, [])

  const endSession = useCallback(() => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      return
    }

    ws.current.send(JSON.stringify({ type: "end_session" }))
    setPartner(null)
    setMessages([])
    setIsMatching(false)
  }, [])

  const sendFriendRequest = useCallback((toUserId: string) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      return
    }

    ws.current.send(JSON.stringify({ type: "send_friend_request", toUserId }))
  }, [])

  const acceptFriendRequest = useCallback((requestId: string) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      return
    }

    ws.current.send(JSON.stringify({ type: "accept_friend_request", requestId }))
  }, [])

  const rejectFriendRequest = useCallback((requestId: string) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      return
    }

    ws.current.send(JSON.stringify({ type: "reject_friend_request", requestId }))
  }, [])

  const loadFriends = useCallback(() => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      return
    }

    ws.current.send(JSON.stringify({ type: "get_friends" }))
  }, [])

  const loadFriendRequests = useCallback(() => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      return
    }

    ws.current.send(JSON.stringify({ type: "get_friend_requests" }))
  }, [])

  useEffect(() => {
    if (session?.user?.id) {
      connect()
    }

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current)
      }
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [connect, session?.user?.id])

  // Load friends and requests when connected
  useEffect(() => {
    if (isConnected) {
      loadFriends()
      loadFriendRequests()
    }
  }, [isConnected, loadFriends, loadFriendRequests])

  return {
    isConnected,
    messages,
    partner,
    isMatching,
    isPartnerTyping,
    onlineCount,
    availableCount,
    friends,
    friendRequests,
    findMatch,
    sendMessage,
    sendTyping,
    endSession,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    loadFriends,
    loadFriendRequests,
  }
}
