import type { Meta, StoryObj } from "@storybook/react"
import { ProgressBar } from "./ProgressBar"

const meta: Meta<typeof ProgressBar> = {
  title: "ProgressBar",
  component: ProgressBar,
  args: {
    value: 50,
    max: 100,
    intent: "primary",
    size: "md",
    showLabel: false,
  },
  argTypes: {
    intent: {
      options: ["primary", "success", "warning", "error"],
      control: { type: "select" },
    },
    size: {
      options: ["sm", "md", "lg"],
      control: { type: "select" },
    },
    value: {
      control: { type: "range", min: 0, max: 100 },
    },
  },
}

type Story = StoryObj<typeof ProgressBar>

export const Default: Story = {
  render: (args) => <ProgressBar {...args} />,
}

export const WithLabels: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-64">
      <div className="flex items-center gap-2">
        <ProgressBar value={50} max={100} showLabel labelPosition="left" />
      </div>
      <div className="flex items-center gap-2">
        <ProgressBar value={100} max={100} showLabel labelPosition="left" />
      </div>
      <div className="flex items-center gap-2">
        <ProgressBar value={25} max={100} showLabel labelPosition="left" />
      </div>
      <div className="flex items-center gap-2">
        <ProgressBar value={0} max={100} showLabel labelPosition="left" />
      </div>
    </div>
  ),
}

export const Intents: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-64">
      <ProgressBar value={50} intent="primary" />
      <ProgressBar value={100} intent="success" />
      <ProgressBar value={75} intent="warning" />
      <ProgressBar value={25} intent="error" />
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-64">
      <ProgressBar value={50} size="sm" />
      <ProgressBar value={50} size="md" />
      <ProgressBar value={50} size="lg" />
    </div>
  ),
}

export const DesignExample: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-48">
      <ProgressBar value={50} max={100} showLabel labelPosition="left" />
      <ProgressBar value={100} max={100} intent="primary" showLabel labelPosition="left" />
      <ProgressBar value={25} max={100} intent="error" showLabel labelPosition="left" />
      <ProgressBar value={0} max={100} showLabel labelPosition="left" />
    </div>
  ),
}

export default meta
