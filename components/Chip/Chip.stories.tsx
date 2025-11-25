import type { Meta, StoryObj } from "@storybook/react"
import { Chip } from "./Chip"

const meta: Meta<typeof Chip> = {
  title: "Chip",
  component: Chip,
  args: {
    variant: "soft",
    intent: "secondary",
    children: "Cameron",
    size: "md",
    removable: true,
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
    removable: {
      control: { type: "boolean" },
    },
  },
}

type Story = StoryObj<typeof Chip>

export const Default: Story = {
  render: (args) => <Chip {...args} />,
}

export const MultipleChips: Story = {
  render: () => (
    <div className="flex gap-2">
      <Chip>Cameron</Chip>
      <Chip>Lora</Chip>
      <Chip>Alex</Chip>
    </div>
  ),
}

export const SolidVariants: Story = {
  render: () => (
    <div className="flex gap-2">
      <Chip variant="solid" intent="primary">
        Primary
      </Chip>
      <Chip variant="solid" intent="secondary">
        Secondary
      </Chip>
      <Chip variant="solid" intent="success">
        Success
      </Chip>
      <Chip variant="solid" intent="warning">
        Warning
      </Chip>
      <Chip variant="solid" intent="error">
        Error
      </Chip>
    </div>
  ),
}

export const OutlineVariants: Story = {
  render: () => (
    <div className="flex gap-2">
      <Chip variant="outline" intent="primary">
        Chat
      </Chip>
      <Chip variant="outline" intent="warning">
        Pending
      </Chip>
    </div>
  ),
}

export const SoftVariants: Story = {
  render: () => (
    <div className="flex gap-2">
      <Chip variant="soft" intent="primary">
        Primary
      </Chip>
      <Chip variant="soft" intent="secondary">
        Secondary
      </Chip>
      <Chip variant="soft" intent="success">
        Success
      </Chip>
      <Chip variant="soft" intent="warning">
        Warning
      </Chip>
      <Chip variant="soft" intent="error">
        Error
      </Chip>
    </div>
  ),
}

export const NonRemovable: Story = {
  render: () => (
    <div className="flex gap-2">
      <Chip removable={false}>Read Only</Chip>
      <Chip removable={false} variant="solid" intent="primary">
        Fixed
      </Chip>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Chip size="sm">Small</Chip>
      <Chip size="md">Medium</Chip>
      <Chip size="lg">Large</Chip>
    </div>
  ),
}

export default meta
