"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "components/Button"
import { useWebSocket } from "hooks/useWebSocket"
import { Avatar } from "components/Avatar"
import { Loader } from "components/Loader"
import { motion } from "framer-motion"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { isConnected, onlineCount, availableCount, findMatch, isMatching } = useWebSocket()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 dark:from-gray-900 dark:to-gray-800"
    >
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
          <div className="flex items-center gap-4">
            <Avatar
              src={session.user.image || undefined}
              alt={session.user.name || "User"}
              initials={session.user.name?.[0] || "U"}
              size="md"
            />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{session.user.name || "Anonymous"}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{session.user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isConnected ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>
                    Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-red-500"></span>
                    Disconnected
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {onlineCount} online • {availableCount} available
              </p>
            </div>
            <Button onClick={() => signOut()} intent="secondary" size="sm">
              Sign Out
            </Button>
          </div>
        </div>

        {/* Main Actions */}
        <div className="mb-8 rounded-lg bg-white p-8 text-center shadow-md dark:bg-gray-800">
          <h1 className="mb-4 text-3xl font-extrabold text-gray-900 dark:text-white">Welcome to StrangerChat</h1>
          <p className="mb-8 text-gray-600 dark:text-gray-400">
            Connect with random strangers around the world for anonymous conversations
          </p>

          {isMatching ? (
            <div className="flex flex-col items-center justify-center">
              <Loader />
              <p className="mt-4 text-gray-600 dark:text-gray-400">Looking for a match...</p>
            </div>
          ) : (
            <Button
              onClick={() => {
                findMatch()
                router.push("/random-chat")
              }}
              size="lg"
              disabled={!isConnected}
            >
              Start Random Chat
            </Button>
          )}

          {!isConnected && (
            <p className="mt-4 text-sm text-yellow-600 dark:text-yellow-400">
              Connecting to server... Please wait.
            </p>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">📜 How it works</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Click "Start Random Chat" to get matched with an available user</li>
              <li>• Chat in real-time using our WebSocket connection</li>
              <li>• End the conversation anytime or get matched with someone new</li>
              <li>• Send friend requests to people you'd like to stay connected with</li>
            </ul>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">⚠️ Important Notes</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• All messages are stored in memory only (not in a database)</li>
              <li>• Message history is lost when either user disconnects</li>
              <li>• Friend lists and requests are cleared on server restart</li>
              <li>• Be respectful and follow community guidelines</li>
            </ul>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-center gap-4">
          <Button onClick={() => router.push("/friends")} intent="secondary">
            My Friends
          </Button>
          <Button onClick={() => router.push("/profile")} intent="secondary">
            Profile
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
