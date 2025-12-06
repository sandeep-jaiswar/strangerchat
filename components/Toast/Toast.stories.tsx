import type { Meta, StoryObj } from "@storybook/react"
import React from "react"
import { Button } from "components/Button/Button"
import { Toast, ToastContainer } from "./Toast"

const meta: Meta<typeof Toast> = {
  title: "Components/Toast",
  component: Toast,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Lightweight iOS-style toast notifications following Apple's Human Interface Guidelines. Features auto-dismiss, swipe gestures, and smooth animations without external dependencies.",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    message: "Toast notification",
    intent: "primary",
    duration: 5000,
    showCloseButton: true,
  },
  argTypes: {
    intent: {
      control: "select",
      options: ["primary", "success", "warning", "error", "info"],
      description: "Visual style of the toast",
    },
    duration: {
      control: "number",
      description: "Auto-dismiss duration in ms (0 = no auto-dismiss)",
    },
    showCloseButton: {
      control: "boolean",
      description: "Show/hide close button",
    },
  },
}

export default meta
type Story = StoryObj<typeof Toast>

/**
 * Default toast with primary intent
 */
export const Default: Story = {
  render: (args) => {
    const [show, setShow] = React.useState(false)

    return (
      <div className="relative">
        <Button onClick={() => setShow(true)}>Show Toast</Button>

        {show && (
          <div className="fixed top-4 right-4">
            <Toast {...args} onClose={() => setShow(false)} />
          </div>
        )}
      </div>
    )
  },
}

/**
 * All intent variants with icons
 */
export const Intents: Story = {
  render: () => {
    const [activeToast, setActiveToast] = React.useState<string | null>(null)

    return (
      <>
        <div className="flex flex-wrap gap-3">
          <Button variant="bordered" onClick={() => setActiveToast("primary")}>
            Primary
          </Button>
          <Button variant="filled" intent="success" onClick={() => setActiveToast("success")}>
            Success
          </Button>
          <Button variant="filled" intent="warning" onClick={() => setActiveToast("warning")}>
            Warning
          </Button>
          <Button variant="filled" intent="danger" onClick={() => setActiveToast("error")}>
            Error
          </Button>
          <Button variant="filled" intent="info" onClick={() => setActiveToast("info")}>
            Info
          </Button>
        </div>

        <ToastContainer>
          {activeToast === "primary" && (
            <Toast
              message="Information"
              description="This is a primary toast notification"
              intent="primary"
              onClose={() => setActiveToast(null)}
            />
          )}
          {activeToast === "success" && (
            <Toast
              message="Success!"
              description="Your changes have been saved"
              intent="success"
              onClose={() => setActiveToast(null)}
            />
          )}
          {activeToast === "warning" && (
            <Toast
              message="Warning"
              description="Please review your input"
              intent="warning"
              onClose={() => setActiveToast(null)}
            />
          )}
          {activeToast === "error" && (
            <Toast
              message="Error"
              description="Something went wrong"
              intent="error"
              onClose={() => setActiveToast(null)}
            />
          )}
          {activeToast === "info" && (
            <Toast
              message="New Update"
              description="Version 2.0 is now available"
              intent="info"
              onClose={() => setActiveToast(null)}
            />
          )}
        </ToastContainer>
      </>
    )
  },
}

/**
 * Toast with description text
 */
export const WithDescription: Story = {
  render: () => {
    const [show, setShow] = React.useState(false)

    return (
      <>
        <Button onClick={() => setShow(true)}>Show Description Toast</Button>

        <ToastContainer>
          {show && (
            <Toast
              message="File Uploaded"
              description="document.pdf (2.4 MB) was successfully uploaded"
              intent="success"
              onClose={() => setShow(false)}
            />
          )}
        </ToastContainer>
      </>
    )
  },
}

/**
 * Toast without close button (click to dismiss)
 */
export const NoCloseButton: Story = {
  render: () => {
    const [show, setShow] = React.useState(false)

    return (
      <>
        <Button onClick={() => setShow(true)}>Show Toast</Button>

        <ToastContainer>
          {show && (
            <Toast
              message="Click anywhere to dismiss"
              intent="primary"
              showCloseButton={false}
              duration={0}
              onClose={() => setShow(false)}
            />
          )}
        </ToastContainer>
      </>
    )
  },
}

/**
 * Toast with custom icon
 */
export const CustomIcon: Story = {
  render: () => {
    const [show, setShow] = React.useState(false)

    return (
      <>
        <Button onClick={() => setShow(true)}>Show Custom Icon</Button>

        <ToastContainer>
          {show && (
            <Toast
              message="3 new messages"
              description="You have unread messages"
              intent="primary"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              }
              onClose={() => setShow(false)}
            />
          )}
        </ToastContainer>
      </>
    )
  },
}

/**
 * Toast without icon
 */
export const NoIcon: Story = {
  render: () => {
    const [show, setShow] = React.useState(false)

    return (
      <>
        <Button onClick={() => setShow(true)}>Show No Icon Toast</Button>

        <ToastContainer>
          {show && (
            <Toast message="Clean message without icon" intent="primary" icon={null} onClose={() => setShow(false)} />
          )}
        </ToastContainer>
      </>
    )
  },
}

/**
 * Multiple toasts in container
 */
export const MultipleToasts: Story = {
  render: () => {
    const [toasts, setToasts] = React.useState<
      Array<{ id: number; message: string; intent: "success" | "error" | "info" }>
    >([])

    const addToast = (intent: "success" | "error" | "info") => {
      const id = Date.now()
      setToasts((prev) => [
        ...prev,
        {
          id,
          message: `${intent.charAt(0).toUpperCase() + intent.slice(1)} notification`,
          intent,
        },
      ])
    }

    const removeToast = (id: number) => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }

    return (
      <>
        <div className="flex gap-3">
          <Button intent="success" onClick={() => addToast("success")}>
            Add Success
          </Button>
          <Button intent="danger" onClick={() => addToast("error")}>
            Add Error
          </Button>
          <Button intent="info" onClick={() => addToast("info")}>
            Add Info
          </Button>
        </div>

        <ToastContainer>
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              message={toast.message}
              intent={toast.intent}
              onClose={() => removeToast(toast.id)}
              duration={3000}
            />
          ))}
        </ToastContainer>
      </>
    )
  },
}

/**
 * Different container positions
 */
export const Positions: Story = {
  render: () => {
    const [position, setPosition] = React.useState<
      "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center"
    >("top-right")
    const [show, setShow] = React.useState(false)

    return (
      <>
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                setPosition("top-left")
                setShow(true)
              }}
            >
              Top Left
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setPosition("top-center")
                setShow(true)
              }}
            >
              Top Center
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setPosition("top-right")
                setShow(true)
              }}
            >
              Top Right
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                setPosition("bottom-left")
                setShow(true)
              }}
            >
              Bottom Left
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setPosition("bottom-center")
                setShow(true)
              }}
            >
              Bottom Center
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setPosition("bottom-right")
                setShow(true)
              }}
            >
              Bottom Right
            </Button>
          </div>
        </div>

        <ToastContainer position={position}>
          {show && (
            <Toast message={`Toast at ${position.replace("-", " ")}`} intent="primary" onClose={() => setShow(false)} />
          )}
        </ToastContainer>
      </>
    )
  },
}

/**
 * Real-world example: Form submission
 */
export const FormSubmission: Story = {
  render: () => {
    const [toast, setToast] = React.useState<{
      message: string
      description?: string
      intent: "success" | "error"
    } | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()

      // Simulate API call
      const success = Math.random() > 0.5

      if (success) {
        setToast({
          message: "Form submitted successfully",
          description: "We'll get back to you within 24 hours",
          intent: "success",
        })
      } else {
        setToast({
          message: "Submission failed",
          description: "Please check your connection and try again",
          intent: "error",
        })
      }
    }

    return (
      <>
        <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input type="email" className="w-full rounded-lg border px-3 py-2" required />
          </div>
          <Button type="submit">Submit Form</Button>
        </form>

        <ToastContainer>
          {toast && (
            <Toast
              message={toast.message}
              description={toast.description}
              intent={toast.intent}
              onClose={() => setToast(null)}
            />
          )}
        </ToastContainer>
      </>
    )
  },
}

/**
 * Real-world example: Action confirmations
 */
export const ActionConfirmations: Story = {
  render: () => {
    const [toasts, setToasts] = React.useState<
      Array<{ id: number; message: string; description: string; intent: "success" | "error" }>
    >([])

    const addConfirmation = (action: string, success: boolean) => {
      const id = Date.now()
      setToasts((prev) => [
        ...prev,
        {
          id,
          message: success ? `${action} successful` : `${action} failed`,
          description: success ? "The action completed successfully" : "Please try again",
          intent: success ? "success" : "error",
        },
      ])
    }

    const removeToast = (id: number) => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }

    return (
      <>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => addConfirmation("Save", true)}>Save (Success)</Button>
          <Button onClick={() => addConfirmation("Delete", true)}>Delete (Success)</Button>
          <Button onClick={() => addConfirmation("Upload", false)}>Upload (Error)</Button>
        </div>

        <ToastContainer>
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              message={toast.message}
              description={toast.description}
              intent={toast.intent}
              onClose={() => removeToast(toast.id)}
              duration={4000}
            />
          ))}
        </ToastContainer>
      </>
    )
  },
}

/**
 * Persistent toast (no auto-dismiss)
 */
export const PersistentToast: Story = {
  render: () => {
    const [show, setShow] = React.useState(false)

    return (
      <>
        <Button onClick={() => setShow(true)}>Show Persistent Toast</Button>

        <ToastContainer>
          {show && (
            <Toast
              message="Important Notice"
              description="This toast will not auto-dismiss. Click the X to close."
              intent="warning"
              duration={0}
              onClose={() => setShow(false)}
            />
          )}
        </ToastContainer>
      </>
    )
  },
}
