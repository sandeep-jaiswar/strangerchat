"use client"

import { LogOut, MoreVertical, Send, User as UserIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/Button"
import { Textarea } from "@/components/ui/Textarea"
import type { ChatMessage } from "@/hooks/useChatWebSocket"
import type { User } from "@/lib/chatState"

interface ChatBoxProps {
  messages: ChatMessage[]
  partner: User | null
  partnerIsTyping: boolean
  onSendMessage: (msg: string) => void
  onTyping: () => void
  onSkip: () => void
}

export function ChatBox({ messages, partner, partnerIsTyping, onSendMessage, onTyping, onSkip }: ChatBoxProps) {
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, partnerIsTyping])

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (input.trim()) {
      onSendMessage(input)
      setInput("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    } else {
      onTyping()
    }
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/50 bg-slate-900/80 px-4 py-3 backdrop-blur-md sm:px-6 sm:py-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 ring-2 ring-slate-800">
            {partner?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={partner.image} alt="Stranger" className="h-full w-full rounded-full object-cover" />
            ) : (
              <UserIcon className="h-5 w-5" />
            )}
            {/* Online Badge */}
            <span className="absolute right-0 bottom-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
          </div>
          <div>
            <h3 className="font-semibold tracking-tight text-white">Stranger</h3>
            <p className="text-xs font-medium text-emerald-400">Online now</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            className="flex items-center gap-2 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden font-medium sm:inline">Skip</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 space-y-4 overflow-y-auto bg-slate-900/30 p-4 sm:p-6">
        <div className="mt-2 mb-8 flex flex-col items-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800">
            <UserIcon className="h-6 w-6 text-slate-400" />
          </div>
          <span className="text-sm font-medium text-slate-300">You're now chatting with a random stranger</span>
          <span className="mt-1 text-xs text-slate-500">Messages are end-to-end volatile and never stored</span>
        </div>

        {messages.map((msg, index) => {
          const isMe = msg.isMine
          // Determine if previous/next messages are from the same person for bubble grouping
          const isFirstInGroup = index === 0 || messages[index - 1]?.isMine !== isMe
          const isLastInGroup = index === messages.length - 1 || messages[index + 1]?.isMine !== isMe

          return (
            <div
              key={index}
              className={`flex w-full ${isMe ? "justify-end" : "justify-start"} ${isFirstInGroup ? "mt-4" : "mt-1"}`}
            >
              <div
                className={`group relative max-w-[85%] px-4 py-2.5 text-[15px] shadow-sm sm:max-w-[75%] ${
                  isMe
                    ? `rounded-l-2xl bg-indigo-600 text-white ${isFirstInGroup ? "rounded-tr-2xl" : "rounded-tr-md"} ${
                        isLastInGroup ? "rounded-br-2xl" : "rounded-br-md"
                      }`
                    : `rounded-r-2xl border border-slate-700/50 bg-slate-800 text-slate-100 ${
                        isFirstInGroup ? "rounded-tl-2xl" : "rounded-tl-md"
                      } ${isLastInGroup ? "rounded-bl-2xl" : "rounded-bl-md"}`
                } `}
              >
                <div className="leading-relaxed break-words whitespace-pre-wrap">{msg.content}</div>
                <div
                  className={`absolute bottom-1 text-[10px] whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100 ${
                    isMe ? "-left-12 text-slate-500" : "-right-12 text-slate-500"
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          )
        })}

        {partnerIsTyping && (
          <div className="mt-2 flex justify-start">
            <div className="flex w-16 items-center gap-1.5 rounded-2xl rounded-tl-md border border-slate-700/50 bg-slate-800/80 px-4 py-3 text-slate-400">
              <span
                className="block h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="block h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="block h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-800/80 bg-slate-900 p-3 sm:p-4">
        <form onSubmit={handleSend} className="relative mx-auto flex max-w-4xl items-end gap-2">
          <div className="relative flex-1">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="scrollbar-thin scrollbar-thumb-slate-700 max-h-[150px] w-full overflow-y-auto bg-slate-800 pr-12 transition-colors hover:bg-slate-800/80"
            />
          </div>
          <Button
            type="submit"
            disabled={!input.trim()}
            size="icon"
            className="absolute right-2 bottom-1.5 h-10 w-10 flex-shrink-0 rounded-lg bg-indigo-600 text-white shadow-sm"
          >
            <Send className="ml-0.5 h-[18px] w-[18px]" />
          </Button>
        </form>
        <div className="mt-2 hidden text-center sm:block">
          <span className="text-[10px] text-slate-500">Press Enter to send, Shift+Enter for new line</span>
        </div>
      </div>
    </div>
  )
}
