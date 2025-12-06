import Image from "next/image"
import React from "react"
import { cn } from "utils/cn"

type ChatBubbleProps = {
  message: string
  isOwn?: boolean
  timestamp?: string
  avatar?: string
  unread?: boolean
  initials?: string
  className?: string
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isOwn,
  timestamp,
  avatar,
  unread,
  initials,
  className,
}) => (
  <div className={cn("mb-2 flex items-end gap-2", isOwn ? "justify-end" : "justify-start")}>
    {!isOwn && (
      <div className="shrink-0">
        {avatar ? (
          <Image src={avatar} alt="avatar" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-300 text-xs font-semibold text-neutral-700">
            {initials}
          </span>
        )}
      </div>
    )}
    <div
      className={cn(
        "relative max-w-[70%] rounded-lg px-4 py-2",
        isOwn ? "bg-primary text-white" : "bg-neutral-100 text-neutral-900",
        unread ? "border-primary border-2" : "",
        className
      )}
    >
      <div>{message}</div>
      {timestamp && <small className="mt-1 block text-right text-xs text-neutral-400">{timestamp}</small>}
      {unread && <span className="bg-primary absolute top-1 right-1 h-2 w-2 rounded-full" />}
    </div>
  </div>
)
