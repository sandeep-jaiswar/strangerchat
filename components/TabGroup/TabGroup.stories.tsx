import type { Meta, StoryObj } from "@storybook/react"
import { TabGroup } from "./TabGroup"

const tabs = [
  { value: "visitors", label: "Visitors" },
  { value: "globe", label: "Globe" },
  { value: "contacts", label: "Contacts" },
  { value: "campaigns", label: "Campaigns" },
  { value: "analytics", label: "Analytics" },
  { value: "plugins", label: "Plugins" },
]

const tabsWithIcons = [
  {
    value: "visitors",
    label: "Visitors",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
  },
  {
    value: "globe",
    label: "Globe",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    value: "contacts",
    label: "Contacts",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
      </svg>
    ),
  },
]

const meta: Meta<typeof TabGroup> = {
  title: "TabGroup",
  component: TabGroup,
  args: {
    tabs: tabs,
    variant: "default",
  },
  argTypes: {
    variant: {
      options: ["default", "pills", "underline"],
      control: { type: "select" },
    },
  },
}

type Story = StoryObj<typeof TabGroup>

export const Default: Story = {
  render: (args) => <TabGroup {...args} />,
}

export const Pills: Story = {
  render: () => <TabGroup tabs={tabs} variant="pills" />,
}

export const Underline: Story = {
  render: () => <TabGroup tabs={tabs} variant="underline" />,
}

export const WithIcons: Story = {
  render: () => <TabGroup tabs={tabsWithIcons} variant="pills" />,
}

export const WithDisabled: Story = {
  render: () => (
    <TabGroup
      tabs={[
        { value: "active", label: "Active" },
        { value: "disabled", label: "Disabled", disabled: true },
        { value: "other", label: "Other" },
      ]}
    />
  ),
}

export default meta
