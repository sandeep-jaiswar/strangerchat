import type { Meta, StoryObj } from "@storybook/react"
import React from "react"
import { Button } from "components/Button/Button"
import { CircularProgress, ProgressBar } from "./ProgressBar"

const meta: Meta<typeof ProgressBar> = {
  title: "Components/ProgressBar",
  component: ProgressBar,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Lightweight progress indicators following Apple's Human Interface Guidelines. Includes linear and circular variants with smooth animations.",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    value: 50,
    max: 100,
    intent: "primary",
    size: "md",
    showLabel: false,
  },
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "Current progress value",
    },
    max: {
      control: "number",
      description: "Maximum value",
    },
    intent: {
      control: "select",
      options: ["primary", "success", "warning", "danger", "info"],
      description: "Visual style",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size of the progress bar",
    },
    showLabel: {
      control: "boolean",
      description: "Show percentage label",
    },
    labelPosition: {
      control: "select",
      options: ["left", "right", "top"],
      description: "Label position",
    },
  },
}

export default meta
type Story = StoryObj<typeof ProgressBar>

/**
 * Default progress bar
 */
export const Default: Story = {
  render: (args) => (
    <div className="w-80">
      <ProgressBar {...args} />
    </div>
  ),
}

/**
 * All intent variants
 */
export const Intents: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <div>
        <p className="mb-1 text-xs text-gray-600">Primary</p>
        <ProgressBar value={75} intent="primary" />
      </div>
      <div>
        <p className="mb-1 text-xs text-gray-600">Success</p>
        <ProgressBar value={100} intent="success" />
      </div>
      <div>
        <p className="mb-1 text-xs text-gray-600">Warning</p>
        <ProgressBar value={60} intent="warning" />
      </div>
      <div>
        <p className="mb-1 text-xs text-gray-600">Danger</p>
        <ProgressBar value={30} intent="danger" />
      </div>
      <div>
        <p className="mb-1 text-xs text-gray-600">Info</p>
        <ProgressBar value={45} intent="info" />
      </div>
    </div>
  ),
}

/**
 * All size variants
 */
export const Sizes: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <div>
        <p className="mb-1 text-xs text-gray-600">Small</p>
        <ProgressBar value={75} size="sm" />
      </div>
      <div>
        <p className="mb-1 text-xs text-gray-600">Medium</p>
        <ProgressBar value={75} size="md" />
      </div>
      <div>
        <p className="mb-1 text-xs text-gray-600">Large</p>
        <ProgressBar value={75} size="lg" />
      </div>
    </div>
  ),
}

/**
 * Progress bar with labels
 */
export const WithLabels: Story = {
  render: () => (
    <div className="w-80 space-y-6">
      <ProgressBar value={75} showLabel labelPosition="right" />
      <ProgressBar value={60} showLabel labelPosition="left" />
      <ProgressBar value={45} showLabel labelPosition="top" />
    </div>
  ),
}

/**
 * Custom label format
 */
export const CustomLabel: Story = {
  render: () => (
    <div className="w-80 space-y-6">
      <ProgressBar value={30} max={100} showLabel formatLabel={(value, max) => `${value} of ${max}`} />
      <ProgressBar
        value={750}
        max={1000}
        showLabel
        formatLabel={(value, max) => `${value}MB / ${max}MB`}
        intent="success"
      />
      <ProgressBar value={5} max={10} showLabel formatLabel={(value, max) => `Step ${value}/${max}`} intent="info" />
    </div>
  ),
}

/**
 * Animated progress
 */
export const Animated: Story = {
  render: () => {
    const [progress, setProgress] = React.useState(0)

    React.useEffect(() => {
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 1))
      }, 50)

      return () => clearInterval(interval)
    }, [])

    return (
      <div className="w-80 space-y-4">
        <ProgressBar value={progress} showLabel />
        <ProgressBar value={progress} intent="success" />
      </div>
    )
  },
}

/**
 * Circular progress variant
 */
export const Circular: Story = {
  render: () => (
    <div className="flex flex-wrap gap-8">
      <CircularProgress value={25} />
      <CircularProgress value={50} intent="success" />
      <CircularProgress value={75} intent="warning" />
      <CircularProgress value={100} intent="danger" />
    </div>
  ),
}

/**
 * Circular progress sizes
 */
export const CircularSizes: Story = {
  render: () => (
    <div className="flex items-end gap-8">
      <div className="flex flex-col items-center gap-2">
        <CircularProgress value={75} size={60} />
        <span className="text-xs text-gray-600">Small</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <CircularProgress value={75} size={80} />
        <span className="text-xs text-gray-600">Medium</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <CircularProgress value={75} size={120} />
        <span className="text-xs text-gray-600">Large</span>
      </div>
    </div>
  ),
}

/**
 * Circular progress without label
 */
export const CircularNoLabel: Story = {
  render: () => (
    <div className="flex gap-8">
      <CircularProgress value={75} showLabel={false} />
      <CircularProgress value={50} intent="success" showLabel={false} />
      <CircularProgress value={25} intent="warning" showLabel={false} />
    </div>
  ),
}

/**
 * Real-world example: File upload
 */
export const FileUpload: Story = {
  render: () => {
    const [progress, setProgress] = React.useState(0)
    const [uploading, setUploading] = React.useState(false)

    const startUpload = () => {
      setUploading(true)
      setProgress(0)

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setTimeout(() => setUploading(false), 500)
            return 100
          }
          return prev + 2
        })
      }, 100)
    }

    return (
      <div className="w-96 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Upload File</h3>

        {!uploading ? (
          <Button onClick={startUpload}>Start Upload</Button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">document.pdf</span>
              <span className="font-medium text-gray-900">{progress}%</span>
            </div>
            <ProgressBar value={progress} intent={progress === 100 ? "success" : "primary"} />
            {progress === 100 && (
              <p className="flex items-center gap-2 text-sm text-green-600">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Upload complete!
              </p>
            )}
          </div>
        )}
      </div>
    )
  },
}

/**
 * Real-world example: Multi-step form
 */
export const MultiStepForm: Story = {
  render: () => {
    const [step, setStep] = React.useState(1)
    const totalSteps = 4
    const _progress = (step / totalSteps) * 100

    return (
      <div className="w-96 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Registration Form</h3>

        <div className="mb-6">
          <ProgressBar
            value={step}
            max={totalSteps}
            showLabel
            labelPosition="top"
            formatLabel={(value, max) => `Step ${value} of ${max}`}
          />
        </div>

        <div className="mb-6 flex min-h-[100px] items-center justify-center rounded-lg bg-gray-50 p-4">
          <p className="text-gray-600">Step {step} content goes here</p>
        </div>

        <div className="flex gap-3">
          <Button variant="bordered" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>
            Previous
          </Button>
          {step < totalSteps ? (
            <Button onClick={() => setStep((s) => Math.min(totalSteps, s + 1))}>Next</Button>
          ) : (
            <Button intent="success">Complete</Button>
          )}
        </div>
      </div>
    )
  },
}

/**
 * Real-world example: Download progress
 */
export const DownloadProgress: Story = {
  render: () => {
    const [downloads, _setDownloads] = React.useState([
      { id: 1, name: "Project-Report.pdf", progress: 45, status: "downloading" },
      { id: 2, name: "Presentation.pptx", progress: 100, status: "complete" },
      { id: 3, name: "Budget-2024.xlsx", progress: 12, status: "downloading" },
    ])

    return (
      <div className="w-96 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Downloads</h3>

        <div className="space-y-4">
          {downloads.map((download) => (
            <div key={download.id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex-1 truncate font-medium text-gray-900">{download.name}</span>
                {download.status === "complete" ? (
                  <span className="flex items-center gap-1 text-green-600">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Complete
                  </span>
                ) : (
                  <span className="text-gray-600">{download.progress}%</span>
                )}
              </div>
              <ProgressBar
                value={download.progress}
                intent={download.status === "complete" ? "success" : "primary"}
                size="sm"
              />
            </div>
          ))}
        </div>
      </div>
    )
  },
}

/**
 * Real-world example: Skill levels
 */
export const SkillLevels: Story = {
  render: () => (
    <div className="w-96 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold">Skills</h3>

      <div className="space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">React</span>
            <span className="text-sm text-gray-600">Expert</span>
          </div>
          <ProgressBar value={95} intent="success" />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">TypeScript</span>
            <span className="text-sm text-gray-600">Advanced</span>
          </div>
          <ProgressBar value={85} intent="primary" />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">Node.js</span>
            <span className="text-sm text-gray-600">Intermediate</span>
          </div>
          <ProgressBar value={65} intent="info" />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">Python</span>
            <span className="text-sm text-gray-600">Beginner</span>
          </div>
          <ProgressBar value={30} intent="warning" />
        </div>
      </div>
    </div>
  ),
}

/**
 * Real-world example: Dashboard stats
 */
export const DashboardStats: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-600">Storage Used</h4>
          <CircularProgress value={68} size={60} intent="primary" />
        </div>
        <p className="text-2xl font-bold text-gray-900">6.8 GB</p>
        <p className="text-xs text-gray-500">of 10 GB</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-600">Tasks Done</h4>
          <CircularProgress value={85} size={60} intent="success" />
        </div>
        <p className="text-2xl font-bold text-gray-900">17 / 20</p>
        <p className="text-xs text-gray-500">this week</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-600">CPU Usage</h4>
          <CircularProgress value={42} size={60} intent="info" />
        </div>
        <p className="text-2xl font-bold text-gray-900">42%</p>
        <p className="text-xs text-gray-500">average</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-600">Memory</h4>
          <CircularProgress value={91} size={60} intent="warning" />
        </div>
        <p className="text-2xl font-bold text-gray-900">7.3 GB</p>
        <p className="text-xs text-gray-500">of 8 GB</p>
      </div>
    </div>
  ),
}

/**
 * Real-world example: Loading states
 */
export const LoadingStates: Story = {
  render: () => {
    const [loading, setLoading] = React.useState(false)
    const [progress, setProgress] = React.useState(0)

    const startLoading = () => {
      setLoading(true)
      setProgress(0)

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setTimeout(() => setLoading(false), 500)
            return 100
          }
          return prev + 5
        })
      }, 200)
    }

    return (
      <div className="w-96 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Process Data</h3>

        {!loading ? (
          <Button onClick={startLoading}>Start Processing</Button>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <CircularProgress value={progress} size={100} />
            </div>
            <div>
              <p className="mb-2 text-sm text-gray-600">Processing files...</p>
              <ProgressBar value={progress} intent="primary" />
            </div>
          </div>
        )}
      </div>
    )
  },
}
