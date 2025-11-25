import type { Meta, StoryObj } from "@storybook/react"
import { Select } from "./Select"

const languageOptions = [
  { value: "auto", label: "Auto-detect" },
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
]

const colorOptions = [
  { value: "blue", label: "Default (Blue)" },
  { value: "green", label: "Green" },
  { value: "purple", label: "Purple" },
  { value: "red", label: "Red" },
]

const meta: Meta<typeof Select> = {
  title: "Select",
  component: Select,
  args: {
    options: languageOptions,
    placeholder: "Select an option",
    size: "md",
  },
  argTypes: {
    size: {
      options: ["sm", "md", "lg"],
      control: { type: "select" },
    },
  },
}

type Story = StoryObj<typeof Select>

export const Default: Story = {
  render: (args) => <Select {...args} />,
}

export const WithLabel: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Select options={languageOptions} label="Language" placeholder="Auto-detect" />
      <Select options={colorOptions} label="Chatbox color" defaultValue="blue" />
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Select options={languageOptions} size="sm" placeholder="Small" />
      <Select options={languageOptions} size="md" placeholder="Medium" />
      <Select options={languageOptions} size="lg" placeholder="Large" />
    </div>
  ),
}

export const WithDefaultValue: Story = {
  render: () => <Select options={languageOptions} defaultValue="auto" />,
}

export const Disabled: Story = {
  render: () => <Select options={languageOptions} disabled placeholder="Disabled" />,
}

export const WithDisabledOption: Story = {
  render: () => (
    <Select
      options={[
        { value: "active", label: "Active" },
        { value: "pending", label: "Pending", disabled: true },
        { value: "inactive", label: "Inactive" },
      ]}
      placeholder="Select status"
    />
  ),
}

export default meta
