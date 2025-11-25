import type { Meta, StoryObj } from "@storybook/react"
import { Badge } from "./Badge"

const meta: Meta<typeof Badge> = {
  title: "Badge",
  component: Badge,
  args: {
    variant: "solid",
    intent: "primary",
    children: "Badge",
    size: "md",
  },
  argTypes: {
    variant: {
      options: ["solid", "outline", "soft"],
      control: { type: "select" },
    },
    intent: {
      options: ["primary", "secondary", "success", "warning", "error"],
      control: { type: "select" },
    },
    size: {
      options: ["sm", "md", "lg"],
      control: { type: "select" },
    },
  },
}

type Story = StoryObj<typeof Badge>

export const Default: Story = {
  render: (args) => <Badge {...args} />,
}

export const SolidVariants: Story = {
  render: () => (
    <div className="flex gap-4">
      <Badge variant="solid" intent="primary">Primary</Badge>
      <Badge variant="solid" intent="secondary">Secondary</Badge>
      <Badge variant="solid" intent="success">Success</Badge>
      <Badge variant="solid" intent="warning">Warning</Badge>
      <Badge variant="solid" intent="error">Error</Badge>
    </div>
  ),
}

export const OutlineVariants: Story = {
  render: () => (
    <div className="flex gap-4">
      <Badge variant="outline" intent="primary">Primary</Badge>
      <Badge variant="outline" intent="secondary">Secondary</Badge>
      <Badge variant="outline" intent="success">Success</Badge>
      <Badge variant="outline" intent="warning">Warning</Badge>
      <Badge variant="outline" intent="error">Error</Badge>
    </div>
  ),
}

export const SoftVariants: Story = {
  render: () => (
    <div className="flex gap-4">
      <Badge variant="soft" intent="primary">Primary</Badge>
      <Badge variant="soft" intent="secondary">Secondary</Badge>
      <Badge variant="soft" intent="success">Success</Badge>
      <Badge variant="soft" intent="warning">Warning</Badge>
      <Badge variant="soft" intent="error">Error</Badge>
    </div>
  ),
}

export const WithIcons: Story = {
  render: () => (
    <div className="flex gap-4">
      <Badge
        leftIcon={
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
          </svg>
        }
      >
        Visitors
      </Badge>
      <Badge
        variant="outline"
        intent="primary"
        leftIcon={
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
          </svg>
        }
      >
        Contacts
      </Badge>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Badge size="sm">Small</Badge>
      <Badge size="md">Medium</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  ),
}

export default meta
