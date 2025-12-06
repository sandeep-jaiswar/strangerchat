import type { Meta, StoryObj } from "@storybook/react"
import React from "react"
import { Select, SelectOption } from "./Select"

const countries: SelectOption[] = [
  { value: "us", label: "United States" },
  { value: "uk", label: "United Kingdom" },
  { value: "ca", label: "Canada" },
  { value: "au", label: "Australia" },
  { value: "de", label: "Germany" },
  { value: "fr", label: "France" },
  { value: "jp", label: "Japan" },
  { value: "cn", label: "China" },
]

const fruits: SelectOption[] = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "orange", label: "Orange" },
  { value: "grape", label: "Grape" },
  { value: "mango", label: "Mango" },
  { value: "strawberry", label: "Strawberry", disabled: true },
]

const meta: Meta<typeof Select> = {
  title: "Components/Select",
  component: Select,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Lightweight select dropdown following Apple's Human Interface Guidelines. Features keyboard navigation, search, and multiple selection support.",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    options: fruits,
    size: "md",
  },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size of the select",
    },
    multiple: {
      control: "boolean",
      description: "Enable multiple selection",
    },
    searchable: {
      control: "boolean",
      description: "Enable search/filter",
    },
    disabled: {
      control: "boolean",
      description: "Disabled state",
    },
  },
}

export default meta
type Story = StoryObj<typeof Select>

/**
 * Default select dropdown
 */
export const Default: Story = {
  render: (args) => {
    const [value, setValue] = React.useState("")

    return (
      <div className="w-80">
        <Select {...args} value={value} onChange={(v) => setValue(v as string)} />
      </div>
    )
  },
}

/**
 * With label and helper text
 */
export const WithLabel: Story = {
  render: () => {
    const [value, setValue] = React.useState("")

    return (
      <div className="w-80">
        <Select
          options={countries}
          value={value}
          onChange={(v) => setValue(v as string)}
          label="Country"
          helperText="Select your country"
          placeholder="Choose a country"
        />
      </div>
    )
  },
}

/**
 * Required field with validation
 */
export const Required: Story = {
  render: () => {
    const [value, setValue] = React.useState("")
    const [error, setError] = React.useState("")

    const handleChange = (v: string | string[]) => {
      setValue(v as string)
      if (v) setError("")
    }

    const handleBlur = () => {
      if (!value) setError("This field is required")
    }

    return (
      <div className="w-80">
        <Select
          options={fruits}
          value={value}
          onChange={handleChange}
          label="Favorite Fruit"
          error={error}
          required
          placeholder="Select a fruit"
        />
      </div>
    )
  },
}

/**
 * Different sizes
 */
export const Sizes: Story = {
  render: () => {
    const [value, setValue] = React.useState("")

    return (
      <div className="w-80 space-y-4">
        <Select options={fruits} value={value} onChange={(v) => setValue(v as string)} size="sm" label="Small" />
        <Select
          options={fruits}
          value={value}
          onChange={(v) => setValue(v as string)}
          size="md"
          label="Medium (iOS 44px)"
        />
        <Select options={fruits} value={value} onChange={(v) => setValue(v as string)} size="lg" label="Large" />
      </div>
    )
  },
}

/**
 * Searchable select
 */
export const Searchable: Story = {
  render: () => {
    const [value, setValue] = React.useState("")

    return (
      <div className="w-80">
        <Select
          options={countries}
          value={value}
          onChange={(v) => setValue(v as string)}
          label="Country"
          searchable
          placeholder="Search countries..."
        />
      </div>
    )
  },
}

/**
 * Multiple selection
 */
export const Multiple: Story = {
  render: () => {
    const [values, setValues] = React.useState<string[]>([])

    return (
      <div className="w-80">
        <Select
          options={fruits}
          value={values}
          onChange={(v) => setValues(v as string[])}
          label="Favorite Fruits"
          helperText="Select multiple fruits"
          multiple
        />
      </div>
    )
  },
}

/**
 * Multiple with search
 */
export const MultipleSearchable: Story = {
  render: () => {
    const [values, setValues] = React.useState<string[]>([])

    return (
      <div className="w-80">
        <Select
          options={countries}
          value={values}
          onChange={(v) => setValues(v as string[])}
          label="Countries Visited"
          multiple
          searchable
          placeholder="Search and select..."
        />
      </div>
    )
  },
}

/**
 * Disabled state
 */
export const Disabled: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <Select options={fruits} value="apple" label="Disabled with value" disabled />
      <Select options={fruits} label="Disabled without value" disabled placeholder="Can't select" />
    </div>
  ),
}

/**
 * With disabled options
 */
export const DisabledOptions: Story = {
  render: () => {
    const [value, setValue] = React.useState("")

    return (
      <div className="w-80">
        <Select
          options={fruits}
          value={value}
          onChange={(v) => setValue(v as string)}
          label="Select Fruit"
          helperText="Strawberry is out of stock"
        />
      </div>
    )
  },
}

/**
 * Error state
 */
export const ErrorState: Story = {
  render: () => (
    <div className="w-80">
      <Select options={fruits} label="Required Field" error="Please select an option" required />
    </div>
  ),
}

/**
 * Form example
 */
export const FormExample: Story = {
  render: () => {
    const [formData, setFormData] = React.useState({
      country: "",
      fruits: [] as string[],
      size: "",
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      console.log("Form data:", formData)
      alert(`Country: ${formData.country}\nFruits: ${formData.fruits.join(", ")}\nSize: ${formData.size}`)
    }

    return (
      <form onSubmit={handleSubmit} className="w-96 space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Preferences</h3>

        <Select
          options={countries}
          value={formData.country}
          onChange={(v) => setFormData((prev) => ({ ...prev, country: v as string }))}
          label="Country"
          required
        />

        <Select
          options={fruits}
          value={formData.fruits}
          onChange={(v) => setFormData((prev) => ({ ...prev, fruits: v as string[] }))}
          label="Favorite Fruits"
          helperText="Select one or more"
          multiple
          searchable
        />

        <Select
          options={[
            { value: "sm", label: "Small" },
            { value: "md", label: "Medium" },
            { value: "lg", label: "Large" },
          ]}
          value={formData.size}
          onChange={(v) => setFormData((prev) => ({ ...prev, size: v as string }))}
          label="T-Shirt Size"
        />

        <button
          type="submit"
          className="h-11 w-full rounded-xl bg-[#0071e3] px-4 font-medium text-white transition-colors hover:bg-[#005bb5]"
        >
          Submit
        </button>
      </form>
    )
  },
}
