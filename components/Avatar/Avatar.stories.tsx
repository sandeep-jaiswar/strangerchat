import type { Meta, StoryObj } from "@storybook/react"
import { Avatar } from "./Avatar"

const meta: Meta<typeof Avatar> = {
  title: "Components/Avatar",
  component: Avatar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof Avatar>

export const Default: Story = {
  args: {
    src: "/img.png",
    alt: "User Avatar",
    size: "md",
  },
}

export const WithInitials: Story = {
  args: {
    alt: "John Doe",
    initials: "JD",
    size: "md",
  },
}

export const WithStatus: Story = {
  args: {
    src: "/img.png",
    alt: "User Avatar",
    size: "md",
    status: "online",
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar src="/img.png" alt="User" size="xs" />
      <Avatar src="/img.png" alt="User" size="sm" />
      <Avatar src="/img.png" alt="User" size="md" />
      <Avatar src="/img.png" alt="User" size="lg" />
      <Avatar src="/img.png" alt="User" size="xl" />
    </div>
  ),
}
