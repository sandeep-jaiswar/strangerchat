import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { WebSocket } from "ws"
import { chatState } from "./chatState"
import type { User } from "./chatState"

// Mock WebSocket for testing
class MockWebSocket {
  readyState = 1
  send = vi.fn()
  close = vi.fn()
}

describe("ChatState", () => {
  let mockWs1: MockWebSocket
  let mockWs2: MockWebSocket
  let mockWs3: MockWebSocket
  let user1: User
  let user2: User
  let _user3: User

  beforeEach(() => {
    // Create fresh mocks and users for each test
    mockWs1 = new MockWebSocket()
    mockWs2 = new MockWebSocket()
    mockWs3 = new MockWebSocket()
    
    user1 = {
      id: `user1-${Date.now()}-${Math.random()}`,
      name: "Test User 1",
      email: "user1@test.com",
      image: null,
    }
    
    user2 = {
      id: `user2-${Date.now()}-${Math.random()}`,
      name: "Test User 2",
      email: "user2@test.com",
      image: null,
    }
    
    _user3 = {
      id: `user3-${Date.now()}-${Math.random()}`,
      name: "Test User 3",
      email: "user3@test.com",
      image: null,
    }
  })

  afterEach(() => {
    // Clean up registered users after each test
    chatState.unregisterUser(mockWs1 as unknown as WebSocket)
    chatState.unregisterUser(mockWs2 as unknown as WebSocket)
    chatState.unregisterUser(mockWs3 as unknown as WebSocket)
  })

  describe("User Registration", () => {
    it("should register a user with socket", () => {
      chatState.registerUser(user1.id, user1, mockWs1 as unknown as WebSocket)
      
      expect(chatState.isUserOnline(user1.id)).toBe(true)
      expect(chatState.getUser(user1.id)).toEqual(user1)
      expect(chatState.getUserSocket(user1.id)).toBe(mockWs1)
      expect(chatState.getSocketUser(mockWs1 as unknown as WebSocket)).toBe(user1.id)
    })

    it("should track online users count", () => {
      const initialCount = chatState.getOnlineCount()
      
      chatState.registerUser(user1.id, user1, mockWs1 as unknown as WebSocket)
      expect(chatState.getOnlineCount()).toBe(initialCount + 1)
      
      chatState.registerUser(user2.id, user2, mockWs2 as unknown as WebSocket)
      expect(chatState.getOnlineCount()).toBe(initialCount + 2)
    })
  })

  describe("User Unregistration", () => {
    it("should unregister a user on disconnect", () => {
      chatState.registerUser(user1.id, user1, mockWs1 as unknown as WebSocket)
      expect(chatState.isUserOnline(user1.id)).toBe(true)
      
      chatState.unregisterUser(mockWs1 as unknown as WebSocket)
      expect(chatState.isUserOnline(user1.id)).toBe(false)
      expect(chatState.getUserSocket(user1.id)).toBe(null)
    })
  })

  describe("Matching Logic", () => {
    it("should mark user as available", () => {
      chatState.registerUser(user1.id, user1, mockWs1 as unknown as WebSocket)
      
      const initialAvailable = chatState.getAvailableCount()
      chatState.markAvailable(user1.id)
      expect(chatState.getAvailableCount()).toBe(initialAvailable + 1)
    })

    it("should mark user as unavailable", () => {
      chatState.registerUser(user1.id, user1, mockWs1 as unknown as WebSocket)
      chatState.markAvailable(user1.id)
      
      const availableCount = chatState.getAvailableCount()
      chatState.markUnavailable(user1.id)
      expect(chatState.getAvailableCount()).toBe(availableCount - 1)
    })

    it("should get random available user excluding requester", () => {
      chatState.registerUser(user1.id, user1, mockWs1 as unknown as WebSocket)
      chatState.registerUser(user2.id, user2, mockWs2 as unknown as WebSocket)
      
      chatState.markAvailable(user1.id)
      chatState.markAvailable(user2.id)
      
      const match = chatState.getRandomAvailableUser(user1.id)
      expect(match).toBe(user2.id)
    })

    it("should return null when no available users except requester", () => {
      chatState.registerUser(user1.id, user1, mockWs1 as unknown as WebSocket)
      chatState.markAvailable(user1.id)
      
      const match = chatState.getRandomAvailableUser(user1.id)
      expect(match).toBe(null)
    })
  })

  describe("Chat Sessions", () => {
    it("should create a chat session", () => {
      chatState.registerUser(user1.id, user1, mockWs1 as unknown as WebSocket)
      chatState.registerUser(user2.id, user2, mockWs2 as unknown as WebSocket)
      
      const session = chatState.createSession(user1.id, user2.id)
      
      expect(session.user1Id).toBe(user1.id)
      expect(session.user2Id).toBe(user2.id)
      expect(session.id).toBeDefined()
      expect(session.startedAt).toBeInstanceOf(Date)
    })

    it("should mark users as unavailable when session created", () => {
      chatState.registerUser(user1.id, user1, mockWs1 as unknown as WebSocket)
      chatState.registerUser(user2.id, user2, mockWs2 as unknown as WebSocket)
      chatState.markAvailable(user1.id)
      chatState.markAvailable(user2.id)
      
      const availableCount = chatState.getAvailableCount()
      chatState.createSession(user1.id, user2.id)
      
      // Both users should be removed from available pool
      expect(chatState.getAvailableCount()).toBe(availableCount - 2)
    })

    it("should get user session", () => {
      chatState.registerUser(user1.id, user1, mockWs1 as unknown as WebSocket)
      chatState.registerUser(user2.id, user2, mockWs2 as unknown as WebSocket)
      
      const session = chatState.createSession(user1.id, user2.id)
      
      expect(chatState.getUserSession(user1.id)).toEqual(session)
      expect(chatState.getUserSession(user2.id)).toEqual(session)
    })

    it("should end a session", () => {
      chatState.registerUser(user1.id, user1, mockWs1 as unknown as WebSocket)
      chatState.registerUser(user2.id, user2, mockWs2 as unknown as WebSocket)
      
      const session = chatState.createSession(user1.id, user2.id)
      chatState.endSession(session.id)
      
      expect(chatState.getUserSession(user1.id)).toBe(null)
      expect(chatState.getUserSession(user2.id)).toBe(null)
    })
  })

  describe("Friend Requests", () => {
    it("should create a friend request", () => {
      const request = chatState.createFriendRequest(user1.id, user2.id)
      
      expect(request.fromUserId).toBe(user1.id)
      expect(request.toUserId).toBe(user2.id)
      expect(request.status).toBe("pending")
      expect(request.id).toBeDefined()
    })

    it("should get pending friend requests for a user", () => {
      chatState.createFriendRequest(user1.id, user2.id)
      
      const requests = chatState.getPendingFriendRequests(user2.id)
      const hasRequest = requests.some((r) => r.fromUserId === user1.id && r.toUserId === user2.id)
      expect(hasRequest).toBe(true)
    })

    it("should accept friend request", () => {
      chatState.registerUser(user1.id, user1, mockWs1 as unknown as WebSocket)
      chatState.registerUser(user2.id, user2, mockWs2 as unknown as WebSocket)
      
      const request = chatState.createFriendRequest(user1.id, user2.id)
      const success = chatState.acceptFriendRequest(request.id)
      
      expect(success).toBe(true)
      expect(chatState.areFriends(user1.id, user2.id)).toBe(true)
      expect(chatState.areFriends(user2.id, user1.id)).toBe(true)
    })

    it("should reject friend request", () => {
      const request = chatState.createFriendRequest(user1.id, user2.id)
      const success = chatState.rejectFriendRequest(request.id)
      
      expect(success).toBe(true)
    })

    it("should get friends list", () => {
      chatState.registerUser(user1.id, user1, mockWs1 as unknown as WebSocket)
      chatState.registerUser(user2.id, user2, mockWs2 as unknown as WebSocket)
      
      const request = chatState.createFriendRequest(user1.id, user2.id)
      chatState.acceptFriendRequest(request.id)
      
      const friends = chatState.getFriends(user1.id)
      expect(friends.some((f) => f.id === user2.id)).toBe(true)
    })
  })
})
