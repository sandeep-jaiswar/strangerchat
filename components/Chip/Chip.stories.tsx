import type { Meta, StoryObj } from "@storybook/react"
import React from "react"
import { Chip } from "./Chip"

const meta: Meta<typeof Chip> = {
  title: "Components/Chip",
  component: Chip,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Chip component for tags, filters, and selections. Features removable functionality and multiple visual styles.",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    variant: "soft",
    intent: "secondary",
    size: "md",
    children: "Chip",
    removable: true,
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["solid", "outline", "soft"],
      description: "Visual style variant",
    },
    intent: {
      control: "select",
      options: ["primary", "secondary", "success", "warning", "error"],
      description: "Semantic color intent",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size of the chip",
    },
    removable: {
      control: "boolean",
      description: "Show remove button",
    },
  },
}

export default meta
type Story = StoryObj<typeof Chip>

/**
 * Default chip with soft variant
 */

export const Default: Story = {}

/**
 * All variants
 */

export const Variants: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <h3 className="w-full text-sm font-semibold">Solid</h3>
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

      <div className="flex flex-wrap gap-2">
        <h3 className="w-full text-sm font-semibold">Outline</h3>
        <Chip variant="outline" intent="primary">
          Primary
        </Chip>
        <Chip variant="outline" intent="secondary">
          Secondary
        </Chip>
        <Chip variant="outline" intent="success">
          Success
        </Chip>
        <Chip variant="outline" intent="warning">
          Warning
        </Chip>
        <Chip variant="outline" intent="error">
          Error
        </Chip>
      </div>

      <div className="flex flex-wrap gap-2">
        <h3 className="w-full text-sm font-semibold">Soft</h3>
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
    </div>
  ),
}

/**
 * Different sizes
 */

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Chip size="sm">Small</Chip>
      <Chip size="md">Medium</Chip>
      <Chip size="lg">Large</Chip>
    </div>
  ),
}

/**
 * Non-removable chips
 */

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

/**
 * Real-world example: Tag selection
 */

export const TagSelection: Story = {
  render: () => {
    const [tags, setTags] = React.useState(["React", "TypeScript", "Tailwind"])

    return (
      <div className="w-96 rounded-2xl bg-white p-6 shadow-md">
        <h3 className="mb-4 text-lg font-semibold">Selected Tags</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Chip key={tag} onRemove={() => setTags(tags.filter((t) => t !== tag))}>
              {tag}
            </Chip>
          ))}
        </div>
      </div>
    )
  },
}
