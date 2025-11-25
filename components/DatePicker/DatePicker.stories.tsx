import type { Meta, StoryObj } from "@storybook/react"
import { DatePicker } from "./DatePicker"

const meta: Meta<typeof DatePicker> = {
  title: "DatePicker",
  component: DatePicker,
  args: {
    placeholder: "Pick a date",
  },
}

type Story = StoryObj<typeof DatePicker>

export const Default: Story = {
  render: (args) => <DatePicker {...args} />,
}

export const WithValue: Story = {
  render: () => <DatePicker value={new Date(2022, 9, 16)} />,
}

export const Disabled: Story = {
  render: () => <DatePicker disabled placeholder="Disabled" />,
}

export const CustomPlaceholder: Story = {
  render: () => <DatePicker placeholder="Select date..." />,
}

export default meta
