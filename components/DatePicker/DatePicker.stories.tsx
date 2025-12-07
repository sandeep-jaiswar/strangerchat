import type { Meta, StoryObj } from "@storybook/react"
import React from "react"
import { DatePicker } from "./DatePicker"

const meta: Meta<typeof DatePicker> = {
  title: "Components/DatePicker",
  component: DatePicker,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "compact", "minimal", "inline"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    format: {
      control: "select",
      options: ["short", "long", "numeric", "relative"],
    },
    onChange: { action: "date changed" },
  },
}

export default meta
type Story = StoryObj<typeof DatePicker>

/**
 * Default date picker with icon and clear button.
 */
export const Default: Story = {
  args: {
    placeholder: "Pick a date",
  },
}

/**
 * Compact variant for smaller spaces.
 */
export const Compact: Story = {
  args: {
    ...Default.args,
    variant: "compact",
  },
}

/**
 * Minimal variant with no border.
 */
export const Minimal: Story = {
  args: {
    ...Default.args,
    variant: "minimal",
  },
}

/**
 * Inline variant with bottom border only.
 */
export const Inline: Story = {
  args: {
    ...Default.args,
    variant: "inline",
  },
}

/**
 * Small size.
 */
export const Small: Story = {
  args: {
    ...Default.args,
    size: "sm",
  },
}

/**
 * Large size.
 */
export const Large: Story = {
  args: {
    ...Default.args,
    size: "lg",
  },
}

/**
 * With pre-selected date.
 */
export const WithValue: Story = {
  args: {
    value: new Date(2024, 11, 7),
  },
}

/**
 * Disabled state.
 */
export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
}

/**
 * With selected date disabled.
 */
export const DisabledWithValue: Story = {
  args: {
    value: new Date(2024, 11, 7),
    disabled: true,
  },
}

/**
 * Without icon.
 */
export const NoIcon: Story = {
  args: {
    ...Default.args,
    showIcon: false,
  },
}

/**
 * Without clear button.
 */
export const NoClearButton: Story = {
  args: {
    value: new Date(2024, 11, 7),
    showClear: false,
  },
}

/**
 * Short date format (default).
 */
export const ShortFormat: Story = {
  args: {
    value: new Date(2024, 11, 7),
    format: "short",
  },
}

/**
 * Long date format.
 */
export const LongFormat: Story = {
  args: {
    value: new Date(2024, 11, 7),
    format: "long",
  },
}

/**
 * Numeric date format.
 */
export const NumericFormat: Story = {
  args: {
    value: new Date(2024, 11, 7),
    format: "numeric",
  },
}

/**
 * Relative date format (Today, Tomorrow, etc).
 */
export const RelativeFormat: Story = {
  args: {
    value: new Date(),
    format: "relative",
  },
}

/**
 * With quick date presets.
 */
export const WithPresets: Story = {
  args: {
    ...Default.args,
    showPresets: true,
  },
}

/**
 * With min date constraint.
 */
export const WithMinDate: Story = {
  args: {
    ...Default.args,
    minDate: new Date(),
  },
}

/**
 * With max date constraint.
 */
export const WithMaxDate: Story = {
  args: {
    ...Default.args,
    maxDate: new Date(2024, 11, 31),
  },
}

/**
 * With min and max date constraints.
 */
export const WithDateRange: Story = {
  args: {
    ...Default.args,
    minDate: new Date(2024, 11, 1),
    maxDate: new Date(2024, 11, 31),
  },
}

/**
 * With error state.
 */
export const Error: Story = {
  args: {
    ...Default.args,
    error: true,
    helperText: "Please select a valid date",
  },
}

/**
 * With helper text.
 */
export const WithHelperText: Story = {
  args: {
    ...Default.args,
    helperText: "Select your preferred date",
  },
}

/**
 * Custom placeholder.
 */
export const CustomPlaceholder: Story = {
  args: {
    placeholder: "Select date...",
  },
}

/**
 * All variants comparison.
 */
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium">Default</label>
        <DatePicker placeholder="Pick a date" />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Compact</label>
        <DatePicker placeholder="Pick a date" variant="compact" />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Minimal</label>
        <DatePicker placeholder="Pick a date" variant="minimal" />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Inline</label>
        <DatePicker placeholder="Pick a date" variant="inline" />
      </div>
    </div>
  ),
}

/**
 * All sizes comparison.
 */
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <DatePicker placeholder="Small" size="sm" />
      <DatePicker placeholder="Medium" size="md" />
      <DatePicker placeholder="Large" size="lg" />
    </div>
  ),
}

/**
 * Interactive demo with state management.
 */
export const Interactive: Story = {
  render: () => {
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>()

    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <h3 className="mb-2 text-sm font-semibold">Selected Date:</h3>
          <p className="text-sm text-neutral-600">
            {selectedDate ? selectedDate.toLocaleDateString() : "No date selected"}
          </p>
        </div>
        <DatePicker
          value={selectedDate}
          onChange={setSelectedDate}
          placeholder="Pick a date"
          showPresets
        />
      </div>
    )
  },
}

/**
 * Form integration example.
 */
export const FormExample: Story = {
  render: () => {
    const [startDate, setStartDate] = React.useState<Date | undefined>()
    const [endDate, setEndDate] = React.useState<Date | undefined>()

    return (
      <div className="space-y-4 rounded-lg border border-neutral-200 bg-white p-6">
        <h3 className="text-lg font-semibold">Book a Meeting</h3>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Start Date</label>
            <DatePicker
              value={startDate}
              onChange={setStartDate}
              placeholder="Select start date"
              minDate={new Date()}
              helperText="Choose when the meeting starts"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">End Date</label>
            <DatePicker
              value={endDate}
              onChange={setEndDate}
              placeholder="Select end date"
              minDate={startDate || new Date()}
              helperText="Choose when the meeting ends"
              error={endDate && startDate && endDate < startDate}
            />
          </div>
        </div>
      </div>
    )
  },
}

/**
 * Dark theme variant.
 */
export const DarkTheme: Story = {
  args: {
    ...Default.args,
  },
  decorators: [
    (Story) => (
      <div className="rounded-xl bg-neutral-900 p-6">
        <Story />
      </div>
    ),
  ],
}

/**
 * Mobile view (smaller width).
 */
export const Mobile: Story = {
  args: {
    ...Default.args,
    size: "sm",
  },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-sm">
        <Story />
      </div>
    ),
  ],
}
