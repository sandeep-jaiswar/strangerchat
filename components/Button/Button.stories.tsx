import type { Meta, StoryObj } from "@storybook/react"
import React from "react"
import { Button } from "./Button"

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Apple-inspired button component following Human Interface Guidelines. Features multiple variants, intents, and the iOS-standard 44px touch target for accessibility.",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    variant: "tinted",
    intent: "secondary",
    size: "md",
    children: "Button",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["filled", "tinted", "bordered", "plain"],
      description: "Visual style variant",
    },
    intent: {
      control: "select",
      options: ["primary", "secondary", "success", "danger", "warning", "info"],
      description: "Semantic color intent",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size (md = iOS 44px touch target)",
    },
    loading: {
      control: "boolean",
      description: "Loading state with spinner",
    },
    disabled: {
      control: "boolean",
      description: "Disabled state",
    },
    fullWidth: {
      control: "boolean",
      description: "Full width button",
    },
  },
}

export default meta
type Story = StoryObj<typeof Button>

/**
 * Default tinted button - Apple's preferred style
 */
export const Default: Story = {}

/**
 * All available variants
 */
export const Variants: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700">Filled</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="filled" intent="primary">
            Primary
          </Button>
          <Button variant="filled" intent="secondary">
            Secondary
          </Button>
          <Button variant="filled" intent="success">
            Success
          </Button>
          <Button variant="filled" intent="danger">
            Danger
          </Button>
          <Button variant="filled" intent="warning">
            Warning
          </Button>
          <Button variant="filled" intent="info">
            Info
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700">Tinted (Apple's preferred)</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="tinted" intent="primary">
            Primary
          </Button>
          <Button variant="tinted" intent="secondary">
            Secondary
          </Button>
          <Button variant="tinted" intent="success">
            Success
          </Button>
          <Button variant="tinted" intent="danger">
            Danger
          </Button>
          <Button variant="tinted" intent="warning">
            Warning
          </Button>
          <Button variant="tinted" intent="info">
            Info
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700">Bordered</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="bordered" intent="primary">
            Primary
          </Button>
          <Button variant="bordered" intent="secondary">
            Secondary
          </Button>
          <Button variant="bordered" intent="success">
            Success
          </Button>
          <Button variant="bordered" intent="danger">
            Danger
          </Button>
          <Button variant="bordered" intent="warning">
            Warning
          </Button>
          <Button variant="bordered" intent="info">
            Info
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700">Plain</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="plain" intent="primary">
            Primary
          </Button>
          <Button variant="plain" intent="secondary">
            Secondary
          </Button>
          <Button variant="plain" intent="success">
            Success
          </Button>
          <Button variant="plain" intent="danger">
            Danger
          </Button>
          <Button variant="plain" intent="warning">
            Warning
          </Button>
          <Button variant="plain" intent="info">
            Info
          </Button>
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
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium (iOS 44px)</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
}

/**
 * With icons
 */
export const WithIcons: Story = {
  render: () => {
    const PlusIcon = () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14M5 12h14" />
      </svg>
    )

    const ArrowIcon = () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    )

    return (
      <div className="flex flex-wrap gap-4">
        <Button leftIcon={<PlusIcon />}>Add Item</Button>
        <Button rightIcon={<ArrowIcon />} variant="bordered">
          Continue
        </Button>
        <Button leftIcon={<PlusIcon />} rightIcon={<ArrowIcon />} intent="primary" variant="filled">
          Both Icons
        </Button>
      </div>
    )
  },
}

/**
 * Loading states
 */
export const Loading: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button loading>Loading</Button>
      <Button variant="filled" intent="primary" loading>
        Processing
      </Button>
      <Button variant="bordered" loading>
        Please wait
      </Button>
    </div>
  ),
}

/**
 * Disabled states
 */
export const Disabled: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button disabled>Disabled</Button>
      <Button variant="filled" intent="primary" disabled>
        Disabled
      </Button>
      <Button variant="bordered" disabled>
        Disabled
      </Button>
    </div>
  ),
}

/**
 * Full width example
 */
export const FullWidth: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <Button fullWidth>Full Width Button</Button>
      <Button variant="filled" intent="primary" fullWidth>
        Primary Action
      </Button>
      <Button variant="bordered" fullWidth>
        Secondary Action
      </Button>
    </div>
  ),
}

/**
 * Real-world example: Form actions
 */
export const FormActions: Story = {
  render: () => (
    <div className="w-96 rounded-2xl bg-white p-6 shadow-md">
      <h3 className="mb-4 text-lg font-semibold">Confirm Action</h3>
      <p className="mb-6 text-sm text-gray-600">Are you sure you want to proceed?</p>
      <div className="flex gap-3">
        <Button variant="bordered" intent="secondary" fullWidth>
          Cancel
        </Button>
        <Button variant="filled" intent="primary" fullWidth>
          Confirm
        </Button>
      </div>
    </div>
  ),
}
