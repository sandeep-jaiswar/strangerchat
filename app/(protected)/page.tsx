"use client"

import { useSession } from "next-auth/react"
import { useState } from "react"
import { Avatar } from "@/components/Avatar/Avatar"
import { ChatList, type Message } from "@/components/ChatList/ChatList"
import { IconButton } from "@/components/IconButton/IconButton"
import { MessageComposer } from "@/components/MessageComposer/MessageComposer"

// Mock chat data - in production this would come from WebSocket/API
const initialMessages: Message[] = [
  {
    id: "1",
    message: "Can you share the latest project design updates?",
    isOwn: false,
    timestamp: "5m ago",
    date: new Date(),
    name: "Muhammad Ismail",
    initials: "MI",
    status: "online",
    deliveryStatus: "delivered",
  },
  {
    id: "2",
    message: "Sure, I'll send you the updated mockups in a few minutes.",
    isOwn: true,
    timestamp: "4m ago",
    date: new Date(),
    deliveryStatus: "read",
  },
  {
    id: "3",
    message: "What time is the client meeting scheduled for?",
    isOwn: false,
    timestamp: "3m ago",
    date: new Date(),
    name: "Muhammad Ismail",
    initials: "MI",
    status: "online",
    deliveryStatus: "delivered",
  },
  {
    id: "4",
    message: "The meeting is set for 3 PM tomorrow. I'll share the link soon.",
    isOwn: true,
    timestamp: "2m ago",
    date: new Date(),
    deliveryStatus: "read",
  },
  {
    id: "5",
    message: "Do we have the final approval for the UI changes?",
    isOwn: false,
    timestamp: "1m ago",
    date: new Date(),
    name: "Muhammad Ismail",
    initials: "MI",
    status: "online",
    deliveryStatus: "delivered",
  },
  {
    id: "6",
    message: "Yes, the client approved all the changes yesterday. We can proceed.",
    isOwn: true,
    timestamp: "Just now",
    date: new Date(),
    deliveryStatus: "read",
  },
  {
    id: "7",
    message: "Are we still on track for the deadline?",
    isOwn: false,
    timestamp: "Just now",
    date: new Date(),
    name: "Muhammad Ismail",
    initials: "MI",
    status: "online",
    deliveryStatus: "delivered",
  },
]

const Home = () => {
  const { data: _session } = useSession()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [isTyping, setIsTyping] = useState(false)

  const handleSendMessage = (message: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      message,
      isOwn: true,
      timestamp: "Just now",
      date: new Date(),
      deliveryStatus: "sending",
    }

    setMessages((prev) => [...prev, newMessage])

    // Simulate message delivery
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === newMessage.id ? { ...msg, deliveryStatus: "delivered" as const } : msg))
      )
    }, 1000)
  }

  const handleTyping = (typing: boolean) => {
    setIsTyping(typing)
  }

  return (
    <main className="flex h-full flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Avatar src={undefined} alt="Muhammad Ismail" initials="MI" status="online" size="md" />
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Muhammad Ismail</h2>
            <p className="text-sm text-neutral-500">Active 5m Ago</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <IconButton variant="plain" intent="secondary" size="md" aria-label="Voice call">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path
                d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </IconButton>
          <IconButton variant="plain" intent="secondary" size="md" aria-label="Video call">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path
                d="M23 7l-7 5 7 5V7zM16 5H2a1 1 0 00-1 1v12a1 1 0 001 1h14a1 1 0 001-1V6a1 1 0 00-1-1z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </IconButton>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden bg-neutral-50">
        <ChatList
          messages={messages}
          showDates={false}
          showAvatars={true}
          showNames={false}
          groupMessages={true}
          isTyping={isTyping}
          typingUser={{ name: "Muhammad Ismail", avatar: undefined }}
          variant="default"
        />
      </div>

      {/* Message Input */}
      <div className="border-t border-neutral-200 bg-white px-6 py-4">
        <MessageComposer
          onSend={handleSendMessage}
          onTyping={handleTyping}
          placeholder="Type a message"
          showAttachment={true}
          showEmoji={true}
          showVoice={false}
          variant="elevated"
        />
      </div>
    </main>
  )
}

export default Home
