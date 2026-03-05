"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useEffect } from "react"
import { useChatWebSocket } from "@/hooks/useChatWebSocket"
import { MatchMaker } from "@/components/chat/MatchMaker"
import { ChatBox } from "@/components/chat/ChatBox"
import { Loader2 } from "lucide-react"

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

    return <ChatEnvironment user={session.user as any} />
}

function ChatEnvironment({ user }: { user: any }) {
    const {
        state,
        messages,
        partner,
        partnerIsTyping,
        onlineCount,
        findMatch,
        sendMessage,
        handleTyping,
        endSession,
    } = useChatWebSocket({
        id: user.id || user.email,
        name: user.name,
        email: user.email,
        image: user.image,
    })

    return (
        <div className="flex h-screen w-full flex-col bg-slate-950">
            <header className="flex h-16 items-center border-b border-slate-800 bg-slate-900 px-6">
                <div className="flex items-center space-x-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-white font-bold">
                        S
                    </div>
                    <span className="text-lg font-bold tracking-tight text-white">StrangerChat</span>
                </div>
            </header>

            <main className="flex-1 overflow-hidden p-4 md:p-6 lg:p-8">
                {(state === "connecting" || state === "idle" || state === "matching") ? (
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
