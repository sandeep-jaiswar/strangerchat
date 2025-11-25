import { motion } from "framer-motion"
import Image from "next/image"
import React from "react"
import { BottomNav } from "../../../components/BottomNav"
import { ChatList } from "../../../components/ChatList"
import { MessageComposer } from "../../../components/MessageComposer"

const messages = [
  {
    id: "1",
    message: "Look at how chocho sleep in my arms!",
    avatar: "/avatar1.png",
    initials: "AP",
    timestamp: "14:44",
  },
  { id: "2", message: "Can I come over?", isOwn: true, timestamp: "14:45" },
  // ...more
]

const navItems = [
  { label: "Chats", icon: <span>💬</span>, active: true },
  { label: "Contacts", icon: <span>👥</span> },
  { label: "User", icon: <span>👤</span> },
]

export default function ChatPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="flex min-h-screen flex-col bg-white pb-16"
    >
      <div className="flex items-center gap-3 border-b p-4">
        <Image
          src="/avatar1.png"
          alt="Athalia Putri"
          width={40}
          height={40}
          className="h-10 w-10 rounded-full object-cover"
        />
        <div className="font-semibold">Athalia Putri</div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <ChatList messages={messages} />
      </div>
      <div className="p-4">
        <MessageComposer onSend={() => {}} />
      </div>
      <BottomNav items={navItems} />
    </motion.div>
  )
}
