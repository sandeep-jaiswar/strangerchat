import React from "react"
import { ChatBubble } from "../ChatBubble"

type Message = {
  id: string
  message: string
  isOwn?: boolean
  timestamp?: string
}

type ChatListProps = {
  messages: Message[]
  className?: string
}

export const ChatList: React.FC<ChatListProps> = ({ messages, className }) => (
  <div className={className}>
    {messages.map((msg) => (
      <ChatBubble key={msg.id} {...msg} />
    ))}
  </div>
)
