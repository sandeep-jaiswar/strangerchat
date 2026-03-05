"use client"

import { useState, useRef, useEffect } from "react"
import { Send, LogOut, User as UserIcon } from "lucide-react"
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

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault()
        if (input.trim()) {
            onSendMessage(input)
            setInput("")
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend(e)
        } else {
            onTyping()
        }
    }

    return (
        <div className="flex h-full w-full max-w-4xl flex-col rounded-2xl border border-slate-800 bg-slate-900/50 shadow-2xl backdrop-blur-xl mx-auto overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
                        {partner?.image ? (
                            <img src={partner.image} alt="Stranger" className="h-full w-full rounded-full object-cover" />
                        ) : (
                            <UserIcon className="h-5 w-5" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Stranger</h3>
                        <p className="text-xs text-indigo-400">Connected</p>
                    </div>
                </div>
                <button
                    onClick={onSkip}
                    className="flex items-center gap-2 rounded-lg bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-500 transition-colors hover:bg-rose-500/20"
                >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Skip</span>
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="text-center mb-6">
                    <span className="inline-block rounded-full bg-slate-800 px-4 py-1 text-xs font-medium text-slate-400">
                        You're now chatting with a random stranger. Say hi!
                    </span>
                </div>

                {messages.map((msg, index) => {
                    // It's mine if it comes from my sender account or if it's sent locally
                    const isMe = msg.isMine;
                    return (
                        <div key={index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                            <div
                                className={`max-w-[80%] rounded-2xl px-5 py-3 ${isMe
                                        ? "bg-indigo-600 text-white rounded-tr-sm"
                                        : "bg-slate-800 text-slate-100 rounded-tl-sm"
                                    }`}
                            >
                                <p className="leading-relaxed">{msg.content}</p>
                                <span className={`mt-1 block text-[10px] ${isMe ? "text-indigo-200" : "text-slate-500"}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    )
                })}

                {partnerIsTyping && (
                    <div className="flex justify-start">
                        <div className="flex max-w-[80%] items-center gap-1 rounded-2xl rounded-tl-sm bg-slate-800 px-5 py-4 text-slate-400">
                            <span className="block h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500" style={{ animationDelay: "0ms" }}></span>
                            <span className="block h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500" style={{ animationDelay: "150ms" }}></span>
                            <span className="block h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500" style={{ animationDelay: "300ms" }}></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-slate-800 bg-slate-900 p-4">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition-colors hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600"
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </form>
            </div>
        </div>
    )
}
