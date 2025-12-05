"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "components/Button"
import { FriendList } from "components/FriendList"
import { FriendRequest } from "components/FriendRequest"
import { Loader } from "components/Loader"

type Friend = {
  id: string
  name: string
  avatar?: string
}

type FriendRequestType = {
  id: string
  fromUserId: string
  from?: {
    name: string
    image?: string
  }
}

export default function FriendsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [friends] = useState<Friend[]>([])
  const [requests, setRequests] = useState<FriendRequestType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  useEffect(() => {
    // TODO: Implement WebSocket listeners for friends and requests
    // For now, just mock empty state
    setTimeout(() => {
      setIsLoading(false)
    }, 500)
  }, [])

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (!session) {
    return null
  }

  const handleAccept = (requestId: string) => {
    // TODO: Send accept via WebSocket
    setRequests((prev) => prev.filter((r) => r.id !== requestId))
  }

  const handleDecline = (requestId: string) => {
    // TODO: Send reject via WebSocket
    setRequests((prev) => prev.filter((r) => r.id !== requestId))
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
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Friends</h1>
          <Button onClick={() => router.push("/dashboard")} intent="secondary">
            ← Back to Dashboard
          </Button>
        </div>

        {/* Friend Requests */}
        {requests.length > 0 && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Friend Requests</h2>
            <div className="space-y-3">
              {requests.map((request) => (
                <FriendRequest
                  key={request.id}
                  name={request.from?.name || "Anonymous"}
                  avatar={request.from?.image}
                  onAccept={() => handleAccept(request.id)}
                  onDecline={() => handleDecline(request.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Friends List */}
        <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">My Friends</h2>
          {friends.length === 0 ? (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              <p>No friends yet.</p>
              <p className="mt-2 text-sm">Start chatting with strangers and send friend requests!</p>
            </div>
          ) : (
            <FriendList friends={friends} onSelect={(id) => console.log("Selected friend:", id)} />
          )}
        </div>

        {/* Info */}
        <div className="mt-6 rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ <strong>Note:</strong> Friend lists and requests are stored in server memory only. They will be lost on
            server restart.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
