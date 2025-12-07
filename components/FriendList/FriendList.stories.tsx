import type { Meta, StoryObj } from "@storybook/react"
import React from "react"
import type { Friend } from "./FriendList"
import { FriendList } from "./FriendList"

const meta: Meta<typeof FriendList> = {
  title: "Components/FriendList",
  component: FriendList,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "compact", "card"],
    },
    onSelect: { action: "friend selected" },
    onMessage: { action: "message clicked" },
    onCall: { action: "call clicked" },
    onVideoCall: { action: "video call clicked" },
    onRemove: { action: "remove clicked" },
  },
}

export default meta
type Story = StoryObj<typeof FriendList>

const sampleFriends: Friend[] = [
  {
    id: "1",
    name: "Alice Johnson",
    username: "alice_j",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
    status: "online",
    mutualFriends: 12,
    isVerified: true,
  },
  {
    id: "2",
    name: "Bob Smith",
    username: "bobsmith",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
    status: "offline",
    lastSeen: "Last seen 2h ago",
    mutualFriends: 5,
  },
  {
    id: "3",
    name: "Charlie Brown",
    username: "charlie_b",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
    status: "away",
    lastSeen: "Last seen 30m ago",
    mutualFriends: 8,
    isFavorite: true,
  },
  {
    id: "4",
    name: "Diana Prince",
    username: "wonderwoman",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Diana",
    status: "busy",
    mutualFriends: 15,
    isVerified: true,
  },
  {
    id: "5",
    name: "Eve Anderson",
    username: "eve_a",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Eve",
    status: "online",
    mutualFriends: 3,
  },
]

/**
 * Default friend list with all features enabled.
 */
export const Default: Story = {
  args: {
    friends: sampleFriends,
    variant: "default",
    showActions: true,
    showStatus: true,
    showMutualFriends: true,
  },
}

/**
 * Compact variant for smaller spaces or sidebars.
 */
export const Compact: Story = {
  args: {
    ...Default.args,
    variant: "compact",
  },
}

/**
 * Card variant with borders and shadows.
 */
export const Card: Story = {
  args: {
    ...Default.args,
    variant: "card",
  },
}

/**
 * With a friend selected.
 */
export const WithSelection: Story = {
  args: {
    ...Default.args,
    selectedId: "1",
  },
}

/**
 * Without action buttons.
 */
export const NoActions: Story = {
  args: {
    ...Default.args,
    showActions: false,
  },
}

/**
 * Without status indicators.
 */
export const NoStatus: Story = {
  args: {
    ...Default.args,
    showStatus: false,
  },
}

/**
 * Without mutual friends count.
 */
export const NoMutualFriends: Story = {
  args: {
    ...Default.args,
    showMutualFriends: false,
  },
}

/**
 * With alphabetical sections.
 */
export const WithSections: Story = {
  args: {
    friends: [
      ...sampleFriends,
      {
        id: "6",
        name: "Frank Miller",
        username: "frank_m",
        status: "online",
        mutualFriends: 7,
      },
      {
        id: "7",
        name: "Grace Lee",
        username: "grace_l",
        status: "offline",
        lastSeen: "Last seen 1d ago",
        mutualFriends: 4,
      },
      {
        id: "8",
        name: "Henry Kim",
        username: "henry_k",
        status: "online",
        mutualFriends: 9,
      },
    ],
    showSections: true,
  },
}

/**
 * Loading state with skeleton placeholders.
 */
export const Loading: Story = {
  args: {
    friends: [],
    loading: true,
  },
}

/**
 * Empty state when no friends.
 */
export const Empty: Story = {
  args: {
    friends: [],
    emptyMessage: "No friends yet",
  },
}

/**
 * Empty state with custom message.
 */
export const EmptyCustomMessage: Story = {
  args: {
    friends: [],
    emptyMessage: "Start adding friends to see them here",
  },
}

/**
 * With search query - no results.
 */
export const NoSearchResults: Story = {
  args: {
    friends: sampleFriends,
    searchQuery: "xyz",
  },
}

/**
 * With search query - filtered results.
 */
export const SearchFiltered: Story = {
  args: {
    friends: sampleFriends,
    searchQuery: "alice",
  },
}

/**
 * Online friends only.
 */
export const OnlineOnly: Story = {
  args: {
    friends: sampleFriends.filter((f) => f.status === "online"),
  },
}

/**
 * Favorites only (with favorite hearts).
 */
export const FavoritesOnly: Story = {
  args: {
    friends: sampleFriends.map((f) => ({ ...f, isFavorite: true })),
  },
}

/**
 * Verified friends only.
 */
export const VerifiedOnly: Story = {
  args: {
    friends: sampleFriends.map((f) => ({ ...f, isVerified: true })),
  },
}

/**
 * Large list with many friends.
 */
export const LargeList: Story = {
  args: {
    friends: Array.from({ length: 50 }, (_, i) => ({
      id: `${i + 1}`,
      name: `Friend ${i + 1}`,
      username: `friend${i + 1}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Friend${i}`,
      status: ["online", "offline", "away", "busy"][i % 4] as Friend["status"],
      lastSeen: i % 2 === 0 ? `Last seen ${i}h ago` : undefined,
      mutualFriends: Math.floor(Math.random() * 20),
      isVerified: i % 5 === 0,
      isFavorite: i % 7 === 0,
    })),
    showSections: true,
  },
}

/**
 * Minimal friend list (no extras).
 */
export const Minimal: Story = {
  args: {
    friends: sampleFriends,
    showActions: false,
    showStatus: false,
    showMutualFriends: false,
    variant: "compact",
  },
}

/**
 * Interactive demo with all callbacks.
 */
export const Interactive: Story = {
  render: () => {
    const [selectedId, setSelectedId] = React.useState<string | undefined>("1")
    const [friends, setFriends] = React.useState(sampleFriends)
    const [searchQuery, setSearchQuery] = React.useState("")

    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <h3 className="mb-2 text-sm font-semibold">Controls:</h3>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search friends..."
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
          <div className="mt-2 text-xs text-neutral-500">
            Selected: {friends.find((f) => f.id === selectedId)?.name || "None"}
          </div>
        </div>
        <FriendList
          friends={friends}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onMessage={(id) => console.log("Message:", id)}
          onCall={(id) => console.log("Call:", id)}
          onVideoCall={(id) => console.log("Video call:", id)}
          onRemove={(id) => setFriends(friends.filter((f) => f.id !== id))}
          searchQuery={searchQuery}
        />
      </div>
    )
  },
}

/**
 * Dark theme variant.
 */
export const DarkTheme: Story = {
  args: {
    ...Default.args,
  },
  decorators: [
    (Story) => (
      <div className="rounded-xl bg-neutral-900 p-6">
        <Story />
      </div>
    ),
  ],
}

/**
 * Mobile view (smaller width).
 */
export const Mobile: Story = {
  args: {
    ...Default.args,
    variant: "compact",
  },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-sm">
        <Story />
      </div>
    ),
  ],
}
