import type { Meta, StoryObj } from "@storybook/react"
import { Calendar } from "./Calendar"

const meta: Meta<typeof Calendar> = {
  title: "Calendar",
  component: Calendar,
  args: {},
}

type Story = StoryObj<typeof Calendar>

export const Default: Story = {
  render: (args) => <Calendar {...args} />,
}

export const WithDefaultValue: Story = {
  render: () => <Calendar defaultValue={new Date(2022, 9, 16)} />,
}

export const WithSelectedDate: Story = {
  render: () => <Calendar value={new Date(2022, 9, 6)} />,
}

export default meta
