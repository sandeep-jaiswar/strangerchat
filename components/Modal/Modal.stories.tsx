import type { Meta, StoryObj } from "@storybook/react"
import React from "react"
import { Button } from "components/Button/Button"
import { Modal } from "./Modal"

const meta: Meta<typeof Modal> = {
  title: "Components/Modal",
  component: Modal,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "iOS-style modal dialog following Apple's Human Interface Guidelines. Features smooth slide-up animations, backdrop blur, and comprehensive accessibility support.",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    open: true,
    title: "Modal Title",
    size: "md",
    showCloseButton: true,
    closeOnBackdropClick: true,
  },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg", "full"],
      description: "Size of the modal",
    },
    showCloseButton: {
      control: "boolean",
      description: "Show/hide close button",
    },
    closeOnBackdropClick: {
      control: "boolean",
      description: "Allow closing by clicking backdrop",
    },
  },
}

export default meta
type Story = StoryObj<typeof Modal>

/**
 * Default modal with title and content
 */
export const Default: Story = {
  render: (args) => {
    const [open, setOpen] = React.useState(false)

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Modal</Button>
        <Modal {...args} open={open} onOpenChange={setOpen}>
          <p className="text-gray-700">
            This is the modal content. It can contain any React components or HTML elements.
          </p>
        </Modal>
      </>
    )
  },
}

/**
 * All size variants comparison
 */
export const Sizes: Story = {
  render: () => {
    const [size, setSize] = React.useState<"sm" | "md" | "lg" | "full">("sm")
    const [open, setOpen] = React.useState(false)

    return (
      <>
        <div className="flex gap-3">
          <Button
            onClick={() => {
              setSize("sm")
              setOpen(true)
            }}
          >
            Small
          </Button>
          <Button
            onClick={() => {
              setSize("md")
              setOpen(true)
            }}
          >
            Medium
          </Button>
          <Button
            onClick={() => {
              setSize("lg")
              setOpen(true)
            }}
          >
            Large
          </Button>
          <Button
            onClick={() => {
              setSize("full")
              setOpen(true)
            }}
          >
            Full
          </Button>
        </div>

        <Modal
          open={open}
          onOpenChange={setOpen}
          size={size}
          title={`${size.toUpperCase()} Modal`}
          description={`This is a ${size} sized modal`}
        >
          <p className="text-gray-700">
            Modal content adapts to the selected size. Try different sizes to see how the modal scales.
          </p>
        </Modal>
      </>
    )
  },
}

/**
 * Modal with description text
 */
export const WithDescription: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false)

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Modal</Button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          title="Important Notice"
          description="Please read the following information carefully before proceeding."
        >
          <div className="space-y-4 text-gray-700">
            <p>This modal demonstrates how descriptions provide additional context in the header area.</p>
            <p>
              The description uses a smaller, lighter font to maintain visual hierarchy while providing helpful
              information.
            </p>
          </div>
        </Modal>
      </>
    )
  },
}

/**
 * Modal with footer actions
 */
export const WithFooter: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false)

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Modal</Button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          title="Confirm Action"
          footer={
            <>
              <Button variant="bordered" intent="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpen(false)}>Confirm</Button>
            </>
          }
        >
          <p className="text-gray-700">Are you sure you want to perform this action? This cannot be undone.</p>
        </Modal>
      </>
    )
  },
}

/**
 * Modal without close button
 */
export const NoCloseButton: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false)

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Modal</Button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          title="Required Action"
          showCloseButton={false}
          closeOnBackdropClick={false}
          footer={<Button onClick={() => setOpen(false)}>I Understand</Button>}
        >
          <p className="text-gray-700">
            This modal requires explicit user action. You can only close it using the button below or pressing Escape.
          </p>
        </Modal>
      </>
    )
  },
}

/**
 * Modal with scrollable content
 */
export const ScrollableContent: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false)

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Modal</Button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          title="Terms and Conditions"
          description="Please read carefully"
          footer={<Button onClick={() => setOpen(false)}>I Accept</Button>}
        >
          <div className="space-y-4 text-gray-700">
            {Array.from({ length: 20 }, (_, i) => (
              <p key={i}>
                {i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
                labore et dolore magna aliqua.
              </p>
            ))}
          </div>
        </Modal>
      </>
    )
  },
}

/**
 * Form modal example
 */
export const FormModal: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false)

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      setOpen(false)
    }

    return (
      <>
        <Button onClick={() => setOpen(true)}>Add User</Button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          title="Create New User"
          description="Fill in the details below"
          footer={
            <>
              <Button variant="bordered" intent="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" form="user-form">
                Create User
              </Button>
            </>
          }
        >
          <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                id="name"
                type="text"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#0071e3]/30 focus:outline-none"
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#0071e3]/30 focus:outline-none"
                placeholder="john@example.com"
                required
              />
            </div>
            <div>
              <label htmlFor="role" className="mb-1 block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="role"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#0071e3]/30 focus:outline-none"
                required
              >
                <option value="">Select role</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="guest">Guest</option>
              </select>
            </div>
          </form>
        </Modal>
      </>
    )
  },
}

/**
 * Confirmation dialog example
 */
export const ConfirmationDialog: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false)

    return (
      <>
        <Button intent="danger" onClick={() => setOpen(true)}>
          Delete Account
        </Button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          title="Delete Account"
          description="This action cannot be undone"
          size="sm"
          footer={
            <>
              <Button variant="bordered" intent="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button intent="danger" onClick={() => setOpen(false)}>
                Delete
              </Button>
            </>
          }
        >
          <div className="space-y-3 text-gray-700">
            <p className="font-medium">Are you absolutely sure?</p>
            <p className="text-sm">
              This will permanently delete your account and all associated data. All your projects, files, and settings
              will be lost forever.
            </p>
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-800">⚠️ Warning: This action is irreversible</p>
            </div>
          </div>
        </Modal>
      </>
    )
  },
}

/**
 * Multi-step wizard example
 */
export const WizardModal: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false)
    const [step, setStep] = React.useState(1)

    const handleNext = () => setStep((s) => Math.min(s + 1, 3))
    const handleBack = () => setStep((s) => Math.max(s - 1, 1))
    const handleComplete = () => {
      setOpen(false)
      setStep(1)
    }

    return (
      <>
        <Button onClick={() => setOpen(true)}>Start Setup</Button>
        <Modal
          open={open}
          onOpenChange={(isOpen) => {
            setOpen(isOpen)
            if (!isOpen) setStep(1)
          }}
          title={`Setup Wizard - Step ${step} of 3`}
          footer={
            <>
              <Button variant="bordered" intent="secondary" onClick={handleBack} disabled={step === 1}>
                Back
              </Button>
              {step < 3 ? (
                <Button onClick={handleNext}>Next</Button>
              ) : (
                <Button onClick={handleComplete}>Complete</Button>
              )}
            </>
          }
        >
          <div className="space-y-4">
            {/* Progress indicator */}
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? "bg-[#0071e3]" : "bg-gray-200"}`}
                />
              ))}
            </div>

            {/* Step content */}
            <div className="py-4">
              {step === 1 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Welcome!</h3>
                  <p className="text-gray-700">
                    Let's get you set up. This wizard will guide you through the initial configuration.
                  </p>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Choose Your Preferences</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm text-gray-700">Enable notifications</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm text-gray-700">Auto-save changes</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm text-gray-700">Dark mode</span>
                    </label>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">All Set! 🎉</h3>
                  <p className="text-gray-700">You're ready to go. Click "Complete" to finish the setup.</p>
                </div>
              )}
            </div>
          </div>
        </Modal>
      </>
    )
  },
}

/**
 * Loading state example
 */
export const LoadingModal: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false)
    const [loading, setLoading] = React.useState(false)

    const handleAction = async () => {
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setLoading(false)
      setOpen(false)
    }

    return (
      <>
        <Button onClick={() => setOpen(true)}>Process Action</Button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          title="Processing"
          showCloseButton={!loading}
          closeOnBackdropClick={!loading}
          footer={
            <Button onClick={handleAction} loading={loading} disabled={loading}>
              {loading ? "Processing..." : "Start Process"}
            </Button>
          }
        >
          <p className="text-gray-700">
            {loading ? "Please wait while we process your request..." : "Click the button below to start the process."}
          </p>
        </Modal>
      </>
    )
  },
}

/**
 * Image gallery modal
 */
export const GalleryModal: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false)

    return (
      <>
        <Button onClick={() => setOpen(true)}>View Image</Button>
        <Modal open={open} onOpenChange={setOpen} title="Image Preview" size="lg" bodyClassName="p-0">
          <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
            <svg className="h-24 w-24 text-white opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-600">sample-image.jpg • 1920x1080 • 2.4 MB</p>
          </div>
        </Modal>
      </>
    )
  },
}
