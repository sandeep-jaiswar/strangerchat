"use client"
import { motion } from "framer-motion"
import React from "react"
import { BottomNav } from "../../components/BottomNav"
import { ContactList } from "../../components/ContactList"
import { SearchBar } from "../../components/SearchBar"

const contacts = [
  { name: "Athalia Putri", status: "Online", avatar: "/avatar1.png" },
  { name: "Erion Sadewa", status: "Online", avatar: "/avatar2.png" },
  // ...more
]

const navItems = [
  { label: "Chats", icon: <span>💬</span> },
  { label: "Contacts", icon: <span>👥</span>, active: true },
  { label: "User", icon: <span>👤</span> },
]

export default function ContactsPage() {
  const [search, setSearch] = React.useState("")
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="min-h-screen bg-white pb-16"
    >
      <div className="p-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search" />
      </div>
      <ContactList
        contacts={contacts.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))}
        className="px-4"
      />
      <button className="bg-primary fixed right-6 bottom-20 flex h-14 w-14 items-center justify-center rounded-full text-2xl text-white shadow-lg">
        +
      </button>
      <BottomNav items={navItems} />
    </motion.div>
  )
}
