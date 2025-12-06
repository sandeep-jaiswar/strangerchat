import type { Meta, StoryObj } from "@storybook/react"
import React from "react"
import { Button } from "components/Button/Button"
import { DotsLoader, Loader } from "./Loader"

const meta: Meta<typeof Loader> = {
  title: "Components/Loader",
  component: Loader,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Lightweight loading indicators following Apple's Human Interface Guidelines. Includes spinner and dots variants with smooth animations.",
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
      options: ["primary", "secondary", "success", "warning", "danger", "white"],
      description: "Visual style of the loader",
    },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl"],
      description: "Size of the loader",
    },
    label: {
      control: "text",
      description: "Optional label text",
    },
    overlay: {
      control: "boolean",
      description: "Show as full-page overlay",
    },
  },
}

export default meta
type Story = StoryObj<typeof Loader>

/**
 * Default spinner loader
 */
export const Default: Story = {
  render: (args) => <Loader {...args} />,
}

/**
 * All intent variants
 */
export const Intents: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <Loader intent="primary" />
        <span className="text-xs text-gray-600">Primary</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Loader intent="secondary" />
        <span className="text-xs text-gray-600">Secondary</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Loader intent="success" />
        <span className="text-xs text-gray-600">Success</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Loader intent="warning" />
        <span className="text-xs text-gray-600">Warning</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Loader intent="danger" />
        <span className="text-xs text-gray-600">Danger</span>
      </div>
      <div className="flex flex-col items-center gap-2 rounded-lg bg-gray-900 p-4">
        <Loader intent="white" />
        <span className="text-xs text-white">White</span>
      </div>
    </div>
  ),
}

/**
 * All size variants
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-8">
      <div className="flex flex-col items-center gap-2">
        <Loader size="xs" />
        <span className="text-xs text-gray-600">XS</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Loader size="sm" />
        <span className="text-xs text-gray-600">SM</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Loader size="md" />
        <span className="text-xs text-gray-600">MD</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Loader size="lg" />
        <span className="text-xs text-gray-600">LG</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Loader size="xl" />
        <span className="text-xs text-gray-600">XL</span>
      </div>
    </div>
  ),
}

/**
 * Loader with label
 */
export const WithLabel: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Loader label="Loading..." />
      <Loader label="Please wait..." intent="primary" size="lg" />
      <Loader label="Processing your request..." intent="success" />
    </div>
  ),
}

/**
 * Overlay mode for full-page loading
 */
export const OverlayMode: Story = {
  render: () => {
    const [loading, setLoading] = React.useState(false)

    return (
      <>
        <Button onClick={() => setLoading(true)}>Show Overlay Loader</Button>

        {loading && <Loader overlay label="Loading content..." size="lg" />}

        {loading && (
          <div className="fixed right-4 bottom-4 z-[300]">
            <Button onClick={() => setLoading(false)}>Close</Button>
          </div>
        )}
      </>
    )
  },
}

/**
 * Dots loader variant
 */
export const DotsVariant: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <DotsLoader />
      <DotsLoader intent="success" />
      <DotsLoader intent="warning" size="lg" />
    </div>
  ),
}

/**
 * Dots loader - all intents
 */
export const DotsIntents: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <DotsLoader intent="primary" />
        <span className="text-xs text-gray-600">Primary</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <DotsLoader intent="secondary" />
        <span className="text-xs text-gray-600">Secondary</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <DotsLoader intent="success" />
        <span className="text-xs text-gray-600">Success</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <DotsLoader intent="warning" />
        <span className="text-xs text-gray-600">Warning</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <DotsLoader intent="danger" />
        <span className="text-xs text-gray-600">Danger</span>
      </div>
      <div className="flex flex-col items-center gap-2 rounded-lg bg-gray-900 p-4">
        <DotsLoader intent="white" />
        <span className="text-xs text-white">White</span>
      </div>
    </div>
  ),
}

/**
 * Dots loader - all sizes
 */
export const DotsSizes: Story = {
  render: () => (
    <div className="flex items-end gap-8">
      <div className="flex flex-col items-center gap-2">
        <DotsLoader size="xs" />
        <span className="text-xs text-gray-600">XS</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <DotsLoader size="sm" />
        <span className="text-xs text-gray-600">SM</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <DotsLoader size="md" />
        <span className="text-xs text-gray-600">MD</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <DotsLoader size="lg" />
        <span className="text-xs text-gray-600">LG</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <DotsLoader size="xl" />
        <span className="text-xs text-gray-600">XL</span>
      </div>
    </div>
  ),
}

/**
 * Real-world example: Button with loader
 */
export const ButtonWithLoader: Story = {
  render: () => {
    const [loading, setLoading] = React.useState(false)

    const handleClick = async () => {
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setLoading(false)
    }

    return (
      <Button onClick={handleClick} disabled={loading}>
        {loading ? (
          <>
            <Loader size="sm" intent="white" />
            <span>Loading...</span>
          </>
        ) : (
          "Click to Load"
        )}
      </Button>
    )
  },
}

/**
 * Real-world example: Card loading state
 */
export const CardLoading: Story = {
  render: () => {
    const [loading, setLoading] = React.useState(true)

    return (
      <div className="w-80 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader size="lg" label="Loading content..." />
          </div>
        ) : (
          <div>
            <h3 className="mb-2 text-lg font-semibold">Card Title</h3>
            <p className="text-gray-600">Card content goes here...</p>
          </div>
        )}

        <div className="mt-4">
          <Button size="sm" variant="bordered" onClick={() => setLoading(!loading)}>
            Toggle Loading
          </Button>
        </div>
      </div>
    )
  },
}

/**
 * Real-world example: Inline loader in text
 */
export const InlineLoader: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <p className="flex items-center gap-2">
        <DotsLoader size="sm" />
        <span>Processing payment...</span>
      </p>
      <p className="flex items-center gap-2">
        <Loader size="sm" intent="success" />
        <span>Uploading files...</span>
      </p>
      <p className="flex items-center gap-2">
        <DotsLoader size="sm" intent="warning" />
        <span>Waiting for response...</span>
      </p>
    </div>
  ),
}

/**
 * Real-world example: Data table loading
 */
export const TableLoading: Story = {
  render: () => {
    const [loading, setLoading] = React.useState(true)

    return (
      <div className="w-full max-w-2xl">
        <div className="mb-4">
          <Button onClick={() => setLoading(!loading)}>Toggle Loading</Button>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-4 py-12">
                    <div className="flex justify-center">
                      <Loader label="Loading data..." />
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  <tr className="border-t border-gray-200">
                    <td className="px-4 py-3">John Doe</td>
                    <td className="px-4 py-3">john@example.com</td>
                    <td className="px-4 py-3">Active</td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="px-4 py-3">Jane Smith</td>
                    <td className="px-4 py-3">jane@example.com</td>
                    <td className="px-4 py-3">Active</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  },
}
