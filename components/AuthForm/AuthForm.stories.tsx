import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { AuthForm, type AuthFormData } from "./AuthForm"

const meta: Meta<typeof AuthForm> = {
  title: "Components/AuthForm",
  component: AuthForm,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["login", "register"],
      description: "Type of authentication form",
    },
    loading: {
      control: "boolean",
      description: "Loading state of the form",
    },
    showSocialLogin: {
      control: "boolean",
      description: "Show social login options",
    },
    error: {
      control: "text",
      description: "Error message to display",
    },
  },
}

export default meta
type Story = StoryObj<typeof AuthForm>

// Basic Login Form
export const Login: Story = {
  args: {
    type: "login",
    onSubmit: (data) => {
      console.log("Login data:", data)
      alert(`Login with: ${data.email}`)
    },
  },
}

// Basic Register Form
export const Register: Story = {
  args: {
    type: "register",
    onSubmit: (data) => {
      console.log("Register data:", data)
      alert(`Register with: ${data.email}`)
    },
  },
}

// Login with Error
export const LoginWithError: Story = {
  args: {
    type: "login",
    error: "Invalid email or password. Please try again.",
    onSubmit: (data) => console.log("Login data:", data),
  },
}

// Register with Error
export const RegisterWithError: Story = {
  args: {
    type: "register",
    error: "This email is already registered. Please use a different email.",
    onSubmit: (data) => console.log("Register data:", data),
  },
}

// Loading State
export const LoadingState: Story = {
  args: {
    type: "login",
    loading: true,
    onSubmit: (data) => console.log("Login data:", data),
  },
}

// Without Social Login
export const WithoutSocialLogin: Story = {
  args: {
    type: "login",
    showSocialLogin: false,
    onSubmit: (data) => console.log("Login data:", data),
  },
}

// With Forgot Password
export const WithForgotPassword: Story = {
  args: {
    type: "login",
    onSubmit: (data) => console.log("Login data:", data),
    onForgotPassword: () => alert("Forgot password clicked"),
  },
}

// Interactive Example with Mode Switching
export const Interactive: Story = {
  render: () => {
    const [mode, setMode] = useState<"login" | "register">("login")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string>()

    const handleSubmit = async (data: AuthFormData) => {
      setLoading(true)
      setError(undefined)

      // Simulate API call
      setTimeout(() => {
        console.log(`${mode} data:`, data)
        setLoading(false)

        // Simulate success
        alert(`${mode === "login" ? "Logged in" : "Registered"} successfully!\n\nEmail: ${data.email}`)
      }, 2000)
    }

    const handleForgotPassword = () => {
      alert("Password reset link sent to your email")
    }

    return (
      <div className="min-h-screen bg-neutral-50 p-8">
        <AuthForm
          type={mode}
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          onForgotPassword={mode === "login" ? handleForgotPassword : undefined}
          onSwitchMode={() => {
            setMode(mode === "login" ? "register" : "login")
            setError(undefined)
          }}
        />
      </div>
    )
  },
}

// Full Featured Form
export const FullFeatured: Story = {
  args: {
    type: "register",
    showSocialLogin: true,
    onSubmit: (data) => console.log("Submit:", data),
    onForgotPassword: () => console.log("Forgot password"),
    onSwitchMode: () => console.log("Switch mode"),
  },
}

// Mobile View
export const MobileView: Story = {
  args: {
    type: "login",
    onSubmit: (data) => console.log("Login data:", data),
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
}

// Dark Background Example
export const OnDarkBackground: Story = {
  args: {
    type: "login",
    onSubmit: (data) => console.log("Login data:", data),
    onSwitchMode: () => console.log("Switch mode"),
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-neutral-900 p-8">
        <div className="rounded-2xl bg-white p-8">
          <Story />
        </div>
      </div>
    ),
  ],
}
