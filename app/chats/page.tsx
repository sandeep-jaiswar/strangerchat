"use client"
import { motion } from "framer-motion"
import React from "react"
import { AvatarGroup } from "../../components/AvatarGroup"
import { BottomNav } from "../../components/BottomNav"
import { ChatList } from "../../components/ChatList"

const avatars = [
  { src: "/avatar1.png", alt: "User 1", initials: "AP" },
  { src: "/avatar2.png", alt: "User 2", initials: "UX" },
  { src: "/avatar3.png", alt: "User 3", initials: "ES" },
  // ...more
]

const messages = [
  {
    id: "1",
    message: "Good morning, did you sleep well?",
    avatar: "/avatar1.png",
    initials: "AP",
    unread: true,
    timestamp: "15m",
  },
  { id: "2", message: "How is it going?", avatar: "/avatar2.png", initials: "UX", timestamp: "1h" },
  // ...more
]

const navItems = [
  { label: "Chats", icon: <span>💬</span>, active: true },
  { label: "Contacts", icon: <span>👥</span> },
  { label: "User", icon: <span>👤</span> },
]

export default function ChatsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="min-h-screen bg-white pb-16"
    >
      <div className="p-4">
        <AvatarGroup avatars={avatars} />
      </div>
      <ChatList messages={messages} className="px-4" />
      <BottomNav items={navItems} />
    </motion.div>
  )
}
