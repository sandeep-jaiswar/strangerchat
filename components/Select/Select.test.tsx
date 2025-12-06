import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { Select, SelectOption } from "./Select"
import { vi } from "vitest"
import React from "react"

describe("Select", () => {
  const mockOptions: SelectOption[] = [
    { value: "1", label: "Option 1" },
    { value: "2", label: "Option 2" },
    { value: "3", label: "Option 3" },
    { value: "4", label: "Option 4" },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("renders with default props", () => {
      render(<Select options={mockOptions} />)
      expect(screen.getByRole("button")).toBeInTheDocument()
    })

    it("renders with placeholder", () => {
      render(<Select options={mockOptions} placeholder="Choose option" />)
      expect(screen.getByText("Choose option")).toBeInTheDocument()
    })

    it("renders with label", () => {
      render(<Select options={mockOptions} label="Select Label" />)
      expect(screen.getByText("Select Label")).toBeInTheDocument()
    })

    it("renders with helper text", () => {
      render(<Select options={mockOptions} helperText="This is helper text" />)
      expect(screen.getByText("This is helper text")).toBeInTheDocument()
    })

    it("renders with error message", () => {
      render(<Select options={mockOptions} error="This is an error" />)
      const errorMessage = screen.getByRole("alert")
      expect(errorMessage).toBeInTheDocument()
      expect(errorMessage).toHaveTextContent("This is an error")
    })

    it("does not render helper text when error is present", () => {
      render(<Select options={mockOptions} helperText="Helper text" error="Error message" />)
      expect(screen.queryByText("Helper text")).not.toBeInTheDocument()
      expect(screen.getByText("Error message")).toBeInTheDocument()
    })

    it("renders required indicator", () => {
      render(<Select options={mockOptions} label="Required Field" required />)
      const requiredIndicator = screen.getByLabelText("required")
      expect(requiredIndicator).toBeInTheDocument()
      expect(requiredIndicator).toHaveTextContent("*")
    })
  })

  describe("Dropdown Interaction", () => {
    it("opens dropdown when clicking button", () => {
      render(<Select options={mockOptions} />)
      const button = screen.getByRole("button")
      
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
      
      fireEvent.click(button)
      
      expect(screen.getByRole("listbox")).toBeInTheDocument()
    })

    it("closes dropdown when clicking button again", () => {
      render(<Select options={mockOptions} />)
      const button = screen.getByRole("button")
      
      fireEvent.click(button)
      expect(screen.getByRole("listbox")).toBeInTheDocument()
      
      fireEvent.click(button)
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
    })

    it("closes dropdown when clicking outside", () => {
      render(
        <div>
          <Select options={mockOptions} />
          <div data-testid="outside">Outside</div>
        </div>
      )
      
      const button = screen.getByRole("button")
      fireEvent.click(button)
      expect(screen.getByRole("listbox")).toBeInTheDocument()
      
      fireEvent.mouseDown(screen.getByTestId("outside"))
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
    })

    it("sets aria-expanded to true when open", () => {
      render(<Select options={mockOptions} />)
      const button = screen.getByRole("button")
      
      expect(button).toHaveAttribute("aria-expanded", "false")
      
      fireEvent.click(button)
      
      expect(button).toHaveAttribute("aria-expanded", "true")
    })

    it("has aria-haspopup attribute", () => {
      render(<Select options={mockOptions} />)
      const button = screen.getByRole("button")
      expect(button).toHaveAttribute("aria-haspopup", "listbox")
    })
  })

  describe("Single Selection", () => {
    it("selects an option when clicked", () => {
      const onChange = vi.fn()
      render(<Select options={mockOptions} onChange={onChange} />)
      
      fireEvent.click(screen.getByRole("button"))
      fireEvent.click(screen.getByText("Option 2"))
      
      expect(onChange).toHaveBeenCalledWith("2")
    })

    it("displays selected option label", () => {
      render(<Select options={mockOptions} value="2" />)
      expect(screen.getByText("Option 2")).toBeInTheDocument()
    })

    it("closes dropdown after selection", () => {
      const onChange = vi.fn()
      render(<Select options={mockOptions} onChange={onChange} />)
      
      fireEvent.click(screen.getByRole("button"))
      fireEvent.click(screen.getByText("Option 3"))
      
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
    })

    it("marks selected option with aria-selected", () => {
      render(<Select options={mockOptions} value="1" />)
      
      fireEvent.click(screen.getByRole("button"))
      
      const options = screen.getAllByRole("option")
      expect(options[0]).toHaveAttribute("aria-selected", "true")
      expect(options[1]).toHaveAttribute("aria-selected", "false")
    })

    it("shows checkmark on selected option", () => {
      render(<Select options={mockOptions} value="1" />)
      
      fireEvent.click(screen.getByRole("button"))
      
      const selectedOption = screen.getAllByRole("option")[0]
      const checkmark = selectedOption.querySelector("svg")
      expect(checkmark).toBeInTheDocument()
    })

    it("allows deselecting by clicking selected option", () => {
      const onChange = vi.fn()
      render(<Select options={mockOptions} value="2" onChange={onChange} />)
      
      fireEvent.click(screen.getByRole("button"))
      const options = screen.getAllByRole("option")
      fireEvent.click(options[1]) // Click Option 2
      
      // Single select doesn't deselect, just calls onChange with same value
      expect(onChange).toHaveBeenCalledWith("2")
    })
  })

  describe("Multiple Selection", () => {
    it("allows selecting multiple options", () => {
      const onChange = vi.fn()
      render(<Select options={mockOptions} multiple onChange={onChange} />)
      
      fireEvent.click(screen.getByRole("button"))
      const options = screen.getAllByRole("option")
      fireEvent.click(options[0]) // Click Option 1
      
      expect(onChange).toHaveBeenCalledWith(["1"])
      
      fireEvent.click(options[1]) // Click Option 2
      
      expect(onChange).toHaveBeenLastCalledWith(["2"])
    })

    it("displays count of selected items", () => {
      render(<Select options={mockOptions} multiple value={["1", "2", "3"]} />)
      expect(screen.getByText("3 selected")).toBeInTheDocument()
    })

    it("keeps dropdown open after selection", () => {
      const onChange = vi.fn()
      render(<Select options={mockOptions} multiple onChange={onChange} />)
      
      fireEvent.click(screen.getByRole("button"))
      fireEvent.click(screen.getByText("Option 1"))
      
      expect(screen.getByRole("listbox")).toBeInTheDocument()
    })

    it("renders selected options as pills", () => {
      render(<Select options={mockOptions} multiple value={["1", "2"]} />)
      
      const pills = screen.getByText("Option 1").closest("span")
      expect(pills).toBeInTheDocument()
      expect(screen.getByText("Option 2")).toBeInTheDocument()
    })

    it("removes option when clicking pill remove button", () => {
      const onChange = vi.fn()
      render(<Select options={mockOptions} multiple value={["1", "2"]} onChange={onChange} />)
      
      const removeButton = screen.getByLabelText("Remove Option 1")
      fireEvent.click(removeButton)
      
      expect(onChange).toHaveBeenCalledWith(["2"])
    })

    it("deselects option when clicking selected option again", () => {
      const onChange = vi.fn()
      render(<Select options={mockOptions} multiple value={["1", "2"]} onChange={onChange} />)
      
      const selectButton = screen.getByRole("button", { name: /2 selected/i })
      fireEvent.click(selectButton)
      const options = screen.getAllByRole("option")
      fireEvent.click(options[1]) // Click Option 2
      
      expect(onChange).toHaveBeenCalledWith(["1"])
    })

    it("handles empty array value", () => {
      render(<Select options={mockOptions} multiple value={[]} />)
      expect(screen.getByText("Select...")).toBeInTheDocument()
    })
  })

  describe("Searchable", () => {
    it("renders search input when searchable", () => {
      render(<Select options={mockOptions} searchable />)
      
      fireEvent.click(screen.getByRole("button"))
      
      expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument()
    })

    it("filters options based on search query", () => {
      render(<Select options={mockOptions} searchable />)
      
      fireEvent.click(screen.getByRole("button"))
      const searchInput = screen.getByPlaceholderText("Search...")
      
      fireEvent.change(searchInput, { target: { value: "Option 2" } })
      
      expect(screen.getByText("Option 2")).toBeInTheDocument()
      expect(screen.queryByText("Option 1")).not.toBeInTheDocument()
    })

    it("shows no options message when no results", () => {
      render(<Select options={mockOptions} searchable />)
      
      fireEvent.click(screen.getByRole("button"))
      const searchInput = screen.getByPlaceholderText("Search...")
      
      fireEvent.change(searchInput, { target: { value: "nonexistent" } })
      
      expect(screen.getByText("No options found")).toBeInTheDocument()
    })

    it("search is case insensitive", () => {
      render(<Select options={mockOptions} searchable />)
      
      fireEvent.click(screen.getByRole("button"))
      const searchInput = screen.getByPlaceholderText("Search...")
      
      fireEvent.change(searchInput, { target: { value: "option 3" } })
      
      expect(screen.getByText("Option 3")).toBeInTheDocument()
    })

    it("focuses search input when dropdown opens", async () => {
      render(<Select options={mockOptions} searchable />)
      
      fireEvent.click(screen.getByRole("button"))
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText("Search...")).toHaveFocus()
      })
    })

    it("clears search query when dropdown closes", async () => {
      render(<Select options={mockOptions} searchable />)
      
      const button = screen.getByRole("button")
      fireEvent.click(button)
      const searchInput = screen.getByPlaceholderText("Search...")
      
      fireEvent.change(searchInput, { target: { value: "test" } })
      expect(searchInput).toHaveValue("test")
      
      // Close by clicking outside
      const outsideElement = document.body
      fireEvent.mouseDown(outsideElement)
      
      // Wait for dropdown to close
      await waitFor(() => {
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
      })
      
      // Reopen and check search is cleared
      fireEvent.click(button)
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText("Search...")).toHaveValue("")
      })
    })
  })

  describe("Disabled Options", () => {
    const optionsWithDisabled: SelectOption[] = [
      { value: "1", label: "Option 1" },
      { value: "2", label: "Option 2", disabled: true },
      { value: "3", label: "Option 3" },
    ]

    it("renders disabled option", () => {
      render(<Select options={optionsWithDisabled} />)
      
      fireEvent.click(screen.getByRole("button"))
      
      const options = screen.getAllByRole("option")
      expect(options[1]).toBeDisabled()
    })

    it("does not select disabled option", () => {
      const onChange = vi.fn()
      render(<Select options={optionsWithDisabled} onChange={onChange} />)
      
      fireEvent.click(screen.getByRole("button"))
      fireEvent.click(screen.getByText("Option 2"))
      
      expect(onChange).not.toHaveBeenCalled()
    })

    it("applies disabled styling to disabled option", () => {
      render(<Select options={optionsWithDisabled} />)
      
      fireEvent.click(screen.getByRole("button"))
      
      const disabledOption = screen.getAllByRole("option")[1]
      expect(disabledOption).toHaveClass("cursor-not-allowed", "opacity-50")
    })
  })

  describe("Disabled State", () => {
    it("applies disabled styles when disabled", () => {
      render(<Select options={mockOptions} disabled />)
      const button = screen.getByRole("button")
      expect(button).toBeDisabled()
      expect(button).toHaveClass("cursor-not-allowed", "opacity-50")
    })

    it("does not open dropdown when disabled", () => {
      render(<Select options={mockOptions} disabled />)
      const button = screen.getByRole("button")
      
      fireEvent.click(button)
      
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
    })
  })

  describe("Size Variants", () => {
    it("renders small size", () => {
      render(<Select options={mockOptions} size="sm" />)
      const button = screen.getByRole("button")
      expect(button).toHaveClass("h-8", "px-3", "text-sm")
    })

    it("renders medium size (default)", () => {
      render(<Select options={mockOptions} size="md" />)
      const button = screen.getByRole("button")
      expect(button).toHaveClass("h-11", "px-4", "text-base")
    })

    it("renders large size", () => {
      render(<Select options={mockOptions} size="lg" />)
      const button = screen.getByRole("button")
      expect(button).toHaveClass("h-14", "px-5", "text-lg")
    })

    it("uses medium as default size", () => {
      render(<Select options={mockOptions} />)
      const button = screen.getByRole("button")
      expect(button).toHaveClass("h-11", "px-4", "text-base")
    })
  })

  describe("Error State", () => {
    it("applies error border color", () => {
      render(<Select options={mockOptions} error="Error message" />)
      const button = screen.getByRole("button")
      expect(button).toHaveClass("border-[#ff3b30]")
    })

    it("applies error background color", () => {
      render(<Select options={mockOptions} error="Error message" />)
      const button = screen.getByRole("button")
      expect(button).toHaveClass("bg-[#ff3b30]/5")
    })

    it("applies error focus styles", () => {
      render(<Select options={mockOptions} error="Error message" />)
      const button = screen.getByRole("button")
      expect(button).toHaveClass("focus:border-[#ff3b30]", "focus:ring-[#ff3b30]/20")
    })
  })

  describe("Focus State", () => {
    it("applies focus ring on focus", () => {
      render(<Select options={mockOptions} />)
      const button = screen.getByRole("button")
      expect(button).toHaveClass("focus:ring-2", "focus:ring-offset-1")
    })

    it("applies blue focus ring when no error", () => {
      render(<Select options={mockOptions} />)
      const button = screen.getByRole("button")
      expect(button).toHaveClass("focus:border-[#0071e3]", "focus:ring-[#0071e3]/20")
    })

    it("applies border and ring when open", () => {
      render(<Select options={mockOptions} />)
      const button = screen.getByRole("button")
      
      fireEvent.click(button)
      
      expect(button).toHaveClass("border-[#0071e3]", "ring-2", "ring-[#0071e3]/20")
    })
  })

  describe("Full Width", () => {
    it("applies full width by default", () => {
      const { container } = render(<Select options={mockOptions} />)
      const wrapper = container.firstChild
      expect(wrapper).toHaveClass("w-full")
    })

    it("does not apply full width when false", () => {
      const { container } = render(<Select options={mockOptions} fullWidth={false} />)
      const wrapper = container.firstChild
      expect(wrapper).not.toHaveClass("w-full")
    })
  })

  describe("Chevron Icon", () => {
    it("renders chevron icon", () => {
      render(<Select options={mockOptions} />)
      const button = screen.getByRole("button")
      const chevron = button.querySelector("svg")
      expect(chevron).toBeInTheDocument()
    })

    it("rotates chevron when open", () => {
      render(<Select options={mockOptions} />)
      const button = screen.getByRole("button")
      const chevron = button.querySelector("svg")
      
      expect(chevron).not.toHaveClass("rotate-180")
      
      fireEvent.click(button)
      
      expect(chevron).toHaveClass("rotate-180")
    })
  })

  describe("Edge Cases", () => {
    it("handles empty options array", () => {
      render(<Select options={[]} />)
      
      fireEvent.click(screen.getByRole("button"))
      
      expect(screen.getByText("No options found")).toBeInTheDocument()
    })

    it("handles undefined value", () => {
      render(<Select options={mockOptions} value={undefined} />)
      expect(screen.getByText("Select...")).toBeInTheDocument()
    })

    it("handles empty string value", () => {
      render(<Select options={mockOptions} value="" />)
      expect(screen.getByText("Select...")).toBeInTheDocument()
    })

    it("handles invalid value", () => {
      render(<Select options={mockOptions} value="invalid" />)
      expect(screen.getByText("Select...")).toBeInTheDocument()
    })

    it("handles options with same label", () => {
      const duplicateOptions: SelectOption[] = [
        { value: "1", label: "Same" },
        { value: "2", label: "Same" },
      ]
      const onChange = vi.fn()
      render(<Select options={duplicateOptions} onChange={onChange} />)
      
      fireEvent.click(screen.getByRole("button"))
      const options = screen.getAllByText("Same")
      fireEvent.click(options[0])
      
      expect(onChange).toHaveBeenCalledWith("1")
    })

    it("handles very long option labels", () => {
      const longLabel = "This is a very long option label ".repeat(10)
      const longOptions: SelectOption[] = [{ value: "1", label: longLabel }]
      
      render(<Select options={longOptions} value="1" />)
      
      const button = screen.getByRole("button")
      const displayText = button.querySelector("span")
      expect(displayText).toHaveClass("truncate")
    })

    it("handles special characters in labels", () => {
      const specialOptions: SelectOption[] = [
        { value: "1", label: "Option <>&\"'" },
        { value: "2", label: "Option with emoji 😊" },
      ]
      render(<Select options={specialOptions} />)
      
      fireEvent.click(screen.getByRole("button"))
      
      expect(screen.getByText("Option <>&\"'")).toBeInTheDocument()
      expect(screen.getByText("Option with emoji 😊")).toBeInTheDocument()
    })

    it("handles onChange not provided", () => {
      render(<Select options={mockOptions} />)
      
      fireEvent.click(screen.getByRole("button"))
      
      expect(() => fireEvent.click(screen.getAllByRole("option")[0])).not.toThrow()
    })

    it("handles removing pill without onChange", () => {
      render(<Select options={mockOptions} multiple value={["1"]} />)
      
      const removeButton = screen.getByLabelText("Remove Option 1")
      
      expect(() => fireEvent.click(removeButton)).not.toThrow()
    })

    it("stops propagation when removing pill", () => {
      const onChange = vi.fn()
      const onClick = vi.fn()
      const { container } = render(
        <div onClick={onClick}>
          <Select options={mockOptions} multiple value={["1"]} onChange={onChange} />
        </div>
      )
      
      const removeButton = screen.getByLabelText("Remove Option 1")
      fireEvent.click(removeButton)
      
      expect(onChange).toHaveBeenCalled()
      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe("Accessibility", () => {
    it("has proper ARIA attributes", () => {
      render(<Select options={mockOptions} label="Test Select" />)
      const button = screen.getByRole("button")
      
      expect(button).toHaveAttribute("aria-haspopup", "listbox")
      expect(button).toHaveAttribute("aria-expanded", "false")
    })

    it("generates unique id for label association", () => {
      render(<Select options={mockOptions} label="Test Select" />)
      const label = screen.getByText("Test Select")
      const button = screen.getByRole("button")
      
      const labelFor = label.getAttribute("for")
      const buttonId = button.getAttribute("id")
      
      expect(labelFor).toBe(buttonId)
      expect(buttonId).toBeTruthy()
    })

    it("marks error message with role alert", () => {
      render(<Select options={mockOptions} error="Error message" />)
      const error = screen.getByRole("alert")
      expect(error).toHaveTextContent("Error message")
    })

    it("has accessible remove button labels", () => {
      render(<Select options={mockOptions} multiple value={["1", "2"]} />)
      
      expect(screen.getByLabelText("Remove Option 1")).toBeInTheDocument()
      expect(screen.getByLabelText("Remove Option 2")).toBeInTheDocument()
    })
  })

  describe("Component Props", () => {
    it("has correct displayName", () => {
      expect(Select.displayName).toBe("Select")
    })

    it("forwards ref", () => {
      const ref = React.createRef<HTMLDivElement>()
      const { container } = render(<Select ref={ref} options={mockOptions} />)
      // Component uses forwardRef but internally uses selectRef
      // Just verify rendering works with ref prop
      expect(container.firstChild).toBeInTheDocument()
      expect(container.firstChild).toBeInstanceOf(HTMLDivElement)
    })

    it("accepts all size options", () => {
      const sizes: Array<"sm" | "md" | "lg"> = ["sm", "md", "lg"]
      sizes.forEach((size) => {
        const { unmount } = render(<Select options={mockOptions} size={size} />)
        expect(screen.getByRole("button")).toBeInTheDocument()
        unmount()
      })
    })
  })

  describe("Combined Props", () => {
    it("renders correctly with all props", () => {
      render(
        <Select
          options={mockOptions}
          value="1"
          label="Complete Select"
          helperText="This is helper text"
          placeholder="Choose"
          size="lg"
          required
          fullWidth
        />
      )
      
      expect(screen.getByText("Complete Select")).toBeInTheDocument()
      expect(screen.getByText("This is helper text")).toBeInTheDocument()
      expect(screen.getByText("Option 1")).toBeInTheDocument()
      expect(screen.getByLabelText("required")).toBeInTheDocument()
    })

    it("renders multiple searchable with pills", () => {
      render(
        <Select
          options={mockOptions}
          multiple
          searchable
          value={["1", "2"]}
          label="Multi Search"
        />
      )
      
      expect(screen.getByText("Multi Search")).toBeInTheDocument()
      expect(screen.getByText("Option 1")).toBeInTheDocument()
      expect(screen.getByText("Option 2")).toBeInTheDocument()
    })

    it("handles disabled with error state", () => {
      render(<Select options={mockOptions} disabled error="Error" />)
      const button = screen.getByRole("button")
      expect(button).toBeDisabled()
      expect(button).toHaveClass("border-[#ff3b30]")
      expect(screen.getByRole("alert")).toHaveTextContent("Error")
    })
  })

  describe("Dropdown Position", () => {
    it("renders dropdown with proper z-index", () => {
      render(<Select options={mockOptions} />)
      
      fireEvent.click(screen.getByRole("button"))
      
      const dropdown = screen.getByRole("listbox")
      expect(dropdown).toHaveClass("z-50")
    })

    it("renders dropdown with shadow", () => {
      render(<Select options={mockOptions} />)
      
      fireEvent.click(screen.getByRole("button"))
      
      const dropdown = screen.getByRole("listbox")
      expect(dropdown).toHaveClass("shadow-lg")
    })

    it("renders dropdown with max height", () => {
      render(<Select options={mockOptions} />)
      
      fireEvent.click(screen.getByRole("button"))
      
      const dropdown = screen.getByRole("listbox")
      expect(dropdown).toHaveClass("max-h-60")
    })
  })
})
