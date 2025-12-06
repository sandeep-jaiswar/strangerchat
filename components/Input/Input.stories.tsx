import type { Meta, StoryObj } from "@storybook/react"
import React, { useState } from "react"

import { Input } from "./Input"

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "An Apple-inspired input component with smooth animations, icon support, and comprehensive state management. Features the iOS-standard 44px touch target.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
  args: {
    size: "md",
    fullWidth: true,
  },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size of the input (md = iOS 44px standard)",
    },
    label: {
      control: "text",
      description: "Label text displayed above the input",
    },
    helperText: {
      control: "text",
      description: "Helper text displayed below the input",
    },
    error: {
      control: "text",
      description: "Error message - applies error styling",
    },
    success: {
      control: "text",
      description: "Success message - applies success styling",
    },
    disabled: {
      control: "boolean",
      description: "Disabled state",
    },
    required: {
      control: "boolean",
      description: "Required field with asterisk",
    },
  },
}

export default meta
type Story = StoryObj<typeof Input>

/**
 * Default input with iOS-standard 44px height
 */
export const Default: Story = {
  render: () => {
    const [value, setValue] = useState("")
    return (
      <Input
        label="Username"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter your username"
        helperText="Choose a unique username"
      />
    )
  },
}

/**
 * All three sizes
 */
export const Sizes: Story = {
  render: () => {
    const [values, setValues] = useState({ sm: "", md: "", lg: "" })
    return (
      <div className="space-y-6">
        <Input
          size="sm"
          label="Small (32px)"
          value={values.sm}
          onChange={(e) => setValues({ ...values, sm: e.target.value })}
          placeholder="Compact input"
        />
        <Input
          size="md"
          label="Medium (44px - iOS Standard)"
          value={values.md}
          onChange={(e) => setValues({ ...values, md: e.target.value })}
          placeholder="Standard touch target"
        />
        <Input
          size="lg"
          label="Large (56px)"
          value={values.lg}
          onChange={(e) => setValues({ ...values, lg: e.target.value })}
          placeholder="Prominent input"
        />
      </div>
    )
  },
}

/**
 * Input with error state
 */
export const WithError: Story = {
  render: () => {
    const [value, setValue] = useState("invalid@")
    return (
      <Input
        label="Email"
        type="email"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="you@example.com"
        error="Please enter a valid email address"
        required
      />
    )
  },
}

/**
 * Input with success state
 */
export const WithSuccess: Story = {
  render: () => {
    const [value, setValue] = useState("john.doe@example.com")
    return (
      <Input
        label="Email"
        type="email"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="you@example.com"
        success="Email is available!"
      />
    )
  },
}

/**
 * Input with left icon
 */
export const WithLeftIcon: Story = {
  render: () => {
    const [value, setValue] = useState("")
    return (
      <Input
        label="Search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search messages..."
        leftIcon={
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        }
      />
    )
  },
}

/**
 * Input with right icon
 */
export const WithRightIcon: Story = {
  render: () => {
    const [value, setValue] = useState("secure123")
    return (
      <Input
        label="Password"
        type="password"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rightIcon={
          <svg className="h-5 w-5 text-[#34c759]" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        }
        success="Strong password"
      />
    )
  },
}

/**
 * Disabled state
 */
export const Disabled: Story = {
  render: () => (
    <Input label="Username" value="johndoe" onChange={() => {}} disabled helperText="This field cannot be edited" />
  ),
}

/**
 * Different input types
 */
export const InputTypes: Story = {
  render: () => {
    const [values, setValues] = useState({
      email: "",
      password: "",
      number: "",
      tel: "",
    })

    return (
      <div className="space-y-6">
        <Input
          label="Email"
          type="email"
          value={values.email}
          onChange={(e) => setValues({ ...values, email: e.target.value })}
          placeholder="you@example.com"
          leftIcon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          }
        />
        <Input
          label="Password"
          type="password"
          value={values.password}
          onChange={(e) => setValues({ ...values, password: e.target.value })}
          placeholder="••••••••"
          leftIcon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          }
        />
        <Input
          label="Phone"
          type="tel"
          value={values.tel}
          onChange={(e) => setValues({ ...values, tel: e.target.value })}
          placeholder="+1 (555) 000-0000"
          leftIcon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          }
        />
      </div>
    )
  },
}
