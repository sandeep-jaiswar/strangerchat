import { motion } from "framer-motion"
import React from "react"
import { BottomNav } from "../../../components/BottomNav"
import { GroupProfile } from "../../../components/GroupProfile"

const group = {
  name: "UI / UX Designer & Dev.",
  description: "Public group 37K members...",
  avatar: "/group-avatar.png",
  members: [
    { src: "/avatar1.png", alt: "Athalia Putri", initials: "AP" },
    { src: "/avatar2.png", alt: "Erion Sadewa", initials: "ES" },
    // ...more
  ],
}

const navItems = [
  { label: "Chats", icon: <span>💬</span> },
  { label: "Contacts", icon: <span>👥</span> },
  { label: "User", icon: <span>👤</span>, active: true },
]

export default function GroupProfilePage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="min-h-screen bg-white pb-16"
    >
      <GroupProfile {...group} />
      <BottomNav items={navItems} />
    </motion.div>
  )
}
