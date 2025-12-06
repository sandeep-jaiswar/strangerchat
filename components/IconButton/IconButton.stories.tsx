import type { Meta, StoryObj } from "@storybook/react"

import { IconButton } from "./IconButton"

const meta: Meta<typeof IconButton> = {
  title: "Components/IconButton",
  component: IconButton,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Icon-only button component following Apple's Human Interface Guidelines. Optimized for iOS 44px touch targets with smooth haptic feedback animations.",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    variant: "tinted",
    intent: "secondary",
    size: "md",
    shape: "circle",
    "aria-label": "Button",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["filled", "tinted", "bordered", "plain"],
      description: "Visual style variant",
    },
    intent: {
      control: "select",
      options: ["primary", "secondary", "success", "danger", "warning"],
      description: "Semantic intent color",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size of the button (md = iOS 44px touch target)",
    },
    shape: {
      control: "select",
      options: ["circle", "rounded"],
      description: "Shape of the button",
    },
    loading: {
      control: "boolean",
      description: "Loading state",
    },
    disabled: {
      control: "boolean",
      description: "Disabled state",
    },
  },
}

export default meta
type Story = StoryObj<typeof IconButton>

// Icon components for stories
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

const HeartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" />
  </svg>
)

/**
 * Default tinted secondary icon button (Apple's preferred style)
 */
export const Default: Story = {
  args: {
    "aria-label": "Add",
    children: <PlusIcon />,
  },
}

/**
 * All available variants
 */
export const Variants: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700">Filled</h3>
        <div className="flex gap-2">
          <IconButton variant="filled" intent="primary" aria-label="Primary">
            <PlusIcon />
          </IconButton>
          <IconButton variant="filled" intent="secondary" aria-label="Secondary">
            <PlusIcon />
          </IconButton>
          <IconButton variant="filled" intent="success" aria-label="Success">
            <PlusIcon />
          </IconButton>
          <IconButton variant="filled" intent="danger" aria-label="Danger">
            <PlusIcon />
          </IconButton>
          <IconButton variant="filled" intent="warning" aria-label="Warning">
            <PlusIcon />
          </IconButton>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700">Tinted</h3>
        <div className="flex gap-2">
          <IconButton variant="tinted" intent="primary" aria-label="Primary">
            <PlusIcon />
          </IconButton>
          <IconButton variant="tinted" intent="secondary" aria-label="Secondary">
            <PlusIcon />
          </IconButton>
          <IconButton variant="tinted" intent="success" aria-label="Success">
            <PlusIcon />
          </IconButton>
          <IconButton variant="tinted" intent="danger" aria-label="Danger">
            <PlusIcon />
          </IconButton>
          <IconButton variant="tinted" intent="warning" aria-label="Warning">
            <PlusIcon />
          </IconButton>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700">Bordered</h3>
        <div className="flex gap-2">
          <IconButton variant="bordered" intent="primary" aria-label="Primary">
            <PlusIcon />
          </IconButton>
          <IconButton variant="bordered" intent="secondary" aria-label="Secondary">
            <PlusIcon />
          </IconButton>
          <IconButton variant="bordered" intent="success" aria-label="Success">
            <PlusIcon />
          </IconButton>
          <IconButton variant="bordered" intent="danger" aria-label="Danger">
            <PlusIcon />
          </IconButton>
          <IconButton variant="bordered" intent="warning" aria-label="Warning">
            <PlusIcon />
          </IconButton>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700">Plain</h3>
        <div className="flex gap-2">
          <IconButton variant="plain" intent="primary" aria-label="Primary">
            <PlusIcon />
          </IconButton>
          <IconButton variant="plain" intent="secondary" aria-label="Secondary">
            <PlusIcon />
          </IconButton>
          <IconButton variant="plain" intent="success" aria-label="Success">
            <PlusIcon />
          </IconButton>
          <IconButton variant="plain" intent="danger" aria-label="Danger">
            <PlusIcon />
          </IconButton>
          <IconButton variant="plain" intent="warning" aria-label="Warning">
            <PlusIcon />
          </IconButton>
        </div>
      </div>
    </div>
  ),
}

/**
 * Size variants: sm, md (iOS 44px), lg
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <div className="flex flex-col items-center gap-2">
        <IconButton size="sm" aria-label="Small">
          <PlusIcon />
        </IconButton>
        <span className="text-xs text-gray-600">sm (36px)</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <IconButton size="md" aria-label="Medium">
          <PlusIcon />
        </IconButton>
        <span className="text-xs text-gray-600">md (44px iOS)</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <IconButton size="lg" aria-label="Large">
          <PlusIcon />
        </IconButton>
        <span className="text-xs text-gray-600">lg (56px)</span>
      </div>
    </div>
  ),
}

/**
 * Shape variants: circle (default) and rounded
 */
export const Shapes: Story = {
  render: () => (
    <div className="flex gap-6">
      <div className="flex flex-col items-center gap-2">
        <IconButton shape="circle" aria-label="Circle">
          <PlusIcon />
        </IconButton>
        <span className="text-xs text-gray-600">Circle</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <IconButton shape="rounded" aria-label="Rounded">
          <PlusIcon />
        </IconButton>
        <span className="text-xs text-gray-600">Rounded</span>
      </div>
    </div>
  ),
}

/**
 * Loading and disabled states
 */
export const States: Story = {
  render: () => (
    <div className="flex gap-4">
      <IconButton loading aria-label="Loading">
        <PlusIcon />
      </IconButton>
      <IconButton disabled aria-label="Disabled">
        <PlusIcon />
      </IconButton>
    </div>
  ),
}

/**
 * Real-world example: Action toolbar
 */
export const ActionToolbar: Story = {
  render: () => (
    <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
      <IconButton variant="plain" intent="secondary" aria-label="Edit">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </IconButton>
      <IconButton variant="plain" intent="secondary" aria-label="Copy">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      </IconButton>
      <IconButton variant="plain" intent="secondary" aria-label="Share">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      </IconButton>
      <div className="mx-1 w-px bg-gray-200" />
      <IconButton variant="plain" intent="danger" aria-label="Delete">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      </IconButton>
    </div>
  ),
}
