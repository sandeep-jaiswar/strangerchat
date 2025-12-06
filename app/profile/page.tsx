"use client"
import { motion } from "framer-motion"
import React from "react"
import { BottomNav } from "../../components/BottomNav"
import { UserProfile } from "../../components/UserProfile"

const user = {
  name: "Victoria Robertson",
  email: "victoria@example.com",
  avatar: "/avatar-profile.png",
  phone: "+91 99999 00000",
  bio: "A mantra goes here",
  status: "online" as const,
  recentChats: [
    { name: "Athalia Putri", lastMessage: "I want to use your yacht...", time: "15m", avatar: "/avatar1.png" },
    { name: "Midola Huera", lastMessage: "I want to use your yacht...", time: "15m", avatar: "/avatar2.png" },
  ],
}

const navItems = [
  { label: "Chats", icon: <span>💬</span> },
  { label: "Contacts", icon: <span>👥</span> },
  { label: "User", icon: <span>👤</span>, active: true },
]

export default function ProfilePage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="min-h-screen bg-white pb-16"
    >
      <UserProfile {...user} />
      <BottomNav items={navItems} />
    </motion.div>
  )
}
