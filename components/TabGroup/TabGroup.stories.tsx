import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { TabGroup, TabPanel } from "./TabGroup"

const tabs = [
  { value: "visitors", label: "Visitors" },
  { value: "globe", label: "Globe" },
  { value: "contacts", label: "Contacts" },
  { value: "campaigns", label: "Campaigns" },
  { value: "analytics", label: "Analytics" },
  { value: "plugins", label: "Plugins" },
]

const tabsWithBadges = [
  { value: "all", label: "All", badge: 24 },
  { value: "unread", label: "Unread", badge: 5 },
  { value: "archived", label: "Archived", badge: 0 },
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
  title: "Components/TabGroup",
  component: TabGroup,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "An Apple-inspired tab navigation component with smooth animations and multiple style variants. Features keyboard navigation, accessibility support, and dark mode compatibility.",
      },
    },
  },
  args: {
    tabs: tabs,
    variant: "default",
    size: "md",
  },
  argTypes: {
    tabs: {
      description: "Array of tab items with value, label, optional icon and badge",
    },
    variant: {
      control: "select",
      options: ["default", "pills", "underline", "enclosed", "solid", "buttons", "minimal"],
      description: "Visual style variant",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Tab size",
    },
    fullWidth: {
      control: "boolean",
      description: "Make tabs full width",
    },
    animated: {
      control: "boolean",
      description: "Enable animated indicator",
    },
    value: {
      control: "text",
      description: "Controlled active tab value",
    },
    defaultValue: {
      control: "text",
      description: "Default active tab value (uncontrolled)",
    },
    onValueChange: {
      action: "valueChanged",
      description: "Callback when active tab changes",
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

export const Enclosed: Story = {
  render: () => <TabGroup tabs={tabs.slice(0, 3)} variant="enclosed" />,
}

export const Solid: Story = {
  render: () => <TabGroup tabs={tabs.slice(0, 4)} variant="solid" />,
}

export const Buttons: Story = {
  render: () => <TabGroup tabs={tabs.slice(0, 3)} variant="buttons" />,
}

export const Minimal: Story = {
  render: () => <TabGroup tabs={tabs.slice(0, 4)} variant="minimal" />,
}

export const WithIcons: Story = {
  render: () => <TabGroup tabs={tabsWithIcons} variant="pills" />,
}

export const WithBadges: Story = {
  render: () => <TabGroup tabs={tabsWithBadges} variant="pills" />,
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

export const SmallSize: Story = {
  render: () => <TabGroup tabs={tabs.slice(0, 4)} variant="pills" size="sm" />,
}

export const LargeSize: Story = {
  render: () => <TabGroup tabs={tabs.slice(0, 4)} variant="pills" size="lg" />,
}

export const FullWidth: Story = {
  render: () => <TabGroup tabs={tabs.slice(0, 3)} variant="enclosed" fullWidth />,
}

export const WithoutAnimation: Story = {
  render: () => <TabGroup tabs={tabs.slice(0, 4)} variant="pills" animated={false} />,
}

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState("visitors")
    
    return (
      <div className="space-y-4">
        <TabGroup 
          tabs={tabs.slice(0, 4)} 
          variant="pills" 
          value={value}
          onValueChange={setValue}
        />
        <div className="text-sm text-neutral-600">
          Current tab: <strong>{value}</strong>
        </div>
        <div className="flex gap-2">
          {tabs.slice(0, 4).map((tab) => (
            <button
              key={tab.value}
              onClick={() => setValue(tab.value)}
              className="rounded-md bg-neutral-100 px-3 py-1 text-sm hover:bg-neutral-200"
            >
              Go to {tab.label}
            </button>
          ))}
        </div>
      </div>
    )
  },
}

export const WithContent: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState("visitors")
    
    return (
      <div className="space-y-4">
        <TabGroup 
          tabs={tabs.slice(0, 3)} 
          variant="default" 
          value={activeTab}
          onValueChange={setActiveTab}
        />
        <TabPanel value="visitors" activeValue={activeTab}>
          <div className="rounded-lg border border-neutral-200 p-6">
            <h3 className="mb-2 text-lg font-semibold">Visitors Content</h3>
            <p className="text-neutral-600">This is the visitors tab content.</p>
          </div>
        </TabPanel>
        <TabPanel value="globe" activeValue={activeTab}>
          <div className="rounded-lg border border-neutral-200 p-6">
            <h3 className="mb-2 text-lg font-semibold">Globe Content</h3>
            <p className="text-neutral-600">This is the globe tab content.</p>
          </div>
        </TabPanel>
        <TabPanel value="contacts" activeValue={activeTab}>
          <div className="rounded-lg border border-neutral-200 p-6">
            <h3 className="mb-2 text-lg font-semibold">Contacts Content</h3>
            <p className="text-neutral-600">This is the contacts tab content.</p>
          </div>
        </TabPanel>
      </div>
    )
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-neutral-700">Default</h3>
        <TabGroup tabs={tabs.slice(0, 4)} variant="default" />
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold text-neutral-700">Pills</h3>
        <TabGroup tabs={tabs.slice(0, 4)} variant="pills" />
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold text-neutral-700">Underline</h3>
        <TabGroup tabs={tabs.slice(0, 4)} variant="underline" />
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold text-neutral-700">Enclosed</h3>
        <TabGroup tabs={tabs.slice(0, 3)} variant="enclosed" />
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold text-neutral-700">Solid</h3>
        <TabGroup tabs={tabs.slice(0, 4)} variant="solid" />
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold text-neutral-700">Buttons</h3>
        <TabGroup tabs={tabs.slice(0, 3)} variant="buttons" />
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold text-neutral-700">Minimal</h3>
        <TabGroup tabs={tabs.slice(0, 4)} variant="minimal" />
      </div>
    </div>
  ),
}

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-neutral-700">Small</h3>
        <TabGroup tabs={tabs.slice(0, 4)} variant="pills" size="sm" />
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold text-neutral-700">Medium (default)</h3>
        <TabGroup tabs={tabs.slice(0, 4)} variant="pills" size="md" />
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold text-neutral-700">Large</h3>
        <TabGroup tabs={tabs.slice(0, 4)} variant="pills" size="lg" />
      </div>
    </div>
  ),
}

export const DarkTheme: Story = {
  render: () => (
    <div className="dark bg-neutral-950 p-8 space-y-8">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-neutral-300">Pills (Dark)</h3>
        <TabGroup tabs={tabs.slice(0, 4)} variant="pills" />
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold text-neutral-300">Default (Dark)</h3>
        <TabGroup tabs={tabs.slice(0, 4)} variant="default" />
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold text-neutral-300">Buttons (Dark)</h3>
        <TabGroup tabs={tabs.slice(0, 3)} variant="buttons" />
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold text-neutral-300">With Icons & Badges (Dark)</h3>
        <TabGroup tabs={tabsWithBadges} variant="solid" />
      </div>
    </div>
  ),
  parameters: {
    backgrounds: {
      default: "dark",
    },
  },
}

export const FullWidthExamples: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-neutral-700">Enclosed Full Width</h3>
        <TabGroup tabs={tabs.slice(0, 3)} variant="enclosed" fullWidth />
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold text-neutral-700">Solid Full Width</h3>
        <TabGroup tabs={tabs.slice(0, 4)} variant="solid" fullWidth />
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold text-neutral-700">Pills Full Width</h3>
        <TabGroup tabs={tabs.slice(0, 3)} variant="pills" fullWidth />
      </div>
    </div>
  ),
}

export const RichContent: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState("messages")
    
    const richTabs = [
      {
        value: "messages",
        label: "Messages",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        ),
        badge: 12,
      },
      {
        value: "calls",
        label: "Calls",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
        ),
        badge: 3,
      },
      {
        value: "settings",
        label: "Settings",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
      },
    ]
    
    return (
      <div className="space-y-4">
        <TabGroup tabs={richTabs} variant="pills" size="lg" value={activeTab} onValueChange={setActiveTab} />
        <div className="rounded-xl border border-neutral-200 p-6 bg-white">
          <TabPanel value="messages" activeValue={activeTab}>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Messages</h3>
            <p className="text-neutral-600">You have 12 unread messages.</p>
          </TabPanel>
          <TabPanel value="calls" activeValue={activeTab}>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Calls</h3>
            <p className="text-neutral-600">You have 3 missed calls.</p>
          </TabPanel>
          <TabPanel value="settings" activeValue={activeTab}>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Settings</h3>
            <p className="text-neutral-600">Configure your preferences.</p>
          </TabPanel>
        </div>
      </div>
    )
  },
}

export const KeyboardNavigation: Story = {
  render: () => (
    <div className="space-y-4">
      <TabGroup tabs={tabs.slice(0, 4)} variant="pills" />
      <div className="rounded-lg bg-neutral-100 p-4 text-sm text-neutral-700">
        <h4 className="font-semibold mb-2">Keyboard Navigation:</h4>
        <ul className="space-y-1">
          <li>• Arrow Left/Right: Navigate between tabs</li>
          <li>• Home: Jump to first tab</li>
          <li>• End: Jump to last tab</li>
          <li>• Tab: Move focus in/out</li>
        </ul>
      </div>
    </div>
  ),
}

export default meta
