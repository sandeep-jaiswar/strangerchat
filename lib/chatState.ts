import type { WebSocket } from "ws"

export type User = {
  id: string
  name: string | null
  email: string | null
  image: string | null
}

export type ChatSession = {
  id: string
  user1Id: string
  user2Id: string
  startedAt: Date
}

export type FriendRequest = {
  id: string
  fromUserId: string
  toUserId: string
  status: "pending" | "accepted" | "rejected"
  createdAt: Date
}

export type Message = {
  id: string
  sessionId: string
  senderId: string
  content: string
  timestamp: Date
}

/**
 * In-memory state management for the chat application.
 * All state is lost on server restart.
 */
class ChatState {
  // Maps userId to WebSocket connection
  private userSockets = new Map<string, WebSocket>()
  
  // Maps socketId to userId (for reverse lookup)
  private socketUsers = new Map<WebSocket, string>()
  
  // Set of users currently available for random matching
  private availableUsers = new Set<string>()
  
  // Active chat sessions (userId1 + userId2)
  private activeSessions = new Map<string, ChatSession>()
  
  // Maps userId to their active session ID
  private userSessions = new Map<string, string>()
  
  // Friend requests
  private friendRequests = new Map<string, FriendRequest>()
  
  // Friend lists (userId -> Set of friend userIds)
  private friendLists = new Map<string, Set<string>>()
  
  // Online users (for presence)
  private onlineUsers = new Set<string>()

  // User info cache
  private users = new Map<string, User>()

  // Register a user connection
  registerUser(userId: string, user: User, socket: WebSocket): void {
    this.userSockets.set(userId, socket)
    this.socketUsers.set(socket, userId)
    this.onlineUsers.add(userId)
    this.users.set(userId, user)
  }

  // Unregister a user (on disconnect)
  unregisterUser(socket: WebSocket): void {
    const userId = this.socketUsers.get(socket)
    if (userId) {
      this.userSockets.delete(userId)
      this.socketUsers.delete(socket)
      this.onlineUsers.delete(userId)
      this.availableUsers.delete(userId)
      
      // End active session if any
      const sessionId = this.userSessions.get(userId)
      if (sessionId) {
        this.endSession(sessionId)
      }
    }
  }

  // Mark user as available for matching
  markAvailable(userId: string): void {
    // Don't mark as available if already in a session
    if (!this.userSessions.has(userId)) {
      this.availableUsers.add(userId)
    }
  }

  // Mark user as unavailable
  markUnavailable(userId: string): void {
    this.availableUsers.delete(userId)
  }

  // Get a random available user (excluding the requesting user)
  getRandomAvailableUser(excludeUserId: string): string | null {
    const available = Array.from(this.availableUsers).filter((id) => id !== excludeUserId)
    if (available.length === 0) return null
    const randomUser = available[Math.floor(Math.random() * available.length)]
    return randomUser || null
  }

  // Create a chat session
  createSession(user1Id: string, user2Id: string): ChatSession {
    const sessionId = `${Date.now()}-${user1Id}-${user2Id}`
    const session: ChatSession = {
      id: sessionId,
      user1Id,
      user2Id,
      startedAt: new Date(),
    }
    
    this.activeSessions.set(sessionId, session)
    this.userSessions.set(user1Id, sessionId)
    this.userSessions.set(user2Id, sessionId)
    this.markUnavailable(user1Id)
    this.markUnavailable(user2Id)
    
    return session
  }

  // End a session
  endSession(sessionId: string): void {
    const session = this.activeSessions.get(sessionId)
    if (session) {
      this.userSessions.delete(session.user1Id)
      this.userSessions.delete(session.user2Id)
      this.activeSessions.delete(sessionId)
    }
  }

  // Get session for a user
  getUserSession(userId: string): ChatSession | null {
    const sessionId = this.userSessions.get(userId)
    if (!sessionId) return null
    return this.activeSessions.get(sessionId) || null
  }

  // Get socket for a user
  getUserSocket(userId: string): WebSocket | null {
    return this.userSockets.get(userId) || null
  }

  // Get user for a socket
  getSocketUser(socket: WebSocket): string | null {
    return this.socketUsers.get(socket) || null
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId)
  }

  // Get online users count
  getOnlineCount(): number {
    return this.onlineUsers.size
  }

  // Get available users count
  getAvailableCount(): number {
    return this.availableUsers.size
  }

  // Get user info
  getUser(userId: string): User | null {
    return this.users.get(userId) || null
  }

  // Friend request management
  createFriendRequest(fromUserId: string, toUserId: string): FriendRequest {
    const requestId = `${Date.now()}-${fromUserId}-${toUserId}`
    const request: FriendRequest = {
      id: requestId,
      fromUserId,
      toUserId,
      status: "pending",
      createdAt: new Date(),
    }
    this.friendRequests.set(requestId, request)
    return request
  }

  // Get pending friend requests for a user
  getPendingFriendRequests(userId: string): FriendRequest[] {
    return Array.from(this.friendRequests.values()).filter(
      (req) => req.toUserId === userId && req.status === "pending"
    )
  }

  // Accept friend request
  acceptFriendRequest(requestId: string): boolean {
    const request = this.friendRequests.get(requestId)
    if (!request || request.status !== "pending") return false

    request.status = "accepted"
    
    // Add to friend lists
    if (!this.friendLists.has(request.fromUserId)) {
      this.friendLists.set(request.fromUserId, new Set())
    }
    if (!this.friendLists.has(request.toUserId)) {
      this.friendLists.set(request.toUserId, new Set())
    }
    
    this.friendLists.get(request.fromUserId)!.add(request.toUserId)
    this.friendLists.get(request.toUserId)!.add(request.fromUserId)
    
    return true
  }

  // Reject friend request
  rejectFriendRequest(requestId: string): boolean {
    const request = this.friendRequests.get(requestId)
    if (!request || request.status !== "pending") return false

    request.status = "rejected"
    return true
  }

  // Get friends list
  getFriends(userId: string): User[] {
    const friendIds = this.friendLists.get(userId) || new Set()
    return Array.from(friendIds)
      .map((id) => this.users.get(id))
      .filter((user): user is User => user !== undefined)
  }

  // Check if users are friends
  areFriends(user1Id: string, user2Id: string): boolean {
    const friends = this.friendLists.get(user1Id)
    return friends ? friends.has(user2Id) : false
  }

  // Get all online users (for admin/debug)
  getOnlineUsers(): User[] {
    return Array.from(this.onlineUsers)
      .map((id) => this.users.get(id))
      .filter((user): user is User => user !== undefined)
  }
}

// Singleton instance
export const chatState = new ChatState()
