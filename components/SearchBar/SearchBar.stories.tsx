import type { Meta, StoryObj } from "@storybook/react"
import React, { useState } from "react"
import { SearchBar } from "./SearchBar"

const meta: Meta<typeof SearchBar> = {
  title: "Components/SearchBar",
  component: SearchBar,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "An Apple-inspired search bar with elegant design and smooth interactions. Features auto-focus, clear button, loading state, and keyboard shortcuts (Enter to search, Escape to clear/blur).",
      },
    },
  },
  argTypes: {
    value: {
      control: "text",
      description: "Current search value",
    },
    onChange: {
      action: "changed",
      description: "Change handler receiving the new value",
    },
    onSearch: {
      action: "searched",
      description: "Search action handler (triggered on Enter)",
    },
    onClear: {
      action: "cleared",
      description: "Clear handler (called when clear button is clicked)",
    },
    placeholder: {
      control: "text",
      description: "Placeholder text",
    },
    variant: {
      control: "select",
      options: ["default", "bordered", "filled", "minimal"],
      description: "Visual style variant",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Search bar size",
    },
    loading: {
      control: "boolean",
      description: "Show loading spinner",
    },
    autoFocus: {
      control: "boolean",
      description: "Auto focus on mount",
    },
    showSearchIcon: {
      control: "boolean",
      description: "Show search icon",
    },
    showClearButton: {
      control: "boolean",
      description: "Show clear button when there's text",
    },
    disabled: {
      control: "boolean",
      description: "Disabled state",
    },
    fullWidth: {
      control: "boolean",
      description: "Full width layout",
    },
    shortcut: {
      control: "text",
      description: "Keyboard shortcut hint (e.g., ⌘K)",
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-xl">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof SearchBar>

/**
 * Default search bar with standard appearance.
 */
export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState("")
    return <SearchBar {...args} value={value} onChange={setValue} />
  },
  args: {
    placeholder: "Search...",
  },
}

/**
 * Search bar with bordered variant for more definition.
 */
export const Bordered: Story = {
  render: (args) => {
    const [value, setValue] = useState("")
    return <SearchBar {...args} value={value} onChange={setValue} />
  },
  args: {
    placeholder: "Search messages...",
    variant: "bordered",
  },
}

/**
 * Search bar with filled variant for emphasis.
 */
export const Filled: Story = {
  render: (args) => {
    const [value, setValue] = useState("")
    return <SearchBar {...args} value={value} onChange={setValue} />
  },
  args: {
    placeholder: "Search friends...",
    variant: "filled",
  },
}

/**
 * Minimal search bar with bottom border only.
 */
export const Minimal: Story = {
  render: (args) => {
    const [value, setValue] = useState("")
    return <SearchBar {...args} value={value} onChange={setValue} />
  },
  args: {
    placeholder: "Search...",
    variant: "minimal",
  },
}

/**
 * Small search bar for compact layouts.
 */
export const Small: Story = {
  render: (args) => {
    const [value, setValue] = useState("")
    return <SearchBar {...args} value={value} onChange={setValue} />
  },
  args: {
    placeholder: "Quick search",
    size: "sm",
  },
}

/**
 * Large search bar for emphasis.
 */
export const Large: Story = {
  render: (args) => {
    const [value, setValue] = useState("")
    return <SearchBar {...args} value={value} onChange={setValue} />
  },
  args: {
    placeholder: "Search everything...",
    size: "lg",
  },
}

/**
 * Search bar with loading spinner.
 */
export const Loading: Story = {
  render: (args) => {
    const [value, setValue] = useState("searching")
    return <SearchBar {...args} value={value} onChange={setValue} />
  },
  args: {
    placeholder: "Search...",
    loading: true,
  },
}

/**
 * Search bar with keyboard shortcut hint.
 */
export const WithShortcut: Story = {
  render: (args) => {
    const [value, setValue] = useState("")
    return <SearchBar {...args} value={value} onChange={setValue} />
  },
  args: {
    placeholder: "Search...",
    shortcut: "⌘K",
  },
}

/**
 * Search bar with search action button.
 */
export const WithSearchButton: Story = {
  render: (args) => {
    const [value, setValue] = useState("query")
    return <SearchBar {...args} value={value} onChange={setValue} onSearch={() => alert(`Searching for: ${value}`)} />
  },
  args: {
    placeholder: "Search...",
  },
}

/**
 * Search bar without search icon.
 */
export const NoSearchIcon: Story = {
  render: (args) => {
    const [value, setValue] = useState("")
    return <SearchBar {...args} value={value} onChange={setValue} />
  },
  args: {
    placeholder: "Type to search...",
    showSearchIcon: false,
  },
}

/**
 * Search bar without clear button.
 */
export const NoClearButton: Story = {
  render: (args) => {
    const [value, setValue] = useState("permanent text")
    return <SearchBar {...args} value={value} onChange={setValue} />
  },
  args: {
    placeholder: "Search...",
    showClearButton: false,
  },
}

/**
 * Disabled search bar.
 */
export const Disabled: Story = {
  render: (args) => {
    const [value, setValue] = useState("disabled")
    return <SearchBar {...args} value={value} onChange={setValue} />
  },
  args: {
    placeholder: "Search...",
    disabled: true,
  },
}

/**
 * Auto-focused search bar (focuses on mount).
 */
export const AutoFocus: Story = {
  render: (args) => {
    const [value, setValue] = useState("")
    return <SearchBar {...args} value={value} onChange={setValue} />
  },
  args: {
    placeholder: "Automatically focused...",
    autoFocus: true,
  },
}

/**
 * Search bar with custom width (not full width).
 */
export const CustomWidth: Story = {
  render: (args) => {
    const [value, setValue] = useState("")
    return <SearchBar {...args} value={value} onChange={setValue} />
  },
  args: {
    placeholder: "Narrow search...",
    fullWidth: false,
    className: "w-64",
  },
}

/**
 * Interactive search with search handler.
 */
export const Interactive: Story = {
  render: (args) => {
    const [value, setValue] = useState("")
    const [results, setResults] = useState<string[]>([])
    const [isSearching, setIsSearching] = useState(false)

    const handleSearch = () => {
      if (!value) return

      setIsSearching(true)
      // Simulate API call
      setTimeout(() => {
        setResults([`Result for "${value}" #1`, `Result for "${value}" #2`, `Result for "${value}" #3`])
        setIsSearching(false)
      }, 1000)
    }

    const handleClear = () => {
      setResults([])
    }

    return (
      <div className="w-full space-y-4">
        <SearchBar
          {...args}
          value={value}
          onChange={setValue}
          onSearch={handleSearch}
          onClear={handleClear}
          loading={isSearching}
          shortcut="⏎"
        />
        {results.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-neutral-600">Search Results:</p>
            <ul className="space-y-1">
              {results.map((result, i) => (
                <li key={i} className="rounded-lg bg-neutral-100 px-3 py-2 text-sm text-neutral-800">
                  {result}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  },
  args: {
    placeholder: "Search and press Enter...",
  },
}

/**
 * All variants comparison.
 */
export const AllVariants: Story = {
  render: () => {
    const [value1, setValue1] = useState("")
    const [value2, setValue2] = useState("")
    const [value3, setValue3] = useState("")
    const [value4, setValue4] = useState("")

    return (
      <div className="w-full space-y-6">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-neutral-700">Default</h3>
          <SearchBar value={value1} onChange={setValue1} placeholder="Default style" />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-neutral-700">Bordered</h3>
          <SearchBar value={value2} onChange={setValue2} placeholder="Bordered style" variant="bordered" />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-neutral-700">Filled</h3>
          <SearchBar value={value3} onChange={setValue3} placeholder="Filled style" variant="filled" />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-neutral-700">Minimal</h3>
          <SearchBar value={value4} onChange={setValue4} placeholder="Minimal style" variant="minimal" />
        </div>
      </div>
    )
  },
}

/**
 * All sizes comparison.
 */
export const AllSizes: Story = {
  render: () => {
    const [value1, setValue1] = useState("")
    const [value2, setValue2] = useState("")
    const [value3, setValue3] = useState("")

    return (
      <div className="w-full space-y-6">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-neutral-700">Small</h3>
          <SearchBar value={value1} onChange={setValue1} placeholder="Small size" size="sm" />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-neutral-700">Medium (default)</h3>
          <SearchBar value={value2} onChange={setValue2} placeholder="Medium size" size="md" />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-neutral-700">Large</h3>
          <SearchBar value={value3} onChange={setValue3} placeholder="Large size" size="lg" />
        </div>
      </div>
    )
  },
}

/**
 * Dark theme example.
 */
export const DarkTheme: Story = {
  render: (args) => {
    const [value, setValue] = useState("")
    return <SearchBar {...args} value={value} onChange={setValue} />
  },
  args: {
    placeholder: "Search in dark mode...",
    variant: "bordered",
  },
  parameters: {
    backgrounds: {
      default: "dark",
    },
  },
  decorators: [
    (Story) => (
      <div className="dark w-full max-w-xl">
        <Story />
      </div>
    ),
  ],
}

/**
 * Real-time search simulation.
 */
export const RealtimeSearch: Story = {
  render: (args) => {
    const [value, setValue] = useState("")
    const [isSearching, setIsSearching] = useState(false)

    const handleChange = (newValue: string) => {
      setValue(newValue)
      if (newValue) {
        setIsSearching(true)
        // Simulate debounced search
        setTimeout(() => {
          setIsSearching(false)
        }, 800)
      } else {
        setIsSearching(false)
      }
    }

    return (
      <div className="w-full space-y-2">
        <SearchBar {...args} value={value} onChange={handleChange} loading={isSearching} />
        <p className="text-xs text-neutral-500">
          {isSearching ? "Searching..." : value ? `Results for "${value}"` : "Type to search"}
        </p>
      </div>
    )
  },
  args: {
    placeholder: "Search as you type...",
    variant: "filled",
  },
}
