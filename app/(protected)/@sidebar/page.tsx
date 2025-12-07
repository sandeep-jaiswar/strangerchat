"use client"

import { useState } from "react"
import { type Contact, ContactList } from "components/ContactList"
import { FriendList } from "components/FriendList"
import { SearchBar } from "components/SearchBar"
import { TabGroup, TabPanel } from "components/TabGroup"

// Mock data - replace with real data from your API/database
const mockFriends = [
  { id: "1", name: "Alice Johnson", avatar: undefined },
  { id: "2", name: "Bob Smith", avatar: undefined },
  { id: "3", name: "Charlie Brown", avatar: undefined },
  { id: "4", name: "Diana Prince", avatar: undefined },
  { id: "5", name: "Ethan Hunt", avatar: undefined },
]

const mockContacts = [
  { name: "Stranger #1234", status: "Online", initials: "S1" },
  { name: "Stranger #5678", status: "Active now", initials: "S2" },
  { name: "Stranger #9012", status: "Offline", initials: "S3" },
  { name: "Stranger #3456", status: "Online", initials: "S4" },
  { name: "Stranger #7890", status: "Away", initials: "S5" },
]

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState("friends")
  const [searchQuery, setSearchQuery] = useState("")

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

  const handleFriendSelect = (id: string) => {
    console.log("Selected friend:", id)
    // Navigate to friend chat or handle selection
  }

  const handleContactSelect = (contact: Contact) => {
    console.log("Selected contact:", contact)
    // Navigate to anonymous chat or handle selection
  }

  // Filter friends based on search
  const filteredFriends = mockFriends.filter((friend) => friend.name.toLowerCase().includes(searchQuery.toLowerCase()))

  // Filter contacts based on search
  const filteredContacts = mockContacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <aside className="flex h-full flex-col gap-4">
      {/* Header */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-900">Messages</h2>

        {/* Search Bar */}
        <SearchBar
          placeholder={activeTab === "friends" ? "Search friends..." : "Search strangers..."}
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      {/* Tabs */}
      <TabGroup tabs={tabs} variant="pills" value={activeTab} onValueChange={setActiveTab} fullWidth />

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        <TabPanel value="friends" activeValue={activeTab}>
          {filteredFriends.length > 0 ? (
            <FriendList friends={filteredFriends} onSelect={handleFriendSelect} />
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <svg className="mb-3 h-12 w-12 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <p className="text-sm text-neutral-600">{searchQuery ? "No friends found" : "No friends yet"}</p>
              <p className="mt-1 text-xs text-neutral-500">
                {searchQuery ? "Try a different search" : "Add friends to start chatting"}
              </p>
            </div>
          )}
        </TabPanel>

        <TabPanel value="anonymous" activeValue={activeTab}>
          {filteredContacts.length > 0 ? (
            <ContactList contacts={filteredContacts} onSelect={handleContactSelect} />
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <svg className="mb-3 h-12 w-12 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <p className="text-sm text-neutral-600">{searchQuery ? "No strangers found" : "No active chats"}</p>
              <p className="mt-1 text-xs text-neutral-500">
                {searchQuery ? "Try a different search" : "Start a new anonymous chat"}
              </p>
            </div>
          )}
        </TabPanel>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-neutral-200 pt-4">
        {activeTab === "friends" ? (
          <button className="bg-primary-500 hover:bg-primary-600 focus:ring-primary-500 w-full rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none">
            Add Friend
          </button>
        ) : (
          <button className="bg-primary-500 hover:bg-primary-600 focus:ring-primary-500 w-full rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none">
            New Anonymous Chat
          </button>
        )}
      </div>
    </aside>
  )
}

export default Sidebar
