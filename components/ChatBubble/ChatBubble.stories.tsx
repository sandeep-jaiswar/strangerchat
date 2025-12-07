import type { Meta, StoryObj } from "@storybook/react"
import { ChatBubble } from "./ChatBubble"

const meta: Meta<typeof ChatBubble> = {
  title: "Components/ChatBubble",
  component: ChatBubble,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "minimal", "elevated"],
      description: "Visual variant of the bubble",
    },
    deliveryStatus: {
      control: "select",
      options: ["sending", "sent", "delivered", "read", "failed"],
      description: "Message delivery status",
    },
    isOwn: {
      control: "boolean",
      description: "Whether this is the user's own message",
    },
    unread: {
      control: "boolean",
      description: "Whether the message is unread",
    },
    edited: {
      control: "boolean",
      description: "Whether the message was edited",
    },
    deleted: {
      control: "boolean",
      description: "Whether the message was deleted",
    },
    isTyping: {
      control: "boolean",
      description: "Show typing indicator",
    },
    isGrouped: {
      control: "boolean",
      description: "Part of a consecutive message group",
    },
  },
}

export default meta
type Story = StoryObj<typeof ChatBubble>

export const OwnMessage: Story = {
  args: {
    message: "Hey! How's it going?",
    isOwn: true,
    timestamp: "10:30 AM",
    deliveryStatus: "read",
  },
}

export const OtherMessage: Story = {
  args: {
    message: "Hey! I'm doing great, thanks for asking! 😊",
    isOwn: false,
    timestamp: "10:31 AM",
    avatar: "https://i.pravatar.cc/150?img=1",
    name: "Sarah Johnson",
    showAvatar: true,
  },
}

export const WithReactions: Story = {
  args: {
    message: "This is an amazing feature!",
    isOwn: false,
    timestamp: "10:32 AM",
    avatar: "https://i.pravatar.cc/150?img=2",
    reactions: [
      { emoji: "👍", count: 3, userReacted: false },
      { emoji: "❤️", count: 2, userReacted: true },
      { emoji: "🔥", count: 1, userReacted: false },
    ],
  },
}

export const WithReplyTo: Story = {
  args: {
    message: "Absolutely! I completely agree with that approach.",
    isOwn: true,
    timestamp: "10:35 AM",
    deliveryStatus: "delivered",
    replyTo: {
      name: "Alex Chen",
      message: "We should consider using React for this project",
    },
  },
}

export const WithMediaImage: Story = {
  args: {
    message: "Check out this beautiful sunset! 🌅",
    isOwn: true,
    timestamp: "11:00 AM",
    deliveryStatus: "sent",
    mediaUrl: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=400",
    mediaType: "image",
  },
}

export const WithLinkPreview: Story = {
  args: {
    message: "Check out this article!",
    isOwn: false,
    timestamp: "11:15 AM",
    avatar: "https://i.pravatar.cc/150?img=3",
    linkPreview: {
      title: "How to Build Better Apps",
      description: "A comprehensive guide to modern app development with best practices and real-world examples.",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400",
      url: "https://example.com/article",
    },
  },
}

export const EditedMessage: Story = {
  args: {
    message: "Actually, let me rephrase that...",
    isOwn: true,
    timestamp: "10:45 AM",
    deliveryStatus: "read",
    edited: true,
  },
}

export const DeletedMessage: Story = {
  args: {
    message: "This message was deleted",
    isOwn: false,
    timestamp: "10:50 AM",
    avatar: "https://i.pravatar.cc/150?img=4",
    deleted: true,
  },
}

export const UnreadMessage: Story = {
  args: {
    message: "Don't forget about our meeting tomorrow!",
    isOwn: false,
    timestamp: "Just now",
    avatar: "https://i.pravatar.cc/150?img=5",
    unread: true,
  },
}

export const TypingIndicator: Story = {
  args: {
    message: "",
    isOwn: false,
    avatar: "https://i.pravatar.cc/150?img=6",
    isTyping: true,
  },
}

export const GroupChat: Story = {
  args: {
    message: "That sounds like a great plan!",
    isOwn: false,
    timestamp: "2:30 PM",
    avatar: "https://i.pravatar.cc/150?img=7",
    name: "Emily Rodriguez",
    showName: true,
    showAvatar: true,
  },
}

export const GroupedMessages: Story = {
  render: () => (
    <div className="space-y-1">
      <ChatBubble
        message="Hey everyone!"
        isOwn={false}
        timestamp="2:00 PM"
        avatar="https://i.pravatar.cc/150?img=8"
        name="Michael Chen"
        showName={true}
        showAvatar={true}
      />
      <ChatBubble
        message="How's the project going?"
        isOwn={false}
        avatar="https://i.pravatar.cc/150?img=8"
        isGrouped={true}
        showAvatar={true}
      />
      <ChatBubble
        message="Let me know if you need any help"
        isOwn={false}
        timestamp="2:01 PM"
        avatar="https://i.pravatar.cc/150?img=8"
        isGrouped={true}
        showAvatar={true}
      />
    </div>
  ),
}

export const DeliveryStates: Story = {
  render: () => (
    <div className="space-y-4">
      <ChatBubble message="Sending..." isOwn={true} timestamp="3:00 PM" deliveryStatus="sending" />
      <ChatBubble message="Message sent" isOwn={true} timestamp="3:01 PM" deliveryStatus="sent" />
      <ChatBubble message="Message delivered" isOwn={true} timestamp="3:02 PM" deliveryStatus="delivered" />
      <ChatBubble message="Message read" isOwn={true} timestamp="3:03 PM" deliveryStatus="read" />
      <ChatBubble message="Failed to send" isOwn={true} timestamp="3:04 PM" deliveryStatus="failed" />
    </div>
  ),
}

export const Variants: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-sm font-semibold text-neutral-600">Default</h3>
        <ChatBubble
          message="Default variant with tail"
          isOwn={true}
          timestamp="10:00 AM"
          variant="default"
          deliveryStatus="read"
        />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold text-neutral-600">Minimal</h3>
        <ChatBubble
          message="Minimal variant without tail"
          isOwn={true}
          timestamp="10:01 AM"
          variant="minimal"
          deliveryStatus="delivered"
        />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold text-neutral-600">Elevated</h3>
        <ChatBubble
          message="Elevated variant with shadow"
          isOwn={true}
          timestamp="10:02 AM"
          variant="elevated"
          deliveryStatus="sent"
        />
      </div>
    </div>
  ),
}

export const Conversation: Story = {
  render: () => (
    <div className="mx-auto max-w-2xl space-y-2 rounded-xl bg-linear-to-b from-neutral-50 to-white p-6">
      <ChatBubble
        message="Hey! Are you free for coffee tomorrow?"
        isOwn={false}
        timestamp="9:00 AM"
        avatar="https://i.pravatar.cc/150?img=10"
        name="Sarah"
        showName={true}
        showAvatar={true}
      />
      <ChatBubble
        message="Yeah, sounds great! What time works for you?"
        isOwn={true}
        timestamp="9:05 AM"
        deliveryStatus="read"
      />
      <ChatBubble
        message="How about 10am at the usual spot?"
        isOwn={false}
        timestamp="9:06 AM"
        avatar="https://i.pravatar.cc/150?img=10"
        isGrouped={true}
        showAvatar={true}
      />
      <ChatBubble
        message="Perfect! See you then ☕"
        isOwn={true}
        timestamp="9:07 AM"
        deliveryStatus="delivered"
        reactions={[{ emoji: "👍", count: 1, userReacted: false }]}
      />
    </div>
  ),
}

export const LongMessage: Story = {
  args: {
    message:
      "This is a much longer message to demonstrate how the chat bubble handles multi-line content. It should wrap nicely and maintain good readability even with several lines of text. The bubble should expand to accommodate all the content while still maintaining the maximum width constraint for better conversation flow.",
    isOwn: false,
    timestamp: "3:30 PM",
    avatar: "https://i.pravatar.cc/150?img=11",
  },
}

export const AllFeatures: Story = {
  args: {
    message: "This is a message with all features enabled! 🚀",
    isOwn: false,
    timestamp: "4:00 PM",
    avatar: "https://i.pravatar.cc/150?img=12",
    name: "Jessica Williams",
    status: "online",
    showName: true,
    showAvatar: true,
    variant: "elevated",
    edited: true,
    reactions: [
      { emoji: "🎉", count: 5, userReacted: true },
      { emoji: "🚀", count: 3, userReacted: false },
    ],
    replyTo: {
      name: "David",
      message: "What do you think about the new features?",
    },
  },
}
