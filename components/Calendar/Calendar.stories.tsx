import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { Calendar } from "./Calendar"

const meta: Meta<typeof Calendar> = {
  title: "Components/Calendar",
  component: Calendar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "compact", "elevated", "minimal"],
      description: "Visual variant of the calendar",
    },
    weekStartsOn: {
      control: "select",
      options: [0, 1],
      description: "First day of the week (0 = Sunday, 1 = Monday)",
    },
    showYearSelector: {
      control: "boolean",
      description: "Show year selector dropdown",
    },
    showTodayButton: {
      control: "boolean",
      description: "Show 'Today' button in footer",
    },
  },
}

export default meta
type Story = StoryObj<typeof Calendar>

export const Default: Story = {
  args: {},
}

export const WithDefaultValue: Story = {
  args: {
    defaultValue: new Date(2024, 11, 15), // December 15, 2024
  },
}

export const CompactVariant: Story = {
  args: {
    variant: "compact",
  },
}

export const ElevatedVariant: Story = {
  args: {
    variant: "elevated",
  },
}

export const MinimalVariant: Story = {
  args: {
    variant: "minimal",
  },
}

export const WeekStartsOnMonday: Story = {
  args: {
    weekStartsOn: 1,
  },
}

export const WithoutYearSelector: Story = {
  args: {
    showYearSelector: false,
  },
}

export const WithoutTodayButton: Story = {
  args: {
    showTodayButton: false,
  },
}

export const WithMinMaxDates: Story = {
  args: {
    minDate: new Date(2024, 11, 10), // December 10, 2024
    maxDate: new Date(2024, 11, 25), // December 25, 2024
    defaultValue: new Date(2024, 11, 15),
  },
}

export const WithDisabledDates: Story = {
  args: {
    disabledDates: [new Date(2024, 11, 14), new Date(2024, 11, 15), new Date(2024, 11, 21), new Date(2024, 11, 22)],
    defaultValue: new Date(2024, 11, 1),
  },
}

export const Interactive: Story = {
  render: (args) => {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

    return (
      <div className="flex flex-col items-center gap-4">
        <Calendar
          {...args}
          value={selectedDate}
          onChange={setSelectedDate}
          onClear={() => setSelectedDate(undefined)}
        />
        <div className="rounded-lg bg-neutral-100 px-4 py-2 text-sm text-neutral-700">
          {selectedDate
            ? `Selected: ${selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}`
            : "No date selected"}
        </div>
      </div>
    )
  },
}

export const MultipleCalendars: Story = {
  render: () => (
    <div className="flex flex-wrap gap-6">
      <Calendar variant="default" />
      <Calendar variant="elevated" />
      <Calendar variant="compact" />
    </div>
  ),
}

export const DarkBackground: Story = {
  render: (args) => (
    <div className="rounded-xl bg-neutral-900 p-8">
      <Calendar {...args} variant="elevated" />
    </div>
  ),
  parameters: {
    backgrounds: {
      default: "dark",
    },
  },
}

export const DateRangeSelection: Story = {
  render: () => {
    const [startDate, setStartDate] = useState<Date | undefined>()
    const [endDate, setEndDate] = useState<Date | undefined>()

    return (
      <div className="flex flex-col gap-6">
        <div className="flex gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-neutral-700">Start Date</label>
            <Calendar
              value={startDate}
              onChange={setStartDate}
              onClear={() => setStartDate(undefined)}
              maxDate={endDate}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-neutral-700">End Date</label>
            <Calendar value={endDate} onChange={setEndDate} onClear={() => setEndDate(undefined)} minDate={startDate} />
          </div>
        </div>
        <div className="rounded-lg bg-neutral-100 px-4 py-3 text-sm text-neutral-700">
          {startDate && endDate
            ? `Range: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
            : startDate
            ? `Start: ${startDate.toLocaleDateString()} (Select end date)`
            : "Select start date"}
        </div>
      </div>
    )
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-8 p-8">
      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold text-neutral-900">Default</h3>
        <Calendar variant="default" />
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold text-neutral-900">Compact</h3>
        <Calendar variant="compact" showTodayButton={false} />
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold text-neutral-900">Elevated</h3>
        <Calendar variant="elevated" />
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold text-neutral-900">Minimal</h3>
        <Calendar variant="minimal" />
      </div>
    </div>
  ),
  parameters: {
    layout: "fullscreen",
  },
}
