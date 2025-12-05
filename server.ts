import { createServer } from "http"
import { parse } from "url"
import next from "next"
import { WebSocketServer, WebSocket } from "ws"
import { chatState } from "./lib/chatState"

const dev = process.env.NODE_ENV !== "production"
const hostname = process.env.HOSTNAME || "localhost"
const port = parseInt(process.env.PORT || "3000", 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

type WSMessage = {
  type: string
  [key: string]: unknown
}

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error("Error occurred handling", req.url, err)
      res.statusCode = 500
      res.end("internal server error")
    }
  })

  // Create WebSocket server
  const wss = new WebSocketServer({ server, path: "/api/ws" })

  wss.on("connection", (ws: WebSocket, req) => {
    console.log("WebSocket client connected")

    // Handle messages from client
    ws.on("message", (data: Buffer) => {
      try {
        const message: WSMessage = JSON.parse(data.toString())
        handleMessage(ws, message)
      } catch (error) {
        console.error("Error parsing message:", error)
        ws.send(JSON.stringify({ type: "error", message: "Invalid message format" }))
      }
    })

    // Handle client disconnect
    ws.on("close", () => {
      const userId = chatState.getSocketUser(ws)
      console.log("WebSocket client disconnected", userId)
      
      // Notify partner if in a session
      const session = userId ? chatState.getUserSession(userId) : null
      if (session) {
        const partnerId = session.user1Id === userId ? session.user2Id : session.user1Id
        const partnerSocket = chatState.getUserSocket(partnerId)
        if (partnerSocket) {
          partnerSocket.send(JSON.stringify({ type: "partner_disconnected" }))
        }
        chatState.endSession(session.id)
      }
      
      chatState.unregisterUser(ws)
    })

    ws.on("error", console.error)
  })

  function handleMessage(ws: WebSocket, message: WSMessage) {
    const { type } = message

    switch (type) {
      case "register":
        handleRegister(ws, message)
        break
      case "find_match":
        handleFindMatch(ws)
        break
      case "send_message":
        handleSendMessage(ws, message)
        break
      case "typing":
        handleTyping(ws, message)
        break
      case "end_session":
        handleEndSession(ws)
        break
      case "send_friend_request":
        handleSendFriendRequest(ws, message)
        break
      case "accept_friend_request":
        handleAcceptFriendRequest(ws, message)
        break
      case "reject_friend_request":
        handleRejectFriendRequest(ws, message)
        break
      case "get_friends":
        handleGetFriends(ws)
        break
      case "get_friend_requests":
        handleGetFriendRequests(ws)
        break
      default:
        ws.send(JSON.stringify({ type: "error", message: "Unknown message type" }))
    }
  }

  function handleRegister(ws: WebSocket, message: WSMessage) {
    const { userId, user } = message
    if (!userId || !user) {
      ws.send(JSON.stringify({ type: "error", message: "Missing userId or user info" }))
      return
    }

    chatState.registerUser(userId as string, user as any, ws)
    ws.send(
      JSON.stringify({
        type: "registered",
        onlineCount: chatState.getOnlineCount(),
        availableCount: chatState.getAvailableCount(),
      })
    )
  }

  function handleFindMatch(ws: WebSocket) {
    const userId = chatState.getSocketUser(ws)
    if (!userId) {
      ws.send(JSON.stringify({ type: "error", message: "Not registered" }))
      return
    }

    // Check if already in a session
    const existingSession = chatState.getUserSession(userId)
    if (existingSession) {
      ws.send(JSON.stringify({ type: "error", message: "Already in a session" }))
      return
    }

    // Mark as available
    chatState.markAvailable(userId)

    // Try to find a match
    const partnerId = chatState.getRandomAvailableUser(userId)
    if (partnerId) {
      // Create session
      const session = chatState.createSession(userId, partnerId)
      const user1 = chatState.getUser(userId)
      const user2 = chatState.getUser(partnerId)

      // Notify both users
      const partnerSocket = chatState.getUserSocket(partnerId)
      if (partnerSocket) {
        partnerSocket.send(
          JSON.stringify({
            type: "match_found",
            sessionId: session.id,
            partner: user1,
          })
        )
      }

      ws.send(
        JSON.stringify({
          type: "match_found",
          sessionId: session.id,
          partner: user2,
        })
      )
    } else {
      // No match available yet, waiting
      ws.send(JSON.stringify({ type: "waiting", message: "Looking for a match..." }))
    }
  }

  function handleSendMessage(ws: WebSocket, message: WSMessage) {
    const userId = chatState.getSocketUser(ws)
    if (!userId) {
      ws.send(JSON.stringify({ type: "error", message: "Not registered" }))
      return
    }

    const session = chatState.getUserSession(userId)
    if (!session) {
      ws.send(JSON.stringify({ type: "error", message: "Not in a session" }))
      return
    }

    const { content } = message
    const partnerId = session.user1Id === userId ? session.user2Id : session.user1Id
    const partnerSocket = chatState.getUserSocket(partnerId)

    const msg = {
      type: "message",
      content,
      senderId: userId,
      timestamp: new Date().toISOString(),
    }

    // Send to partner
    if (partnerSocket) {
      partnerSocket.send(JSON.stringify(msg))
    }

    // Echo back to sender for confirmation
    ws.send(JSON.stringify({ ...msg, type: "message_sent" }))
  }

  function handleTyping(ws: WebSocket, message: WSMessage) {
    const userId = chatState.getSocketUser(ws)
    if (!userId) return

    const session = chatState.getUserSession(userId)
    if (!session) return

    const { isTyping } = message
    const partnerId = session.user1Id === userId ? session.user2Id : session.user1Id
    const partnerSocket = chatState.getUserSocket(partnerId)

    if (partnerSocket) {
      partnerSocket.send(JSON.stringify({ type: "partner_typing", isTyping }))
    }
  }

  function handleEndSession(ws: WebSocket) {
    const userId = chatState.getSocketUser(ws)
    if (!userId) return

    const session = chatState.getUserSession(userId)
    if (!session) return

    const partnerId = session.user1Id === userId ? session.user2Id : session.user1Id
    const partnerSocket = chatState.getUserSocket(partnerId)

    if (partnerSocket) {
      partnerSocket.send(JSON.stringify({ type: "session_ended" }))
    }

    chatState.endSession(session.id)
    ws.send(JSON.stringify({ type: "session_ended" }))
  }

  function handleSendFriendRequest(ws: WebSocket, message: WSMessage) {
    const userId = chatState.getSocketUser(ws)
    if (!userId) {
      ws.send(JSON.stringify({ type: "error", message: "Not registered" }))
      return
    }

    const { toUserId } = message
    if (!toUserId) {
      ws.send(JSON.stringify({ type: "error", message: "Missing toUserId" }))
      return
    }

    const request = chatState.createFriendRequest(userId, toUserId as string)
    ws.send(JSON.stringify({ type: "friend_request_sent", request }))

    // Notify the recipient if online
    const recipientSocket = chatState.getUserSocket(toUserId as string)
    if (recipientSocket) {
      const sender = chatState.getUser(userId)
      recipientSocket.send(
        JSON.stringify({
          type: "friend_request_received",
          request: { ...request, from: sender },
        })
      )
    }
  }

  function handleAcceptFriendRequest(ws: WebSocket, message: WSMessage) {
    const userId = chatState.getSocketUser(ws)
    if (!userId) return

    const { requestId } = message
    if (!requestId) {
      ws.send(JSON.stringify({ type: "error", message: "Missing requestId" }))
      return
    }

    const success = chatState.acceptFriendRequest(requestId as string)
    if (success) {
      ws.send(JSON.stringify({ type: "friend_request_accepted", requestId }))
      // TODO: Notify the requester
    } else {
      ws.send(JSON.stringify({ type: "error", message: "Failed to accept request" }))
    }
  }

  function handleRejectFriendRequest(ws: WebSocket, message: WSMessage) {
    const userId = chatState.getSocketUser(ws)
    if (!userId) return

    const { requestId } = message
    if (!requestId) {
      ws.send(JSON.stringify({ type: "error", message: "Missing requestId" }))
      return
    }

    const success = chatState.rejectFriendRequest(requestId as string)
    if (success) {
      ws.send(JSON.stringify({ type: "friend_request_rejected", requestId }))
    } else {
      ws.send(JSON.stringify({ type: "error", message: "Failed to reject request" }))
    }
  }

  function handleGetFriends(ws: WebSocket) {
    const userId = chatState.getSocketUser(ws)
    if (!userId) return

    const friends = chatState.getFriends(userId)
    ws.send(JSON.stringify({ type: "friends_list", friends }))
  }

  function handleGetFriendRequests(ws: WebSocket) {
    const userId = chatState.getSocketUser(ws)
    if (!userId) return

    const requests = chatState.getPendingFriendRequests(userId)
    ws.send(JSON.stringify({ type: "friend_requests", requests }))
  }

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log(`> WebSocket server ready on ws://${hostname}:${port}/api/ws`)
  })
})
