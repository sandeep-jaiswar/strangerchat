import type { Meta, StoryObj } from "@storybook/react"
import React from "react"
import { Avatar } from "components/Avatar/Avatar"
import { Button } from "components/Button/Button"
import { IconButton } from "components/IconButton/IconButton"
import { Header } from "./Header"

const meta: Meta<typeof Header> = {
  title: "Components/Header",
  component: Header,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "An Apple-inspired header component with multiple variants. Features smooth blur effects, elegant animations, and proper accessibility. Perfect for navigation bars and page headers.",
      },
    },
  },
  argTypes: {
    title: {
      control: "text",
      description: "Main title text",
    },
    subtitle: {
      control: "text",
      description: "Optional subtitle or description",
    },
    variant: {
      control: "select",
      options: ["default", "translucent", "solid", "elevated"],
      description: "Visual style variant",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "xl"],
      description: "Header height",
    },
    sticky: {
      control: "boolean",
      description: "Make header sticky on scroll",
    },
    centered: {
      control: "boolean",
      description: "Center align title and subtitle",
    },
    loading: {
      control: "boolean",
      description: "Show loading spinner",
    },
    badge: {
      control: "text",
      description: "Badge count or text next to title",
    },
    maxWidth: {
      control: "select",
      options: ["sm", "md", "lg", "xl", "2xl", "full"],
      description: "Maximum width container",
    },
  },
}

export default meta
type Story = StoryObj<typeof Header>

// Helper icons
const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

/**
 * Default header with title and actions.
 */
export const Default: Story = {
  args: {
    title: "Messages",
    actions: (
      <>
        <Button variant="tinted" intent="primary" size="sm">
          New Chat
        </Button>
        <IconButton variant="plain" aria-label="Settings">
          <SettingsIcon />
        </IconButton>
      </>
    ),
  },
}

/**
 * Header with subtitle providing additional context.
 */
export const WithSubtitle: Story = {
  args: {
    title: "Messages",
    subtitle: "3 active conversations",
    actions: (
      <Button variant="tinted" intent="primary" size="sm">
        New Chat
      </Button>
    ),
  },
}

/**
 * Translucent header with blur effect - perfect for modern, elegant interfaces.
 */
export const Translucent: Story = {
  args: {
    title: "StrangerChat",
    subtitle: "Connect with people worldwide",
    variant: "translucent",
    actions: (
      <Button variant="filled" intent="primary" size="sm">
        Sign In
      </Button>
    ),
  },
}

/**
 * Solid header without transparency.
 */
export const Solid: Story = {
  args: {
    title: "Settings",
    subtitle: "Manage your account",
    variant: "solid",
  },
}

/**
 * Elevated header with shadow for depth.
 */
export const Elevated: Story = {
  args: {
    title: "Dashboard",
    subtitle: "Welcome back!",
    variant: "elevated",
    actions: (
      <IconButton variant="tinted" intent="primary" aria-label="Add">
        <PlusIcon />
      </IconButton>
    ),
  },
}

/**
 * Header with back button for navigation.
 */
export const WithBackButton: Story = {
  args: {
    title: "Chat Details",
    subtitle: "Group settings and members",
    onBack: () => alert("Going back!"),
    actions: (
      <IconButton variant="plain" aria-label="Settings">
        <SettingsIcon />
      </IconButton>
    ),
  },
}

/**
 * Header with search button.
 */
export const WithSearch: Story = {
  args: {
    title: "Friends",
    subtitle: "42 friends online",
    onSearch: () => alert("Opening search!"),
    actions: (
      <IconButton variant="tinted" intent="primary" aria-label="Add friend">
        <PlusIcon />
      </IconButton>
    ),
  },
}

/**
 * Header with mobile menu button.
 */
export const WithMenuButton: Story = {
  args: {
    title: "StrangerChat",
    onMenu: () => alert("Opening menu!"),
    actions: (
      <Button variant="tinted" intent="primary" size="sm">
        Sign Up
      </Button>
    ),
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
}

/**
 * Centered header - great for landing pages.
 */
export const Centered: Story = {
  args: {
    title: "Welcome",
    subtitle: "Start your journey today",
    centered: true,
    variant: "translucent",
  },
}

/**
 * Header with badge showing notification count.
 */
export const WithBadge: Story = {
  args: {
    title: "Notifications",
    badge: "12",
    actions: (
      <IconButton variant="plain" aria-label="Mark all as read">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </IconButton>
    ),
  },
}

/**
 * Loading state with spinner.
 */
export const Loading: Story = {
  args: {
    title: "Loading",
    subtitle: "Please wait...",
    loading: true,
  },
}

/**
 * Small header for compact layouts.
 */
export const Small: Story = {
  args: {
    title: "Compact Header",
    size: "sm",
    actions: (
      <Button variant="tinted" intent="primary" size="sm">
        Action
      </Button>
    ),
  },
}

/**
 * Large header for emphasis.
 */
export const Large: Story = {
  args: {
    title: "Large Header",
    subtitle: "Extra emphasis",
    size: "xl",
    variant: "elevated",
  },
}

/**
 * Sticky header that stays at the top on scroll.
 */
export const Sticky: Story = {
  args: {
    title: "Sticky Navigation",
    subtitle: "Scroll to see it stick",
    sticky: true,
    variant: "translucent",
    actions: (
      <Button variant="tinted" intent="primary" size="sm">
        Action
      </Button>
    ),
  },
  decorators: [
    (Story) => (
      <div>
        <Story />
        <div className="h-[200vh] p-8 space-y-4">
          <p className="text-neutral-600">Scroll down to see the sticky header in action!</p>
          {Array.from({ length: 50 }).map((_, i) => (
            <p key={i} className="text-neutral-500">
              Content line {i + 1}
            </p>
          ))}
        </div>
      </div>
    ),
  ],
}

/**
 * Header with custom left content (logo/avatar).
 */
export const WithLeftContent: Story = {
  args: {
    title: "John Doe",
    subtitle: "Software Engineer",
    leftContent: <Avatar alt="John Doe" initials="JD" size="sm" />,
    actions: (
      <Button variant="tinted" intent="primary" size="sm">
        Follow
      </Button>
    ),
  },
}

/**
 * Full-featured header with all options.
 */
export const FullFeatured: Story = {
  args: {
    title: "Messages",
    subtitle: "5 unread",
    badge: "5",
    variant: "translucent",
    sticky: true,
    onBack: () => alert("Back"),
    onSearch: () => alert("Search"),
    actions: (
      <>
        <IconButton variant="tinted" intent="primary" aria-label="New message">
          <PlusIcon />
        </IconButton>
        <IconButton variant="plain" aria-label="Settings">
          <SettingsIcon />
        </IconButton>
      </>
    ),
  },
}

/**
 * Multiple headers showing different variants.
 */
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold text-neutral-700 mb-2 px-4">Default</h3>
        <Header title="Default Header" subtitle="Standard appearance" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-neutral-700 mb-2 px-4">Translucent</h3>
        <Header title="Translucent Header" subtitle="With blur effect" variant="translucent" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-neutral-700 mb-2 px-4">Solid</h3>
        <Header title="Solid Header" subtitle="No transparency" variant="solid" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-neutral-700 mb-2 px-4">Elevated</h3>
        <Header title="Elevated Header" subtitle="With shadow" variant="elevated" />
      </div>
    </div>
  ),
}

/**
 * Multiple sizes comparison.
 */
export const AllSizes: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold text-neutral-700 mb-2 px-4">Small (h-12)</h3>
        <Header title="Small Header" size="sm" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-neutral-700 mb-2 px-4">Medium (h-14)</h3>
        <Header title="Medium Header" size="md" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-neutral-700 mb-2 px-4">Large (h-16)</h3>
        <Header title="Large Header" size="lg" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-neutral-700 mb-2 px-4">Extra Large (h-20)</h3>
        <Header title="Extra Large Header" size="xl" />
      </div>
    </div>
  ),
}

/**
 * Interactive demo with all controls.
 */
export const Interactive: Story = {
  args: {
    title: "Interactive Header",
    subtitle: "Try the controls!",
    variant: "default",
    size: "lg",
    sticky: false,
    centered: false,
    loading: false,
    onBack: () => console.log("Back clicked"),
    onSearch: () => console.log("Search clicked"),
    onMenu: () => console.log("Menu clicked"),
    actions: (
      <>
        <Button variant="tinted" intent="primary" size="sm">
          Action
        </Button>
        <IconButton variant="plain" aria-label="Settings">
          <SettingsIcon />
        </IconButton>
      </>
    ),
  },
}

/**
 * Mobile layout example.
 */
export const Mobile: Story = {
  args: {
    title: "Mobile View",
    subtitle: "Optimized for small screens",
    size: "md",
    onMenu: () => alert("Menu"),
    onSearch: () => alert("Search"),
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
}

/**
 * Dark theme example.
 */
export const DarkTheme: Story = {
  args: {
    title: "Dark Header",
    subtitle: "Looks great in dark mode",
    variant: "translucent",
    actions: (
      <Button variant="tinted" intent="primary" size="sm">
        Action
      </Button>
    ),
  },
  parameters: {
    backgrounds: {
      default: "dark",
    },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
}
