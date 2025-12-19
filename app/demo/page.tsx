"use client"

import { useState } from "react"
import { Avatar } from "@/components/Avatar/Avatar"
import { ChatList, type Message } from "@/components/ChatList/ChatList"
import { type Contact, ContactList } from "@/components/ContactList/ContactList"
import { FriendList } from "@/components/FriendList/FriendList"
import { IconButton } from "@/components/IconButton/IconButton"
import { MessageComposer } from "@/components/MessageComposer/MessageComposer"
import { SearchBar } from "@/components/SearchBar"
import { TabGroup, TabPanel } from "@/components/TabGroup"

// Mock chat data
const initialMessages: Message[] = [
  {
    id: "1",
    message: "Can you share the latest project design updates?",
    isOwn: false,
    timestamp: "5m ago",
    date: new Date(),
    name: "Alice Johnson",
    initials: "AJ",
    status: "online",
    deliveryStatus: "delivered",
  },
  {
    id: "2",
    message: "Sure, I'll send you the updated mockups in a few minutes.",
    isOwn: true,
    timestamp: "4m ago",
    date: new Date(),
    deliveryStatus: "read",
  },
  {
    id: "3",
    message: "What time is the client meeting scheduled for?",
    isOwn: false,
    timestamp: "3m ago",
    date: new Date(),
    name: "Alice Johnson",
    initials: "AJ",
    status: "online",
    deliveryStatus: "delivered",
  },
  {
    id: "4",
    message: "The meeting is set for 3 PM tomorrow. I'll share the link soon.",
    isOwn: true,
    timestamp: "2m ago",
    date: new Date(),
    deliveryStatus: "read",
  },
  {
    id: "5",
    message: "Do we have the final approval for the UI changes?",
    isOwn: false,
    timestamp: "1m ago",
    date: new Date(),
    name: "Alice Johnson",
    initials: "AJ",
    status: "online",
    deliveryStatus: "delivered",
  },
  {
    id: "6",
    message: "Yes, the client approved all the changes yesterday. We can proceed.",
    isOwn: true,
    timestamp: "Just now",
    date: new Date(),
    deliveryStatus: "read",
  },
  {
    id: "7",
    message: "Are we still on track for the deadline?",
    isOwn: false,
    timestamp: "Just now",
    date: new Date(),
    name: "Alice Johnson",
    initials: "AJ",
    status: "online",
    deliveryStatus: "delivered",
  },
]

const mockFriends = [
  { id: "1", name: "Alice Johnson", avatar: undefined, status: "online", timestamp: "Active now" },
  { id: "2", name: "Bob Smith", avatar: undefined, status: "online", timestamp: "2h ago" },
  { id: "3", name: "Charlie Brown", avatar: undefined, status: "away", timestamp: "1d ago" },
  { id: "4", name: "Diana Prince", avatar: undefined, status: "online", timestamp: "3d ago" },
  { id: "5", name: "Ethan Hunt", avatar: undefined, status: "offline", timestamp: "1w ago" },
]

const mockContacts = [
  { name: "Stranger #1234", status: "Online", initials: "S1" },
  { name: "Stranger #5678", status: "Active now", initials: "S2" },
  { name: "Stranger #9012", status: "Offline", initials: "S3" },
  { name: "Stranger #3456", status: "Online", initials: "S4" },
  { name: "Stranger #7890", status: "Away", initials: "S5" },
]

export default function DemoPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [isTyping, setIsTyping] = useState(false)
  const [activeTab, setActiveTab] = useState("friends")
  const [searchQuery, setSearchQuery] = useState("")

  const handleSendMessage = (message: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      message,
      isOwn: true,
      timestamp: "Just now",
      date: new Date(),
      deliveryStatus: "sending",
    }

    setMessages((prev) => [...prev, newMessage])

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === newMessage.id ? { ...msg, deliveryStatus: "delivered" as const } : msg))
      )
    }, 1000)
  }

  const handleTyping = (typing: boolean) => {
    setIsTyping(typing)
  }

  const tabs = [
    {
      label: "Friends",
      value: "friends",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      badge: mockFriends.length,
    },
    {
      label: "Anonymous",
      value: "anonymous",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      badge: mockContacts.length,
    },
  ]

  const filteredFriends = mockFriends.filter((friend) => friend.name.toLowerCase().includes(searchQuery.toLowerCase()))
  const filteredContacts = mockContacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Top Navbar */}
      <header className="shrink-0 border-b border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex-1 text-2xl font-bold uppercase">StrangerChat</div>
          <div className="text-sm text-neutral-600">Demo Mode</div>
        </div>
      </header>

      {/* Main Content Area with Sidebar and Chat */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-80 shrink-0 overflow-y-auto border-r border-neutral-200 bg-white p-4">
          <div className="flex h-full flex-col gap-4">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-neutral-900">Messages</h2>
              <SearchBar
                placeholder={activeTab === "friends" ? "Search friends..." : "Search strangers..."}
                value={searchQuery}
                onChange={setSearchQuery}
              />
            </div>

            <TabGroup tabs={tabs} variant="pills" value={activeTab} onValueChange={setActiveTab} fullWidth />

            <div className="flex-1 overflow-y-auto">
              <TabPanel value="friends" activeValue={activeTab}>
                {filteredFriends.length > 0 ? (
                  <FriendList friends={filteredFriends} onSelect={(id) => console.log("Selected friend:", id)} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-sm text-neutral-600">No friends found</p>
                  </div>
                )}
              </TabPanel>

              <TabPanel value="anonymous" activeValue={activeTab}>
                {filteredContacts.length > 0 ? (
                  <ContactList
                    contacts={filteredContacts}
                    onSelect={(contact: Contact) => console.log("Selected contact:", contact)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-sm text-neutral-600">No strangers found</p>
                  </div>
                )}
              </TabPanel>
            </div>

            <div className="border-t border-neutral-200 pt-4">
              <button className="w-full rounded-lg bg-[#0071e3] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0077ed] focus:ring-2 focus:ring-[#0071e3] focus:ring-offset-2 focus:outline-none">
                {activeTab === "friends" ? "Add Friend" : "New Anonymous Chat"}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Chat Area */}
        <section className="flex flex-1 flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Avatar src={undefined} alt="Alice Johnson" initials="AJ" status="online" size="md" />
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">Alice Johnson</h2>
                <p className="text-sm text-neutral-500">Active now</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <IconButton variant="plain" intent="secondary" size="md" aria-label="Voice call">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path
                    d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </IconButton>
              <IconButton variant="plain" intent="secondary" size="md" aria-label="Video call">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path
                    d="M23 7l-7 5 7 5V7zM16 5H2a1 1 0 00-1 1v12a1 1 0 001 1h14a1 1 0 001-1V6a1 1 0 00-1-1z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </IconButton>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-hidden bg-neutral-50">
            <ChatList
              messages={messages}
              showDates={false}
              showAvatars={true}
              showNames={false}
              groupMessages={true}
              isTyping={isTyping}
              typingUser={{ name: "Alice Johnson", avatar: undefined }}
              variant="default"
            />
          </div>

          {/* Message Input */}
          <div className="border-t border-neutral-200 bg-white px-6 py-4">
            <MessageComposer
              onSend={handleSendMessage}
              onTyping={handleTyping}
              placeholder="Type a message"
              showAttachment={true}
              showEmoji={true}
              showVoice={false}
              variant="elevated"
            />
          </div>
        </section>
      </div>
    </div>
  )
}
