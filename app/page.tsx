"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { AdsenseBanner } from "components/AdsenseBanner"
import LoginButton from "components/LoginButton/LoginButton"
import { Button } from "components/Button"
import { env } from "../env.mjs"

export default function Web() {
  const { data: session } = useSession()
  const router = useRouter()

  // If user is authenticated, redirect to dashboard
  if (session) {
    router.push("/dashboard")
    return null
  }

  return (
    <>
      <AdsenseBanner adClient={env.ADSENSE_CLIENT} />
      <section className="bg-white dark:bg-gray-900">
        <div className="mx-auto grid max-w-(--breakpoint-xl) px-4 py-8 text-center lg:py-16">
          <div className="mx-auto place-self-center">
            <h1 className="mb-4 max-w-2xl text-4xl leading-none font-extrabold tracking-tight md:text-5xl xl:text-6xl dark:text-white">
              StrangerChat
            </h1>
            <p className="mb-6 max-w-2xl font-light text-gray-500 md:text-lg lg:mb-8 lg:text-xl dark:text-gray-400">
              Connect with random strangers around the world. Have anonymous conversations in real-time via WebSocket.
              No database, no message history—just pure, ephemeral human connection.
            </p>
            <div className="mb-8 flex justify-center gap-4">
              <LoginButton />
            </div>
            <div className="mb-8">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ⚠️ <strong>Important:</strong> All chats are temporary and stored only in memory. Messages and friend
                lists are lost on server restart.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-(--breakpoint-xl) px-4 py-8 sm:py-16 lg:px-6">
          <div className="mb-8 text-center">
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Features</h2>
          </div>
          <div className="justify-center space-y-8 md:grid md:grid-cols-2 md:gap-12 md:space-y-0 lg:grid-cols-3">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="bg-primary-100 dark:bg-primary-900 mb-4 flex size-10 items-center justify-center rounded-full p-1.5 text-blue-700 lg:size-12">
                🎲
              </div>
              <h3 className="mb-2 text-xl font-bold dark:text-white">Random Matching</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Get paired with available users instantly for one-on-one conversations
              </p>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <div className="bg-primary-100 dark:bg-primary-900 mb-4 flex size-10 items-center justify-center rounded-full p-1.5 text-blue-700 lg:size-12">
                ⚡
              </div>
              <h3 className="mb-2 text-xl font-bold dark:text-white">Real-time Chat</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Low-latency messaging powered by WebSocket technology
              </p>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <div className="bg-primary-100 dark:bg-primary-900 mb-4 flex size-10 items-center justify-center rounded-full p-1.5 text-blue-700 lg:size-12">
                🤝
              </div>
              <h3 className="mb-2 text-xl font-bold dark:text-white">Friend Requests</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Send and accept friend requests to stay connected with interesting people
              </p>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <div className="bg-primary-100 dark:bg-primary-900 mb-4 flex size-10 items-center justify-center rounded-full p-1.5 text-blue-700 lg:size-12">
                🔒
              </div>
              <h3 className="mb-2 text-xl font-bold dark:text-white">Secure Authentication</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Sign in securely with Google, Email, or GitHub via NextAuth
              </p>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <div className="bg-primary-100 dark:bg-primary-900 mb-4 flex size-10 items-center justify-center rounded-full p-1.5 text-blue-700 lg:size-12">
                🌐
              </div>
              <h3 className="mb-2 text-xl font-bold dark:text-white">Global Reach</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Connect with people from anywhere in the world, anytime
              </p>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <div className="bg-primary-100 dark:bg-primary-900 mb-4 flex size-10 items-center justify-center rounded-full p-1.5 text-blue-700 lg:size-12">
                📱
              </div>
              <h3 className="mb-2 text-xl font-bold dark:text-white">Mobile Friendly</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Responsive design works seamlessly on all devices
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
