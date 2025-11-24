import React, { useState } from "react"
import { cn } from "utils/cn"
import { Button } from "../Button"
import { Input } from "../Input"

type MessageComposerProps = {
  onSend: (message: string) => void
  disabled?: boolean
  className?: string
}

export const MessageComposer: React.FC<MessageComposerProps> = ({ onSend, disabled, className }) => {
  const [msg, setMsg] = useState("")
  return (
    <form
      className={cn("flex gap-2", className)}
      onSubmit={(e) => {
        e.preventDefault()
        onSend(msg)
        setMsg("")
      }}
    >
      <Input
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        placeholder="Type a message..."
        disabled={disabled}
        size="md"
      />
      <Button type="submit" disabled={!msg || disabled} size="md">
        Send
      </Button>
    </form>
  )
}
