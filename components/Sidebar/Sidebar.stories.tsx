import type { Meta, StoryObj } from "@storybook/react"
import React, { useState } from "react"
import { Avatar } from "components/Avatar/Avatar"
import { IconButton } from "components/IconButton/IconButton"
import { Sidebar, type SidebarItem, type SidebarSection } from "./Sidebar"

const meta: Meta<typeof Sidebar> = {
  title: "Components/Sidebar",
  component: Sidebar,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "An Apple-inspired sidebar navigation with elegant design and smooth interactions. Features collapsible sections, active states, badges, and multiple variants.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "translucent", "solid", "elevated"],
      description: "Visual style variant",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "xl"],
      description: "Sidebar width",
    },
    collapsed: {
      control: "boolean",
      description: "Collapsed state",
    },
    showCollapseButton: {
      control: "boolean",
      description: "Show collapse toggle button",
    },
  },
  decorators: [
    (Story) => (
      <div className="flex h-screen">
        <Story />
        <div className="flex-1 bg-white p-8 dark:bg-neutral-950">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Main Content</h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            This is the main content area. The sidebar is on the left.
          </p>
        </div>
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Sidebar>

// Helper icons
const ChatIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
)

const FriendsIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
)

const SettingsIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const NotificationIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
)

const HomeIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
)

const basicItems: SidebarItem[] = [
  { id: "chats", label: "Chats", icon: <ChatIcon />, onClick: () => console.log("Chats"), badge: 12 },
  { id: "friends", label: "Friends", icon: <FriendsIcon />, onClick: () => console.log("Friends"), badge: 5 },
  { id: "settings", label: "Settings", icon: <SettingsIcon />, onClick: () => console.log("Settings") },
]

const sectionsData: SidebarSection[] = [
  {
    title: "Main",
    items: [
      { id: "home", label: "Home", icon: <HomeIcon />, onClick: () => console.log("Home") },
      { id: "chats", label: "Chats", icon: <ChatIcon />, onClick: () => console.log("Chats"), badge: 12 },
      { id: "friends", label: "Friends", icon: <FriendsIcon />, onClick: () => console.log("Friends"), badge: 5 },
    ],
  },
  {
    title: "Other",
    items: [
      {
        id: "notifications",
        label: "Notifications",
        icon: <NotificationIcon />,
        onClick: () => console.log("Notifications"),
        badge: 3,
      },
      { id: "settings", label: "Settings", icon: <SettingsIcon />, onClick: () => console.log("Settings") },
    ],
  },
]

/**
 * Default sidebar with simple items.
 */
export const Default: Story = {
  args: {
    items: basicItems,
    activeItemId: "chats",
  },
}

/**
 * Sidebar with sections and headers.
 */
export const WithSections: Story = {
  args: {
    sections: sectionsData,
    activeItemId: "chats",
  },
}

/**
 * Translucent sidebar with blur effect.
 */
export const Translucent: Story = {
  args: {
    items: basicItems,
    activeItemId: "friends",
    variant: "translucent",
  },
}

/**
 * Solid sidebar without transparency.
 */
export const Solid: Story = {
  args: {
    items: basicItems,
    activeItemId: "chats",
    variant: "solid",
  },
}

/**
 * Elevated sidebar with shadow.
 */
export const Elevated: Story = {
  args: {
    items: basicItems,
    activeItemId: "settings",
    variant: "elevated",
  },
}

/**
 * Small sidebar for compact layouts.
 */
export const Small: Story = {
  args: {
    items: basicItems,
    activeItemId: "chats",
    size: "sm",
  },
}

/**
 * Large sidebar with more space.
 */
export const Large: Story = {
  args: {
    items: basicItems,
    activeItemId: "friends",
    size: "lg",
  },
}

/**
 * Extra large sidebar.
 */
export const ExtraLarge: Story = {
  args: {
    items: basicItems,
    activeItemId: "chats",
    size: "xl",
  },
}

/**
 * Collapsed sidebar showing only icons.
 */
export const Collapsed: Story = {
  args: {
    items: basicItems,
    activeItemId: "chats",
    collapsed: true,
  },
}

/**
 * Sidebar with header and footer.
 */
export const WithHeaderAndFooter: Story = {
  args: {
    items: basicItems,
    activeItemId: "chats",
    header: (
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0071e3] font-bold text-white">S</div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-semibold text-neutral-900 dark:text-white">StrangerChat</h2>
          <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">v2.0</p>
        </div>
      </div>
    ),
    footer: (
      <div className="flex items-center gap-3">
        <Avatar alt="John Doe" initials="JD" size="sm" status="online" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">John Doe</p>
          <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">john@example.com</p>
        </div>
        <IconButton variant="plain" size="sm" aria-label="User menu">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </IconButton>
      </div>
    ),
  },
}

/**
 * Sidebar with collapsible sections.
 */
export const CollapsibleSections: Story = {
  args: {
    sections: [
      {
        title: "Favorites",
        collapsible: true,
        items: [
          { id: "home", label: "Home", icon: <HomeIcon />, onClick: () => console.log("Home") },
          { id: "chats", label: "Chats", icon: <ChatIcon />, onClick: () => console.log("Chats"), badge: 12 },
        ],
      },
      {
        title: "Recent",
        collapsible: true,
        defaultCollapsed: true,
        items: [
          { id: "friends", label: "Friends", icon: <FriendsIcon />, onClick: () => console.log("Friends") },
          { id: "settings", label: "Settings", icon: <SettingsIcon />, onClick: () => console.log("Settings") },
        ],
      },
    ],
    activeItemId: "chats",
  },
}

/**
 * Sidebar with disabled items.
 */
export const WithDisabledItems: Story = {
  args: {
    items: [
      { id: "chats", label: "Chats", icon: <ChatIcon />, onClick: () => console.log("Chats"), badge: 12 },
      {
        id: "friends",
        label: "Friends",
        icon: <FriendsIcon />,
        onClick: () => console.log("Friends"),
        disabled: true,
      },
      { id: "settings", label: "Settings", icon: <SettingsIcon />, onClick: () => console.log("Settings") },
    ],
    activeItemId: "chats",
  },
}

/**
 * Sidebar with dividers between items.
 */
export const WithDividers: Story = {
  args: {
    items: [
      { id: "home", label: "Home", icon: <HomeIcon />, onClick: () => console.log("Home") },
      {
        id: "chats",
        label: "Chats",
        icon: <ChatIcon />,
        onClick: () => console.log("Chats"),
        badge: 12,
        divider: true,
      },
      { id: "friends", label: "Friends", icon: <FriendsIcon />, onClick: () => console.log("Friends"), badge: 5 },
      {
        id: "notifications",
        label: "Notifications",
        icon: <NotificationIcon />,
        onClick: () => console.log("Notifications"),
        divider: true,
      },
      { id: "settings", label: "Settings", icon: <SettingsIcon />, onClick: () => console.log("Settings") },
    ],
    activeItemId: "chats",
  },
}

/**
 * Interactive sidebar with collapse toggle.
 */
export const Interactive: Story = {
  render: (args) => {
    const [collapsed, setCollapsed] = useState(false)
    const [activeId, setActiveId] = useState("chats")

    const items: SidebarItem[] = [
      {
        id: "home",
        label: "Home",
        icon: <HomeIcon />,
        onClick: () => setActiveId("home"),
      },
      {
        id: "chats",
        label: "Chats",
        icon: <ChatIcon />,
        onClick: () => setActiveId("chats"),
        badge: 12,
      },
      {
        id: "friends",
        label: "Friends",
        icon: <FriendsIcon />,
        onClick: () => setActiveId("friends"),
        badge: 5,
      },
      {
        id: "notifications",
        label: "Notifications",
        icon: <NotificationIcon />,
        onClick: () => setActiveId("notifications"),
        badge: 3,
      },
      {
        id: "settings",
        label: "Settings",
        icon: <SettingsIcon />,
        onClick: () => setActiveId("settings"),
      },
    ]

    return (
      <div className="flex h-screen">
        <Sidebar
          {...args}
          items={items}
          activeItemId={activeId}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          showCollapseButton
        />
        <div className="flex-1 bg-white p-8 dark:bg-neutral-950">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {items.find((i) => i.id === activeId)?.label}
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Active page: {activeId}. Click items or toggle the sidebar.
          </p>
        </div>
      </div>
    )
  },
  args: {
    variant: "translucent",
  },
}

/**
 * All variants comparison.
 */
export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-8 p-8">
      <div>
        <h3 className="mb-4 text-sm font-semibold text-neutral-700">Default</h3>
        <Sidebar items={basicItems} activeItemId="chats" />
      </div>
      <div>
        <h3 className="mb-4 text-sm font-semibold text-neutral-700">Translucent</h3>
        <Sidebar items={basicItems} activeItemId="friends" variant="translucent" />
      </div>
      <div>
        <h3 className="mb-4 text-sm font-semibold text-neutral-700">Solid</h3>
        <Sidebar items={basicItems} activeItemId="settings" variant="solid" />
      </div>
      <div>
        <h3 className="mb-4 text-sm font-semibold text-neutral-700">Elevated</h3>
        <Sidebar items={basicItems} activeItemId="chats" variant="elevated" />
      </div>
    </div>
  ),
  decorators: [],
}

/**
 * All sizes comparison.
 */
export const AllSizes: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-8 p-8">
      <div>
        <h3 className="mb-4 text-sm font-semibold text-neutral-700">Small (w-52)</h3>
        <Sidebar items={basicItems} activeItemId="chats" size="sm" />
      </div>
      <div>
        <h3 className="mb-4 text-sm font-semibold text-neutral-700">Medium (w-64)</h3>
        <Sidebar items={basicItems} activeItemId="friends" size="md" />
      </div>
      <div>
        <h3 className="mb-4 text-sm font-semibold text-neutral-700">Large (w-72)</h3>
        <Sidebar items={basicItems} activeItemId="settings" size="lg" />
      </div>
      <div>
        <h3 className="mb-4 text-sm font-semibold text-neutral-700">Extra Large (w-80)</h3>
        <Sidebar items={basicItems} activeItemId="chats" size="xl" />
      </div>
    </div>
  ),
  decorators: [],
}

/**
 * Dark theme example.
 */
export const DarkTheme: Story = {
  args: {
    items: basicItems,
    activeItemId: "chats",
    variant: "translucent",
    header: (
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0071e3] font-bold text-white">S</div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-semibold text-white">StrangerChat</h2>
        </div>
      </div>
    ),
  },
  parameters: {
    backgrounds: {
      default: "dark",
    },
  },
  decorators: [
    (Story) => (
      <div className="dark flex h-screen">
        <Story />
        <div className="flex-1 bg-neutral-950 p-8">
          <h1 className="text-2xl font-bold text-white">Main Content</h1>
          <p className="mt-2 text-neutral-400">Dark theme sidebar example.</p>
        </div>
      </div>
    ),
  ],
}
