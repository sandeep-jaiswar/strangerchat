import type { Meta, StoryObj } from "@storybook/react"

import { Switch } from "./Switch"

const meta: Meta<typeof Switch> = {
  title: "Components/Switch",
  component: Switch,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "iOS-style toggle switch following Apple's Human Interface Guidelines. Features smooth spring animations and proper 44px touch targets.",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    intent: "primary",
    size: "md",
  },
  argTypes: {
    intent: {
      control: "select",
      options: ["primary", "secondary", "success", "danger", "warning"],
      description: "Semantic intent color",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size of the switch (md = iOS 44px touch target)",
    },
    labelPosition: {
      control: "select",
      options: ["left", "right"],
      description: "Position of the label relative to switch",
    },
    disabled: {
      control: "boolean",
      description: "Disabled state",
    },
  },
}

export default meta
type Story = StoryObj<typeof Switch>

/**
 * Default iOS-style toggle switch
 */
export const Default: Story = {
  args: {
    label: "Enable feature",
  },
}

/**
 * All available intent colors
 */
export const Intents: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Switch intent="primary" defaultChecked />
        <span className="text-sm text-gray-700">Primary (Apple Blue)</span>
      </div>
      <div className="flex items-center gap-4">
        <Switch intent="secondary" defaultChecked />
        <span className="text-sm text-gray-700">Secondary</span>
      </div>
      <div className="flex items-center gap-4">
        <Switch intent="success" defaultChecked />
        <span className="text-sm text-gray-700">Success (Green)</span>
      </div>
      <div className="flex items-center gap-4">
        <Switch intent="danger" defaultChecked />
        <span className="text-sm text-gray-700">Danger (Red)</span>
      </div>
      <div className="flex items-center gap-4">
        <Switch intent="warning" defaultChecked />
        <span className="text-sm text-gray-700">Warning (Orange)</span>
      </div>
    </div>
  ),
}

/**
 * Size variants: sm, md (iOS 44px), lg
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-8">
      <div className="flex flex-col items-center gap-2">
        <Switch size="sm" defaultChecked />
        <span className="text-xs text-gray-600">sm (28px)</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Switch size="md" defaultChecked />
        <span className="text-xs text-gray-600">md (44px iOS)</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Switch size="lg" defaultChecked />
        <span className="text-xs text-gray-600">lg (56px)</span>
      </div>
    </div>
  ),
}

/**
 * Switch with labels
 */
export const WithLabels: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Switch label="Enable notifications" />
      <Switch label="Dark mode" defaultChecked />
      <Switch label="Auto-save drafts" defaultChecked />
      <Switch label="Location services" />
    </div>
  ),
}

/**
 * Label positioning: left or right
 */
export const LabelPositions: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <Switch label="Notifications" labelPosition="right" />
      <Switch label="Dark mode" labelPosition="left" defaultChecked />
    </div>
  ),
}

/**
 * Switch with helper text
 */
export const WithHelperText: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-6">
      <Switch label="Push Notifications" helperText="Receive notifications about important updates and messages" />
      <Switch
        label="Location Services"
        helperText="Allow the app to access your location for better recommendations"
        defaultChecked
      />
      <Switch label="Analytics" helperText="Help us improve by sharing anonymous usage data" />
    </div>
  ),
}

/**
 * All states: unchecked, checked, disabled
 */
export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Switch label="Unchecked" />
      </div>
      <div className="flex items-center gap-4">
        <Switch label="Checked" defaultChecked />
      </div>
      <div className="flex items-center gap-4">
        <Switch label="Disabled Unchecked" disabled />
      </div>
      <div className="flex items-center gap-4">
        <Switch label="Disabled Checked" disabled defaultChecked />
      </div>
    </div>
  ),
}

/**
 * Settings panel example
 */
export const SettingsPanel: Story = {
  render: () => (
    <div className="max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Preferences</h3>
      <div className="flex flex-col gap-4">
        <Switch label="Push Notifications" helperText="Get notified about new messages" defaultChecked />
        <div className="border-t border-gray-200" />
        <Switch label="Email Notifications" helperText="Receive weekly digest emails" />
        <div className="border-t border-gray-200" />
        <Switch label="Dark Mode" helperText="Use dark theme for better night viewing" defaultChecked />
        <div className="border-t border-gray-200" />
        <Switch label="Auto-save" helperText="Automatically save your work every 5 minutes" defaultChecked />
      </div>
    </div>
  ),
}

/**
 * Privacy settings example
 */
export const PrivacySettings: Story = {
  render: () => (
    <div className="max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-1 text-lg font-semibold text-gray-900">Privacy & Security</h3>
      <p className="mb-4 text-sm text-gray-600">Manage your privacy preferences</p>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 rounded-lg bg-gray-50 p-4">
          <h4 className="text-sm font-semibold text-gray-900">Location</h4>
          <Switch label="Location Services" helperText="Allow apps to access your location" defaultChecked />
        </div>

        <div className="flex flex-col gap-3 rounded-lg bg-gray-50 p-4">
          <h4 className="text-sm font-semibold text-gray-900">Data Collection</h4>
          <Switch label="Analytics" helperText="Share anonymous usage data" />
          <Switch label="Crash Reports" helperText="Send crash reports to help improve the app" defaultChecked />
        </div>
      </div>
    </div>
  ),
}
