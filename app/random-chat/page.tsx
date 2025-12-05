"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useWebSocket } from "hooks/useWebSocket"
import { Button } from "components/Button"
import { Avatar } from "components/Avatar"
import { MessageComposer } from "components/MessageComposer"
import { ChatBubble } from "components/ChatBubble"
import { Loader } from "components/Loader"
import { motion } from "framer-motion"

export default function RandomChatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const {
    isConnected,
    messages,
    partner,
    isMatching,
    isPartnerTyping,
    findMatch,
    sendMessage,
    sendTyping,
    endSession,
    sendFriendRequest,
  } = useWebSocket()

  const [inputValue, setInputValue] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  useEffect(() => {
    // If not matching and no partner, initiate matching
    if (isConnected && !isMatching && !partner) {
      findMatch()
    }
  }, [isConnected, isMatching, partner, findMatch])

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (!session) {
    return null
  }

  const handleSend = (message: string) => {
    if (message.trim() && partner) {
      sendMessage(message)
      setInputValue("")
    }
  }

  const handleEndChat = () => {
    endSession()
    router.push("/dashboard")
  }

  const handleNextChat = () => {
    endSession()
    findMatch()
  }

  const handleSendFriendRequest = () => {
    if (partner) {
      sendFriendRequest(partner.id)
      alert("Friend request sent!")
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="flex min-h-screen flex-col bg-white dark:bg-gray-900"
    >
      {/* Header */}
      <div className="border-b bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Button onClick={handleEndChat} intent="secondary" size="sm">
            ← Back to Dashboard
          </Button>
          
          {partner ? (
            <div className="flex items-center gap-3">
              <Avatar
                src={partner.image || undefined}
                alt={partner.name || "Stranger"}
                initials={partner.name?.[0] || "S"}
                size="sm"
              />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{partner.name || "Anonymous Stranger"}</p>
                {isPartnerTyping && <p className="text-xs text-gray-500">typing...</p>}
              </div>
            </div>
          ) : (
            <div className="text-gray-600 dark:text-gray-400">
              {isMatching ? "Finding a match..." : "No match yet"}
            </div>
          )}

          {partner && (
            <div className="flex gap-2">
              <Button onClick={handleSendFriendRequest} intent="secondary" size="sm">
                Add Friend
              </Button>
              <Button onClick={handleNextChat} intent="primary" size="sm">
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="mx-auto flex flex-1 flex-col overflow-hidden" style={{ width: "100%", maxWidth: "64rem" }}>
        {isMatching ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <Loader />
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Looking for someone to chat with...
              </p>
            </div>
          </div>
        ) : partner ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    Connected! Say hello to start the conversation 👋
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {messages.map((msg, idx) => (
                    <ChatBubble
                      key={idx}
                      message={msg.content}
                      isOwn={msg.isOwn}
                      timestamp={new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      avatar={msg.isOwn ? session.user.image || undefined : partner.image || undefined}
                      initials={msg.isOwn ? session.user.name?.[0] : partner.name?.[0]}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="border-t p-4 dark:border-gray-700">
              <MessageComposer
                onSend={handleSend}
                onChange={(value) => {
                  setInputValue(value)
                  sendTyping(value.length > 0)
                }}
                placeholder="Type your message..."
              />
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                No one is available right now. Please try again later.
              </p>
              <Button onClick={handleEndChat}>Return to Dashboard</Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
