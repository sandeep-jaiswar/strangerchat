import type { Meta, StoryObj } from "@storybook/react"
import { Avatar } from "./Avatar"

const meta: Meta<typeof Avatar> = {
  title: "Avatar",
  component: Avatar,
  args: {
    alt: "User",
    size: "md",
  },
  argTypes: {
    size: {
      options: ["xs", "sm", "md", "lg", "xl", "2xl"],
      control: { type: "select" },
    },
    status: {
      options: [undefined, "online", "offline", "busy", "away"],
      control: { type: "select" },
    },
  },
}

type Story = StoryObj<typeof Avatar>

export const Default: Story = {
  render: (args) => <Avatar {...args} src="https://i.pravatar.cc/80" />,
}

export const WithInitials: Story = {
  render: () => <Avatar initials="SC" alt="SC" />,
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar src="https://i.pravatar.cc/80" alt="User" size="xs" />
      <Avatar src="https://i.pravatar.cc/80" alt="User" size="sm" />
      <Avatar src="https://i.pravatar.cc/80" alt="User" size="md" />
      <Avatar src="https://i.pravatar.cc/80" alt="User" size="lg" />
      <Avatar src="https://i.pravatar.cc/80" alt="User" size="xl" />
      <Avatar src="https://i.pravatar.cc/80" alt="User" size="2xl" />
    </div>
  ),
}

export const WithStatus: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar src="https://i.pravatar.cc/80?img=1" alt="User" status="online" />
      <Avatar src="https://i.pravatar.cc/80?img=2" alt="User" status="offline" />
      <Avatar src="https://i.pravatar.cc/80?img=3" alt="User" status="busy" />
      <Avatar src="https://i.pravatar.cc/80?img=4" alt="User" status="away" />
    </div>
  ),
}

export const InitialsSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar initials="AB" alt="AB" size="xs" />
      <Avatar initials="AB" alt="AB" size="sm" />
      <Avatar initials="AB" alt="AB" size="md" />
      <Avatar initials="AB" alt="AB" size="lg" />
      <Avatar initials="AB" alt="AB" size="xl" />
      <Avatar initials="AB" alt="AB" size="2xl" />
    </div>
  ),
}

export const AvatarGrid: Story = {
  render: () => (
    <div className="grid grid-cols-6 gap-4">
      {Array.from({ length: 24 }, (_, i) => (
        <Avatar key={i} src={`https://i.pravatar.cc/80?img=${i + 1}`} alt={`User ${i + 1}`} size="lg" />
      ))}
    </div>
  ),
}

export default meta
