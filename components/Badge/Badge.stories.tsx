import type { Meta, StoryObj } from "@storybook/react"
import { Badge } from "./Badge"

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "An Apple-inspired badge component for displaying status, labels, or counts. Features smooth animations, multiple variants, and full accessibility support.",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    variant: "soft",
    intent: "primary",
    children: "Badge",
    size: "md",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["filled", "outline", "soft", "minimal"],
      description: "Visual style of the badge",
    },
    intent: {
      control: "select",
      options: ["primary", "secondary", "success", "warning", "error", "info", "purple", "pink", "teal"],
      description: "Semantic color intent",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size of the badge",
    },
  },
}

export default meta
type Story = StoryObj<typeof Badge>

/**
 * Default badge with soft variant
 */
export const Default: Story = {}

/**
 * Filled variant provides high contrast
 */
export const FilledVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge variant="filled" intent="primary">
        Primary
      </Badge>
      <Badge variant="filled" intent="secondary">
        Secondary
      </Badge>
      <Badge variant="filled" intent="success">
        Success
      </Badge>
      <Badge variant="filled" intent="warning">
        Warning
      </Badge>
      <Badge variant="filled" intent="error">
        Error
      </Badge>
      <Badge variant="filled" intent="info">
        Info
      </Badge>
      <Badge variant="filled" intent="purple">
        Purple
      </Badge>
      <Badge variant="filled" intent="pink">
        Pink
      </Badge>
      <Badge variant="filled" intent="teal">
        Teal
      </Badge>
    </div>
  ),
}

/**
 * Soft variant (Apple's preferred style)
 */
export const SoftVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge variant="soft" intent="primary">
        Primary
      </Badge>
      <Badge variant="soft" intent="secondary">
        Secondary
      </Badge>
      <Badge variant="soft" intent="success">
        Success
      </Badge>
      <Badge variant="soft" intent="warning">
        Warning
      </Badge>
      <Badge variant="soft" intent="error">
        Error
      </Badge>
      <Badge variant="soft" intent="info">
        Info
      </Badge>
      <Badge variant="soft" intent="purple">
        Purple
      </Badge>
      <Badge variant="soft" intent="pink">
        Pink
      </Badge>
      <Badge variant="soft" intent="teal">
        Teal
      </Badge>
    </div>
  ),
}

/**
 * Different sizes
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Badge size="sm">Small</Badge>
      <Badge size="md">Medium</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  ),
}

/**
 * Badges with icons
 */
export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Badge
        variant="soft"
        intent="primary"
        leftIcon={
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
          </svg>
        }
      >
        100 Visitors
      </Badge>
      <Badge
        variant="filled"
        intent="success"
        leftIcon={
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        }
      >
        Verified
      </Badge>
      <Badge
        variant="outline"
        intent="warning"
        rightIcon={
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
        }
      >
        Alert
      </Badge>
    </div>
  ),
}

/**
 * Real-world usage examples
 */
export const UsageExamples: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Status Indicators</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="soft" intent="success">
            Active
          </Badge>
          <Badge variant="soft" intent="warning">
            Pending
          </Badge>
          <Badge variant="soft" intent="error">
            Offline
          </Badge>
          <Badge variant="soft" intent="secondary">
            Archived
          </Badge>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Count Badges</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="filled" intent="primary" size="sm">
            3
          </Badge>
          <Badge variant="filled" intent="error" size="sm">
            99+
          </Badge>
          <Badge variant="soft" intent="info" size="sm">
            New
          </Badge>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Category Tags</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="minimal" intent="purple">
            Design
          </Badge>
          <Badge variant="minimal" intent="teal">
            Development
          </Badge>
          <Badge variant="minimal" intent="pink">
            Marketing
          </Badge>
        </div>
      </div>
    </div>
  ),
}
