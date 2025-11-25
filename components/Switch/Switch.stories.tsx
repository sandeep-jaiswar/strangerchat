import type { Meta, StoryObj } from "@storybook/react"
import { Switch } from "./Switch"

const meta: Meta<typeof Switch> = {
  title: "Switch",
  component: Switch,
  args: {
    intent: "primary",
    size: "md",
  },
  argTypes: {
    intent: {
      options: ["primary", "success", "error"],
      control: { type: "select" },
    },
    size: {
      options: ["sm", "md", "lg"],
      control: { type: "select" },
    },
  },
}

type Story = StoryObj<typeof Switch>

export const Default: Story = {
  render: (args) => <Switch {...args} />,
}

export const WithLabel: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Switch label="Enable notifications" />
      <Switch label="Dark mode" defaultChecked />
      <Switch label="Auto-save" disabled />
    </div>
  ),
}

export const Intents: Story = {
  render: () => (
    <div className="flex gap-4">
      <Switch intent="primary" defaultChecked />
      <Switch intent="success" defaultChecked />
      <Switch intent="error" defaultChecked />
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Switch size="sm" defaultChecked />
      <Switch size="md" defaultChecked />
      <Switch size="lg" defaultChecked />
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Switch />
        <span className="text-sm">Unchecked</span>
      </div>
      <div className="flex items-center gap-4">
        <Switch defaultChecked />
        <span className="text-sm">Checked</span>
      </div>
      <div className="flex items-center gap-4">
        <Switch disabled />
        <span className="text-sm">Disabled Unchecked</span>
      </div>
      <div className="flex items-center gap-4">
        <Switch disabled defaultChecked />
        <span className="text-sm">Disabled Checked</span>
      </div>
    </div>
  ),
}

export default meta
