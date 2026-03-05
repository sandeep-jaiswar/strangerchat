"use client"

import { Loader2 } from "lucide-react"
import { redirect } from "next/navigation"
import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { ChatBox } from "@/components/chat/ChatBox"
import { MatchMaker } from "@/components/chat/MatchMaker"
import { useChatWebSocket } from "@/hooks/useChatWebSocket"
import type { User } from "@/lib/chatState"

export default function ChatPage() {
  const { data: session, status } = useSession()

  // Ensure unauthenticated users are redirected
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login")
    }
  }, [status])

  // Don't initialize websocket until authenticated
  if (status === "loading" || !session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  return <ChatEnvironment user={session.user as User} />
}

function ChatEnvironment({ user }: { user: User }) {
  const { state, messages, partner, partnerIsTyping, onlineCount, findMatch, sendMessage, handleTyping, endSession } =
    useChatWebSocket({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    })

  return (
    <div className="flex h-screen w-full flex-col bg-slate-950/50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/5 bg-slate-950/80 px-4 shadow-sm backdrop-blur-xl md:px-8">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white shadow-lg shadow-indigo-600/20">
            <span className="text-sm">S</span>
          </div>
          <span className="hidden text-lg font-bold tracking-tight text-white sm:block">StrangerChat</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/50 px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-slate-300">{onlineCount} Online</span>
          </div>

          {/* User Avatar Placeholder */}
          <div className="h-9 w-9 rounded-full bg-slate-800 p-[2px] ring-2 ring-slate-800">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt="User avatar" className="h-full w-full rounded-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-400 uppercase">
                {user.name?.[0] || "U"}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-0 flex flex-1 flex-col overflow-hidden p-0 sm:p-4 md:p-6">
        {state === "connecting" || state === "idle" || state === "matching" ? (
          <MatchMaker
            isConnecting={state === "connecting"}
            isMatching={state === "matching"}
            onlineCount={onlineCount}
            onFindMatch={findMatch}
          />
        ) : (
          <ChatBox
            messages={messages}
            partner={partner}
            partnerIsTyping={partnerIsTyping}
            onSendMessage={sendMessage}
            onTyping={handleTyping}
            onSkip={() => {
              endSession()
              setTimeout(findMatch, 500) // Instantly start looking for a new match
            }}
          />
        )}
      </main>
    </div>
  )
}
