import type { Meta, StoryObj } from "@storybook/react"
import { Button } from "./Button"

const meta: Meta<typeof Button> = {
  title: "Button",
  component: Button,
  args: {
    variant: "solid",
    intent: "primary",
    children: "Button",
    size: "md",
    rounded: "md",
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
      options: ["sm", "md", "lg", "icon", "icon-sm", "icon-lg"],
      control: { type: "select" },
    },
    rounded: {
      options: ["sm", "md", "lg", "xl", "full"],
      control: { type: "select" },
    },
  },
}

type Story = StoryObj<typeof Button>

export const Default: Story = {
  render: (args) => <Button {...args} />,
}

export const Solid: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button variant="solid" intent="primary">
        Primary
      </Button>
      <Button variant="solid" intent="secondary">
        Secondary
      </Button>
      <Button variant="solid" intent="error">
        Error
      </Button>
    </div>
  ),
}

export const Outline: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button variant="outline" intent="primary">
        Primary
      </Button>
      <Button variant="outline" intent="secondary">
        Secondary
      </Button>
      <Button variant="outline" intent="error">
        Error
      </Button>
    </div>
  ),
}

export const Ghost: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button variant="ghost" intent="primary">
        Primary
      </Button>
      <Button variant="ghost" intent="secondary">
        Secondary
      </Button>
      <Button variant="ghost" intent="error">
        Error
      </Button>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
}

export const WithIcons: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button
        leftIcon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v8M8 12h8" />
          </svg>
        }
      >
        Add Item
      </Button>
      <Button
        variant="outline"
        intent="secondary"
        rightIcon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        }
      >
        Next
      </Button>
    </div>
  ),
}

export const IconOnly: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="icon-sm" variant="outline" intent="secondary" rounded="full">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      </Button>
      <Button size="icon" variant="solid" intent="primary" rounded="full">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      </Button>
      <Button size="icon-lg" variant="ghost" intent="secondary" rounded="full">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      </Button>
    </div>
  ),
}

export const Rounded: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button rounded="sm">Small Radius</Button>
      <Button rounded="md">Medium Radius</Button>
      <Button rounded="lg">Large Radius</Button>
      <Button rounded="xl">XL Radius</Button>
      <Button rounded="full">Full Radius</Button>
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button disabled>Disabled Solid</Button>
      <Button variant="outline" disabled>
        Disabled Outline
      </Button>
      <Button variant="ghost" disabled>
        Disabled Ghost
      </Button>
    </div>
  ),
}

export default meta
