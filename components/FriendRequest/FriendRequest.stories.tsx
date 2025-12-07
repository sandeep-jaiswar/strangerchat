import type { Meta, StoryObj } from "@storybook/react"
import React from "react"
import { FriendRequest } from "./FriendRequest"

const meta: Meta<typeof FriendRequest> = {
  title: "Components/FriendRequest",
  component: FriendRequest,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "compact", "card", "notification"],
    },
    onAccept: { action: "accepted" },
    onDecline: { action: "declined" },
    onViewProfile: { action: "profile viewed" },
  },
}

export default meta
type Story = StoryObj<typeof FriendRequest>

/**
 * Default friend request with all features.
 */
export const Default: Story = {
  args: {
    name: "Charlie Brown",
    username: "charlie_b",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
    mutualFriends: 12,
    timestamp: "5 minutes ago",
    variant: "default",
  },
}

/**
 * Compact variant for sidebars or smaller spaces.
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
 * Notification variant with colored border.
 */
export const Notification: Story = {
  args: {
    ...Default.args,
    variant: "notification",
    isUnread: true,
  },
}

/**
 * With a personal message.
 */
export const WithMessage: Story = {
  args: {
    ...Default.args,
    message: "Hi! I'd love to connect with you. We have many mutual friends!",
    variant: "card",
  },
}

/**
 * With bio instead of message.
 */
export const WithBio: Story = {
  args: {
    ...Default.args,
    bio: "Software engineer passionate about design and technology",
    variant: "card",
  },
}

/**
 * Unread request with indicator.
 */
export const Unread: Story = {
  args: {
    ...Default.args,
    isUnread: true,
  },
}

/**
 * Without mutual friends.
 */
export const NoMutualFriends: Story = {
  args: {
    ...Default.args,
    mutualFriends: 0,
  },
}

/**
 * Without timestamp.
 */
export const NoTimestamp: Story = {
  args: {
    name: "Diana Prince",
    username: "wonderwoman",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Diana",
    mutualFriends: 8,
    showTimestamp: false,
  },
}

/**
 * Minimal information (name only).
 */
export const Minimal: Story = {
  args: {
    name: "Eve Anderson",
    showMutualFriends: false,
    showTimestamp: false,
    showMessage: false,
  },
}

/**
 * Disabled state.
 */
export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
}

/**
 * Multiple requests in a list.
 */
export const MultipleRequests: Story = {
  render: () => (
    <div className="space-y-2">
      <FriendRequest
        name="Alice Johnson"
        username="alice_j"
        avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Alice"
        mutualFriends={15}
        timestamp="2 minutes ago"
        isUnread
        onAccept={() => console.log("Accepted Alice")}
        onDecline={() => console.log("Declined Alice")}
      />
      <FriendRequest
        name="Bob Smith"
        username="bobsmith"
        avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Bob"
        mutualFriends={5}
        timestamp="10 minutes ago"
        message="Hey! Saw your post about React and would love to connect!"
        onAccept={() => console.log("Accepted Bob")}
        onDecline={() => console.log("Declined Bob")}
      />
      <FriendRequest
        name="Carol Davis"
        username="carol_d"
        avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Carol"
        mutualFriends={3}
        timestamp="1 hour ago"
        onAccept={() => console.log("Accepted Carol")}
        onDecline={() => console.log("Declined Carol")}
      />
    </div>
  ),
}

/**
 * Card variant list.
 */
export const CardList: Story = {
  render: () => (
    <div className="space-y-3">
      <FriendRequest
        name="Frank Miller"
        username="frank_m"
        avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Frank"
        mutualFriends={20}
        timestamp="Just now"
        bio="Designer and developer based in San Francisco"
        variant="card"
        isUnread
        onAccept={() => console.log("Accepted")}
        onDecline={() => console.log("Declined")}
      />
      <FriendRequest
        name="Grace Lee"
        username="grace_l"
        avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Grace"
        mutualFriends={7}
        timestamp="5 minutes ago"
        message="Hi! We met at the conference last week. Would love to stay in touch!"
        variant="card"
        onAccept={() => console.log("Accepted")}
        onDecline={() => console.log("Declined")}
      />
    </div>
  ),
}

/**
 * Compact list for sidebar.
 */
export const CompactList: Story = {
  render: () => (
    <div className="w-80 space-y-1 rounded-lg border border-neutral-200 bg-white p-2">
      <h3 className="mb-2 px-2 text-sm font-semibold text-neutral-700">Friend Requests</h3>
      <FriendRequest
        name="Henry Kim"
        avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Henry"
        variant="compact"
        onAccept={() => console.log("Accepted")}
        onDecline={() => console.log("Declined")}
      />
      <FriendRequest
        name="Iris Wang"
        avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Iris"
        variant="compact"
        isUnread
        onAccept={() => console.log("Accepted")}
        onDecline={() => console.log("Declined")}
      />
      <FriendRequest
        name="Jack Wilson"
        avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Jack"
        variant="compact"
        onAccept={() => console.log("Accepted")}
        onDecline={() => console.log("Declined")}
      />
    </div>
  ),
}

/**
 * Notification center style.
 */
export const NotificationCenter: Story = {
  render: () => (
    <div className="w-96 space-y-2 rounded-lg bg-neutral-50 p-3">
      <h3 className="mb-2 text-sm font-semibold text-neutral-700">Notifications</h3>
      <FriendRequest
        name="Kate Martinez"
        username="kate_m"
        avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Kate"
        mutualFriends={10}
        timestamp="1 minute ago"
        variant="notification"
        isUnread
        onAccept={() => console.log("Accepted")}
        onDecline={() => console.log("Declined")}
      />
      <FriendRequest
        name="Leo Garcia"
        username="leo_g"
        avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Leo"
        mutualFriends={4}
        timestamp="30 minutes ago"
        variant="notification"
        onAccept={() => console.log("Accepted")}
        onDecline={() => console.log("Declined")}
      />
    </div>
  ),
}

/**
 * Interactive demo with async actions.
 */
export const Interactive: Story = {
  render: () => {
    const [requests, setRequests] = React.useState([
      {
        id: "1",
        name: "Mike Johnson",
        username: "mike_j",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
        mutualFriends: 8,
        timestamp: "2 minutes ago",
        isUnread: true,
      },
      {
        id: "2",
        name: "Nina Patel",
        username: "nina_p",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nina",
        mutualFriends: 12,
        timestamp: "15 minutes ago",
        message: "Hey! I love your work on design systems!",
        isUnread: false,
      },
    ])

    const handleAccept = async (id: string) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setRequests(requests.filter((r) => r.id !== id))
      console.log(`Accepted request from ${id}`)
    }

    const handleDecline = async (id: string) => {
      await new Promise((resolve) => setTimeout(resolve, 800))
      setRequests(requests.filter((r) => r.id !== id))
      console.log(`Declined request from ${id}`)
    }

    return (
      <div className="space-y-3">
        <div className="rounded-lg bg-neutral-100 p-3 text-sm text-neutral-600">
          <strong>Interactive Demo:</strong> Accept or decline requests. Actions simulate async operations.
        </div>
        {requests.length === 0 ? (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-8 text-center">
            <p className="text-neutral-500">No pending requests</p>
          </div>
        ) : (
          requests.map((request) => (
            <FriendRequest
              key={request.id}
              {...request}
              variant="card"
              onAccept={() => handleAccept(request.id)}
              onDecline={() => handleDecline(request.id)}
              onViewProfile={() => console.log(`View profile: ${request.id}`)}
            />
          ))
        )}
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
    variant: "card",
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
 * Mobile view.
 */
export const Mobile: Story = {
  args: {
    ...Default.args,
    variant: "default",
  },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-sm">
        <Story />
      </div>
    ),
  ],
}
