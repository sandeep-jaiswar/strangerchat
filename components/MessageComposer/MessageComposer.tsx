"use client"

import React, { useEffect, useState } from "react"
import { cn } from "utils/cn"
import { Button } from "../Button"
import { Input } from "../Input"

type MessageComposerProps = {
  onSend: (message: string) => void
  onTyping?: (isTyping: boolean) => void
  disabled?: boolean
  className?: string
  placeholder?: string
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSend,
  onTyping,
  disabled,
  className,
  placeholder = "Type a message...",
}) => {
  const [msg, setMsg] = useState("")

  useEffect(() => {
    // Notify parent about typing status
    if (onTyping) {
      onTyping(msg.length > 0)
    }
  }, [msg, onTyping])

  return (
    <form
      className={cn("flex items-center gap-2", className)}
      onSubmit={(e) => {
        e.preventDefault()
        if (msg.trim()) {
          onSend(msg)
          setMsg("")
        }
      }}
    >
      {/* Attachment icon */}
      <button type="button" className="hover:text-primary p-2 text-neutral-400">
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M17 17V7a5 5 0 0 0-10 0v10a5 5 0 0 0 10 0V7" />
        </svg>
      </button>
      <Input
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        size="md"
        className="flex-1"
      />
      {/* Voice message icon */}
      <button type="button" className="hover:text-primary p-2 text-neutral-400">
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M12 18v2m0-2a6 6 0 0 0 6-6V9a6 6 0 0 0-12 0v3a6 6 0 0 0 6 6z" />
        </svg>
      </button>
      <Button type="submit" disabled={!msg || disabled} size="md">
        Send
      </Button>
    </form>
  )
}
