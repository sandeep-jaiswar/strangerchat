import React from "react"
import { cn } from "utils/cn"

type ChatBubbleProps = {
  message: string
  isOwn?: boolean
  timestamp?: string
  className?: string
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isOwn, timestamp, className }) => (
  <div
    className={cn(
      "mb-2 max-w-[70%] rounded-lg px-4 py-2",
      isOwn ? "bg-primary self-end text-white" : "self-start bg-neutral-100 text-neutral-900",
      className
    )}
  >
    <div>{message}</div>
    {timestamp && <small className="mt-1 block text-right text-xs text-neutral-400">{timestamp}</small>}
  </div>
)
