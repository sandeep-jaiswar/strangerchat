import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { describe, expect, it, vi } from "vitest"

import { Input } from "./Input"

describe("Input", () => {
  describe("Rendering", () => {
    it("should render input", () => {
      render(<Input placeholder="Enter text" />)
      expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument()
    })

    it("should render with label", () => {
      render(<Input label="Username" />)
      expect(screen.getByLabelText("Username")).toBeInTheDocument()
    })

    it("should render with helper text", () => {
      render(<Input helperText="Enter your username" />)
      expect(screen.getByText("Enter your username")).toBeInTheDocument()
    })

    it("should generate unique id when not provided", () => {
      const { container } = render(<Input label="Test" />)
      const input = container.querySelector("input")
      expect(input?.id).toBeTruthy()
    })

    it("should use provided id", () => {
      render(<Input id="custom-id" label="Test" />)
      expect(screen.getByLabelText("Test")).toHaveAttribute("id", "custom-id")
    })
  })

  describe("Sizes", () => {
    it("should render small size", () => {
      render(<Input size="sm" />)
      expect(screen.getByRole("textbox")).toHaveClass("h-8")
    })

    it("should render medium size", () => {
      render(<Input size="md" />)
      expect(screen.getByRole("textbox")).toHaveClass("h-11")
    })

    it("should render large size", () => {
      render(<Input size="lg" />)
      expect(screen.getByRole("textbox")).toHaveClass("h-14")
    })
  })

  describe("States", () => {
    it("should render error state", () => {
      render(<Input error="This field is required" />)
      expect(screen.getByRole("alert")).toHaveTextContent("This field is required")
      expect(screen.getByRole("textbox")).toHaveClass("border-[#ff3b30]")
    })

    it("should render success state", () => {
      render(<Input success="Valid input" />)
      expect(screen.getByText("Valid input")).toBeInTheDocument()
      expect(screen.getByRole("textbox")).toHaveClass("border-[#34c759]")
    })

    it("should prioritize error over success", () => {
      render(<Input error="Error message" success="Success message" />)
      expect(screen.getByRole("alert")).toHaveTextContent("Error message")
      expect(screen.queryByText("Success message")).not.toBeInTheDocument()
    })

    it("should have aria-invalid when error exists", () => {
      render(<Input error="Error" />)
      expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true")
    })

    it("should not show helper text when error exists", () => {
      render(<Input helperText="Helper" error="Error" />)
      expect(screen.queryByText("Helper")).not.toBeInTheDocument()
    })

    it("should not show helper text when success exists", () => {
      render(<Input helperText="Helper" success="Success" />)
      expect(screen.queryByText("Helper")).not.toBeInTheDocument()
    })
  })

  describe("Required field", () => {
    it("should show required asterisk", () => {
      render(<Input label="Name" required />)
      expect(screen.getByLabelText("required")).toBeInTheDocument()
    })

    it("should have required attribute", () => {
      render(<Input required />)
      expect(screen.getByRole("textbox")).toBeRequired()
    })
  })

  describe("Icons", () => {
    const TestIcon = () => <span data-testid="test-icon">→</span>

    it("should render left icon", () => {
      render(<Input leftIcon={<TestIcon />} />)
      expect(screen.getByTestId("test-icon")).toBeInTheDocument()
    })

    it("should render right icon", () => {
      render(<Input rightIcon={<TestIcon />} />)
      expect(screen.getByTestId("test-icon")).toBeInTheDocument()
    })

    it("should render both icons", () => {
      render(<Input leftIcon={<TestIcon />} rightIcon={<TestIcon />} />)
      expect(screen.getAllByTestId("test-icon")).toHaveLength(2)
    })

    it("should adjust padding for left icon", () => {
      render(<Input leftIcon={<TestIcon />} size="md" />)
      expect(screen.getByRole("textbox")).toHaveClass("pl-11")
    })

    it("should adjust padding for right icon", () => {
      render(<Input rightIcon={<TestIcon />} size="md" />)
      expect(screen.getByRole("textbox")).toHaveClass("pr-11")
    })
  })

  describe("Disabled state", () => {
    it("should be disabled", () => {
      render(<Input disabled />)
      expect(screen.getByRole("textbox")).toBeDisabled()
    })

    it("should have disabled styling", () => {
      render(<Input disabled />)
      expect(screen.getByRole("textbox")).toHaveClass("opacity-50")
    })
  })

  describe("Full width", () => {
    it("should be full width by default", () => {
      const { container } = render(<Input />)
      expect(container.firstChild).toHaveClass("w-full")
    })

    it("should not be full width when specified", () => {
      const { container } = render(<Input fullWidth={false} />)
      expect(container.firstChild).not.toHaveClass("w-full")
    })
  })

  describe("Interaction", () => {
    it("should handle onChange", async () => {
      const handleChange = vi.fn()
      render(<Input onChange={handleChange} />)

      await userEvent.type(screen.getByRole("textbox"), "test")
      expect(handleChange).toHaveBeenCalled()
    })

    it("should handle onBlur", () => {
      const handleBlur = vi.fn()
      render(<Input onBlur={handleBlur} />)

      fireEvent.blur(screen.getByRole("textbox"))
      expect(handleBlur).toHaveBeenCalledTimes(1)
    })

    it("should handle onFocus", () => {
      const handleFocus = vi.fn()
      render(<Input onFocus={handleFocus} />)

      fireEvent.focus(screen.getByRole("textbox"))
      expect(handleFocus).toHaveBeenCalledTimes(1)
    })
  })

  describe("Accessibility", () => {
    it("should have proper aria-describedby with helper text", () => {
      render(<Input id="test" helperText="Helper text" />)
      expect(screen.getByRole("textbox")).toHaveAttribute("aria-describedby", "test-helper")
    })

    it("should have proper aria-describedby with error", () => {
      render(<Input id="test" error="Error message" />)
      expect(screen.getByRole("textbox")).toHaveAttribute("aria-describedby", "test-error")
    })

    it("should have proper aria-describedby with success", () => {
      render(<Input id="test" success="Success message" />)
      expect(screen.getByRole("textbox")).toHaveAttribute("aria-describedby", "test-success")
    })

    it("should support custom className", () => {
      render(<Input className="custom-class" />)
      expect(screen.getByRole("textbox")).toHaveClass("custom-class")
    })

    it("should forward ref", () => {
      const ref = React.createRef<HTMLInputElement>()
      render(<Input ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
    })

    it("should have focus ring styles", () => {
      render(<Input />)
      expect(screen.getByRole("textbox")).toHaveClass("focus:ring-2")
    })
  })

  describe("Input types", () => {
    it("should support email type", () => {
      render(<Input type="email" />)
      expect(screen.getByRole("textbox")).toHaveAttribute("type", "email")
    })

    it("should support password type", () => {
      const { container } = render(<Input type="password" />)
      const input = container.querySelector('input[type="password"]') as HTMLInputElement
      expect(input).toBeInTheDocument()
      expect(input.type).toBe("password")
    })

    it("should support number type", () => {
      render(<Input type="number" />)
      const input = screen.getByRole("spinbutton") as HTMLInputElement
      expect(input.type).toBe("number")
    })
  })
})
