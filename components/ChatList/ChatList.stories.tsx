import type { Meta, StoryObj } from "@storybook/react"
import { ChatList } from "./ChatList"

const meta: Meta<typeof ChatList> = {
  title: "Components/ChatList",
  component: ChatList,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="h-[600px] bg-white">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "compact", "comfortable"],
      description: "Visual variant affecting spacing",
    },
    showDates: {
      control: "boolean",
      description: "Show date separators",
    },
    showAvatars: {
      control: "boolean",
      description: "Show user avatars",
    },
    showNames: {
      control: "boolean",
      description: "Show sender names (for group chats)",
    },
    groupMessages: {
      control: "boolean",
      description: "Group consecutive messages from same sender",
    },
    autoScroll: {
      control: "boolean",
      description: "Auto-scroll to bottom on new messages",
    },
  },
}

export default meta
type Story = StoryObj<typeof ChatList>

const sampleMessages = [
  {
    id: "1",
    message: "Hey! How are you doing?",
    isOwn: false,
    timestamp: "9:00 AM",
    date: new Date(2024, 11, 7, 9, 0),
    avatar: "https://i.pravatar.cc/150?img=1",
    name: "Sarah Johnson",
  },
  {
    id: "2",
    message: "I'm doing great! Just finished a big project",
    isOwn: true,
    timestamp: "9:05 AM",
    date: new Date(2024, 11, 7, 9, 5),
    deliveryStatus: "read" as const,
  },
  {
    id: "3",
    message: "That's awesome! What was it about?",
    isOwn: false,
    timestamp: "9:06 AM",
    date: new Date(2024, 11, 7, 9, 6),
    avatar: "https://i.pravatar.cc/150?img=1",
    name: "Sarah Johnson",
  },
  {
    id: "4",
    message: "It was a redesign of our component library following Apple's design principles",
    isOwn: true,
    timestamp: "9:07 AM",
    date: new Date(2024, 11, 7, 9, 7),
    deliveryStatus: "delivered" as const,
  },
  {
    id: "5",
    message: "Sounds interesting! Can I see it?",
    isOwn: false,
    timestamp: "9:08 AM",
    date: new Date(2024, 11, 7, 9, 8),
    avatar: "https://i.pravatar.cc/150?img=1",
    name: "Sarah Johnson",
    reactions: [{ emoji: "👀", count: 1, userReacted: false }],
  },
  {
    id: "6",
    message: "Sure! I'll send you the link",
    isOwn: true,
    timestamp: "9:10 AM",
    date: new Date(2024, 11, 7, 9, 10),
    deliveryStatus: "sent" as const,
  },
]

const longConversation = [
  {
    id: "1",
    message: "Good morning!",
    isOwn: false,
    timestamp: "8:00 AM",
    date: new Date(2024, 11, 6, 8, 0),
    avatar: "https://i.pravatar.cc/150?img=2",
    name: "Alex Chen",
  },
  {
    id: "2",
    message: "Morning! How was your weekend?",
    isOwn: true,
    timestamp: "8:05 AM",
    date: new Date(2024, 11, 6, 8, 5),
    deliveryStatus: "read" as const,
  },
  {
    id: "3",
    message: "It was great! Went hiking",
    isOwn: false,
    timestamp: "8:06 AM",
    date: new Date(2024, 11, 6, 8, 6),
    avatar: "https://i.pravatar.cc/150?img=2",
  },
  {
    id: "4",
    message: "Sounds fun!",
    isOwn: true,
    timestamp: "8:07 AM",
    date: new Date(2024, 11, 6, 8, 7),
    deliveryStatus: "read" as const,
  },
  {
    id: "5",
    message: "Hey! Ready for our meeting?",
    isOwn: false,
    timestamp: "2:00 PM",
    date: new Date(2024, 11, 7, 14, 0),
    avatar: "https://i.pravatar.cc/150?img=2",
    name: "Alex Chen",
  },
  {
    id: "6",
    message: "Yes! Joining now",
    isOwn: true,
    timestamp: "2:01 PM",
    date: new Date(2024, 11, 7, 14, 1),
    deliveryStatus: "delivered" as const,
  },
  {
    id: "7",
    message: "Great discussion today!",
    isOwn: false,
    timestamp: "3:30 PM",
    date: new Date(2024, 11, 7, 15, 30),
    avatar: "https://i.pravatar.cc/150?img=2",
    unread: true,
  },
]

const groupChatMessages = [
  {
    id: "1",
    message: "Hey team! Ready for the sprint planning?",
    isOwn: false,
    timestamp: "10:00 AM",
    date: new Date(2024, 11, 7, 10, 0),
    avatar: "https://i.pravatar.cc/150?img=5",
    name: "Emily Rodriguez",
  },
  {
    id: "2",
    message: "Yes! I have some ideas to share",
    isOwn: false,
    timestamp: "10:01 AM",
    date: new Date(2024, 11, 7, 10, 1),
    avatar: "https://i.pravatar.cc/150?img=3",
    name: "Michael Chen",
  },
  {
    id: "3",
    message: "Looking forward to it!",
    isOwn: true,
    timestamp: "10:02 AM",
    date: new Date(2024, 11, 7, 10, 2),
    deliveryStatus: "read" as const,
  },
  {
    id: "4",
    message: "I'll share my screen",
    isOwn: false,
    timestamp: "10:03 AM",
    date: new Date(2024, 11, 7, 10, 3),
    avatar: "https://i.pravatar.cc/150?img=5",
    name: "Emily Rodriguez",
  },
  {
    id: "5",
    message: "Let's start with the backend tasks",
    isOwn: false,
    timestamp: "10:03 AM",
    date: new Date(2024, 11, 7, 10, 3),
    avatar: "https://i.pravatar.cc/150?img=5",
    name: "Emily Rodriguez",
  },
]

export const Default: Story = {
  args: {
    messages: sampleMessages,
  },
}

export const Empty: Story = {
  args: {
    messages: [],
    emptyMessage: "No messages yet",
  },
}

export const WithTyping: Story = {
  args: {
    messages: sampleMessages,
    isTyping: true,
    typingUser: {
      name: "Sarah Johnson",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
  },
}

export const CompactVariant: Story = {
  args: {
    messages: sampleMessages,
    variant: "compact",
  },
}

export const ComfortableVariant: Story = {
  args: {
    messages: sampleMessages,
    variant: "comfortable",
  },
}

export const WithoutDates: Story = {
  args: {
    messages: sampleMessages,
    showDates: false,
  },
}

export const WithoutAvatars: Story = {
  args: {
    messages: sampleMessages,
    showAvatars: false,
  },
}

export const WithoutGrouping: Story = {
  args: {
    messages: sampleMessages,
    groupMessages: false,
  },
}

export const GroupChat: Story = {
  args: {
    messages: groupChatMessages,
    showNames: true,
    participants: [
      { src: "https://i.pravatar.cc/150?img=5", alt: "Emily Rodriguez" },
      { src: "https://i.pravatar.cc/150?img=3", alt: "Michael Chen" },
      { src: "https://i.pravatar.cc/150?img=8", alt: "You" },
    ],
  },
}

export const WithUnreadDivider: Story = {
  args: {
    messages: longConversation,
    unreadDividerMessageId: "7",
  },
}

export const WithMediaAndLinks: Story = {
  args: {
    messages: [
      {
        id: "1",
        message: "Check out this beautiful view! 🌄",
        isOwn: true,
        timestamp: "11:00 AM",
        date: new Date(2024, 11, 7, 11, 0),
        deliveryStatus: "read" as const,
        mediaUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
        mediaType: "image" as const,
      },
      {
        id: "2",
        message: "Wow! Where is this?",
        isOwn: false,
        timestamp: "11:01 AM",
        date: new Date(2024, 11, 7, 11, 1),
        avatar: "https://i.pravatar.cc/150?img=4",
        reactions: [
          { emoji: "😍", count: 2, userReacted: true },
          { emoji: "🔥", count: 1, userReacted: false },
        ],
      },
      {
        id: "3",
        message: "Found this article about it",
        isOwn: true,
        timestamp: "11:05 AM",
        date: new Date(2024, 11, 7, 11, 5),
        deliveryStatus: "delivered" as const,
        linkPreview: {
          title: "Amazing Mountain Destinations",
          description: "Explore the world's most breathtaking mountain ranges",
          image: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400",
          url: "https://example.com/mountains",
        },
      },
    ],
  },
}

export const WithLoadMore: Story = {
  args: {
    messages: longConversation,
    hasMore: true,
    onLoadMore: () => console.log("Load more clicked"),
  },
}

export const Loading: Story = {
  args: {
    messages: sampleMessages,
    hasMore: true,
    loading: true,
  },
}

export const LongConversation: Story = {
  args: {
    messages: longConversation,
  },
}

export const WithAllFeatures: Story = {
  args: {
    messages: [
      ...longConversation,
      {
        id: "new-1",
        message: "Just saw your message!",
        isOwn: false,
        timestamp: "Just now",
        date: new Date(),
        avatar: "https://i.pravatar.cc/150?img=2",
        unread: true,
      },
    ],
    isTyping: true,
    typingUser: {
      name: "Alex Chen",
      avatar: "https://i.pravatar.cc/150?img=2",
    },
    hasMore: true,
    unreadDividerMessageId: "new-1",
  },
}

export const MixedDeliveryStates: Story = {
  args: {
    messages: [
      {
        id: "1",
        message: "This was read",
        isOwn: true,
        timestamp: "1:00 PM",
        date: new Date(2024, 11, 7, 13, 0),
        deliveryStatus: "read" as const,
      },
      {
        id: "2",
        message: "This was delivered",
        isOwn: true,
        timestamp: "1:01 PM",
        date: new Date(2024, 11, 7, 13, 1),
        deliveryStatus: "delivered" as const,
      },
      {
        id: "3",
        message: "This was sent",
        isOwn: true,
        timestamp: "1:02 PM",
        date: new Date(2024, 11, 7, 13, 2),
        deliveryStatus: "sent" as const,
      },
      {
        id: "4",
        message: "This is sending...",
        isOwn: true,
        timestamp: "1:03 PM",
        date: new Date(2024, 11, 7, 13, 3),
        deliveryStatus: "sending" as const,
      },
      {
        id: "5",
        message: "This failed to send",
        isOwn: true,
        timestamp: "1:04 PM",
        date: new Date(2024, 11, 7, 13, 4),
        deliveryStatus: "failed" as const,
      },
    ],
  },
}
