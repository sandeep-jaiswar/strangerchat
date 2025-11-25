import React from "react"
import { ChatBubble } from "../ChatBubble"

type Message = {
  id: string
  message: string
  isOwn?: boolean
  timestamp?: string
  avatar?: string
  unread?: boolean
  initials?: string
}

type ChatListProps = {
  messages: Message[]
  className?: string
}

export const ChatList: React.FC<ChatListProps> = ({ messages, className }) => (
  <div className={className}>
    {/* Avatar group at top (for reference image) */}
    <div className="mb-4">{/* Example usage: <AvatarGroup avatars={[...]} /> */}</div>
    {messages.map((msg) => (
      <ChatBubble key={msg.id} {...msg} />
    ))}
  </div>
)
