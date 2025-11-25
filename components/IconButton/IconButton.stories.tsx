import type { Meta, StoryObj } from "@storybook/react"
import { IconButton } from "./IconButton"

const meta: Meta<typeof IconButton> = {
  title: "IconButton",
  component: IconButton,
  args: {
    variant: "ghost",
    intent: "secondary",
    size: "md",
    rounded: "md",
    "aria-label": "Button",
  },
  argTypes: {
    variant: {
      options: ["solid", "outline", "ghost"],
      control: { type: "select" },
    },
    intent: {
      options: ["primary", "secondary", "error"],
      control: { type: "select" },
    },
    size: {
      options: ["sm", "md", "lg"],
      control: { type: "select" },
    },
    rounded: {
      options: ["md", "lg", "full"],
      control: { type: "select" },
    },
  },
}

type Story = StoryObj<typeof IconButton>

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14M5 12h14" />
  </svg>
)

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
)

const EditIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

const DeleteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
)

export const Default: Story = {
  render: (args) => (
    <IconButton {...args}>
      <PlusIcon />
    </IconButton>
  ),
}

export const GhostVariants: Story = {
  render: () => (
    <div className="flex gap-4">
      <IconButton variant="ghost" intent="secondary" aria-label="Search">
        <SearchIcon />
      </IconButton>
      <IconButton variant="ghost" intent="primary" aria-label="Edit">
        <EditIcon />
      </IconButton>
      <IconButton variant="ghost" intent="error" aria-label="Delete">
        <DeleteIcon />
      </IconButton>
    </div>
  ),
}

export const SolidVariants: Story = {
  render: () => (
    <div className="flex gap-4">
      <IconButton variant="solid" intent="secondary" aria-label="Search">
        <SearchIcon />
      </IconButton>
      <IconButton variant="solid" intent="primary" aria-label="Add">
        <PlusIcon />
      </IconButton>
      <IconButton variant="solid" intent="error" aria-label="Delete">
        <DeleteIcon />
      </IconButton>
    </div>
  ),
}

export const OutlineVariants: Story = {
  render: () => (
    <div className="flex gap-4">
      <IconButton variant="outline" intent="secondary" aria-label="Search">
        <SearchIcon />
      </IconButton>
      <IconButton variant="outline" intent="primary" aria-label="Add">
        <PlusIcon />
      </IconButton>
      <IconButton variant="outline" intent="error" aria-label="Delete">
        <DeleteIcon />
      </IconButton>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <IconButton size="sm" aria-label="Small">
        <PlusIcon />
      </IconButton>
      <IconButton size="md" aria-label="Medium">
        <PlusIcon />
      </IconButton>
      <IconButton size="lg" aria-label="Large">
        <PlusIcon />
      </IconButton>
    </div>
  ),
}

export const RoundedFull: Story = {
  render: () => (
    <div className="flex gap-4">
      <IconButton variant="outline" intent="secondary" rounded="full" aria-label="Add">
        <PlusIcon />
      </IconButton>
      <IconButton variant="solid" intent="primary" rounded="full" aria-label="Add">
        <PlusIcon />
      </IconButton>
    </div>
  ),
}

export const ActionButtons: Story = {
  render: () => (
    <div className="flex gap-2">
      <IconButton variant="ghost" intent="secondary" aria-label="Edit">
        <EditIcon />
      </IconButton>
      <IconButton variant="ghost" intent="secondary" aria-label="Copy">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      </IconButton>
      <IconButton variant="ghost" intent="secondary" aria-label="Emoji">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      </IconButton>
      <IconButton variant="ghost" intent="error" aria-label="Delete">
        <DeleteIcon />
      </IconButton>
    </div>
  ),
}

export default meta
