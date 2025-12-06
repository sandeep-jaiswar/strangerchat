import { fireEvent, render, screen } from "@testing-library/react"
import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { Button } from "./Button"

describe("Button", () => {
  describe("Rendering", () => {
    it("should render button with text", () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument()
    })

    it("should render with default variant and intent", () => {
      render(<Button>Button</Button>)
      const button = screen.getByRole("button")
      expect(button).toHaveClass("bg-neutral-100")
    })
  })

  describe("Variants", () => {
    const variants = ["filled", "tinted", "bordered", "plain"] as const

    variants.forEach((variant) => {
      it(`should render ${variant} variant`, () => {
        render(<Button variant={variant}>Button</Button>)
        expect(screen.getByRole("button")).toBeInTheDocument()
      })
    })
  })

  describe("Intents", () => {
    const intents = ["primary", "secondary", "success", "danger", "warning", "info"] as const

    intents.forEach((intent) => {
      it(`should render ${intent} intent`, () => {
        render(<Button intent={intent}>Button</Button>)
        expect(screen.getByRole("button")).toBeInTheDocument()
      })
    })
  })

  describe("Sizes", () => {
    it("should render small size", () => {
      render(<Button size="sm">Small</Button>)
      expect(screen.getByRole("button")).toHaveClass("h-8")
    })

    it("should render medium size (default)", () => {
      render(<Button size="md">Medium</Button>)
      expect(screen.getByRole("button")).toHaveClass("h-11")
    })

    it("should render large size", () => {
      render(<Button size="lg">Large</Button>)
      expect(screen.getByRole("button")).toHaveClass("h-14")
    })
  })

  describe("Icons", () => {
    const TestIcon = () => <span data-testid="test-icon">Icon</span>

    it("should render left icon", () => {
      render(<Button leftIcon={<TestIcon />}>Button</Button>)
      expect(screen.getByTestId("test-icon")).toBeInTheDocument()
    })

    it("should render right icon", () => {
      render(<Button rightIcon={<TestIcon />}>Button</Button>)
      expect(screen.getByTestId("test-icon")).toBeInTheDocument()
    })

    it("should render both icons", () => {
      render(
        <Button leftIcon={<TestIcon />} rightIcon={<TestIcon />}>
          Button
        </Button>
      )
      expect(screen.getAllByTestId("test-icon")).toHaveLength(2)
    })

    it("should not show right icon when loading", () => {
      render(
        <Button rightIcon={<TestIcon />} loading>
          Button
        </Button>
      )
      expect(screen.queryByTestId("test-icon")).not.toBeInTheDocument()
    })

    it("should not show left icon when loading", () => {
      render(
        <Button leftIcon={<TestIcon />} loading>
          Button
        </Button>
      )
      expect(screen.queryByTestId("test-icon")).not.toBeInTheDocument()
    })
  })

  describe("Loading state", () => {
    it("should show loading spinner", () => {
      render(<Button loading>Loading</Button>)
      const button = screen.getByRole("button")
      expect(button).toHaveAttribute("aria-busy", "true")
      expect(button.querySelector("svg")).toBeInTheDocument()
    })

    it("should be disabled when loading", () => {
      render(<Button loading>Loading</Button>)
      expect(screen.getByRole("button")).toBeDisabled()
    })
  })

  describe("Disabled state", () => {
    it("should be disabled", () => {
      render(<Button disabled>Disabled</Button>)
      expect(screen.getByRole("button")).toBeDisabled()
    })

    it("should have disabled styling", () => {
      render(<Button disabled>Disabled</Button>)
      expect(screen.getByRole("button")).toHaveClass("disabled:opacity-50")
    })

    it("should not trigger onClick when disabled", () => {
      const handleClick = vi.fn()
      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      )
      fireEvent.click(screen.getByRole("button"))
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe("Full width", () => {
    it("should render full width", () => {
      render(<Button fullWidth>Full Width</Button>)
      expect(screen.getByRole("button")).toHaveClass("w-full")
    })
  })

  describe("Interaction", () => {
    it("should call onClick handler", () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click</Button>)
      fireEvent.click(screen.getByRole("button"))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it("should support custom type attribute", () => {
      render(<Button type="submit">Submit</Button>)
      expect(screen.getByRole("button")).toHaveAttribute("type", "submit")
    })

    it("should have default type button", () => {
      render(<Button>Button</Button>)
      expect(screen.getByRole("button")).toHaveAttribute("type", "button")
    })
  })

  describe("Accessibility", () => {
    it("should support custom className", () => {
      render(<Button className="custom-class">Button</Button>)
      expect(screen.getByRole("button")).toHaveClass("custom-class")
    })

    it("should forward ref", () => {
      const ref = React.createRef<HTMLButtonElement>()
      render(<Button ref={ref}>Button</Button>)
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    })

    it("should have focus ring styles", () => {
      render(<Button>Button</Button>)
      expect(screen.getByRole("button")).toHaveClass("focus:ring-2")
    })

    it("should support aria attributes", () => {
      render(<Button aria-label="Custom label">Button</Button>)
      expect(screen.getByRole("button")).toHaveAttribute("aria-label", "Custom label")
    })

    it("should have aria-busy when loading", () => {
      render(<Button loading>Loading</Button>)
      expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true")
    })

    it("should not have aria-busy when not loading", () => {
      render(<Button>Button</Button>)
      expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "false")
    })
  })

  describe("Combinations", () => {
    it("should render filled primary button", () => {
      render(
        <Button variant="filled" intent="primary">
          Button
        </Button>
      )
      const button = screen.getByRole("button")
      expect(button).toBeInTheDocument()
    })

    it("should render large bordered danger button with icon", () => {
      const Icon = () => <span data-testid="icon">!</span>
      render(
        <Button variant="bordered" intent="danger" size="lg" leftIcon={<Icon />}>
          Delete
        </Button>
      )
      expect(screen.getByRole("button")).toHaveClass("h-14")
      expect(screen.getByTestId("icon")).toBeInTheDocument()
    })

    it("should render full width loading button", () => {
      render(
        <Button fullWidth loading>
          Processing
        </Button>
      )
      const button = screen.getByRole("button")
      expect(button).toHaveClass("w-full")
      expect(button).toBeDisabled()
    })
  })
})
