import { render, screen } from "@testing-library/react"
import React from "react"
import { describe, expect, it } from "vitest"
import { Badge } from "./Badge"

describe("Badge", () => {
  describe("Rendering", () => {
    it("should render badge with text", () => {
      render(<Badge>New</Badge>)
      expect(screen.getByText("New")).toBeInTheDocument()
    })

    it("should render with default variant and intent", () => {
      render(<Badge>Badge</Badge>)
      const badge = screen.getByText("Badge")
      expect(badge).toHaveClass("bg-[#0071e3]/10")
    })
  })

  describe("Variants", () => {
    const variants = ["filled", "outline", "soft", "minimal"] as const

    variants.forEach((variant) => {
      it(`should render ${variant} variant`, () => {
        render(<Badge variant={variant}>Badge</Badge>)
        expect(screen.getByText("Badge")).toBeInTheDocument()
      })
    })
  })

  describe("Intents", () => {
    const intents = ["primary", "secondary", "success", "warning", "error", "info", "purple", "pink", "teal"] as const

    intents.forEach((intent) => {
      it(`should render ${intent} intent`, () => {
        render(<Badge intent={intent}>Badge</Badge>)
        expect(screen.getByText("Badge")).toBeInTheDocument()
      })
    })
  })

  describe("Sizes", () => {
    it("should render small size", () => {
      render(<Badge size="sm">Small</Badge>)
      expect(screen.getByText("Small")).toHaveClass("text-xs")
    })

    it("should render medium size", () => {
      render(<Badge size="md">Medium</Badge>)
      expect(screen.getByText("Medium")).toHaveClass("text-sm")
    })

    it("should render large size", () => {
      render(<Badge size="lg">Large</Badge>)
      expect(screen.getByText("Large")).toHaveClass("text-base")
    })
  })

  describe("Icons", () => {
    const TestIcon = () => <span data-testid="test-icon">●</span>

    it("should render left icon", () => {
      render(<Badge leftIcon={<TestIcon />}>Badge</Badge>)
      expect(screen.getByTestId("test-icon")).toBeInTheDocument()
    })

    it("should render right icon", () => {
      render(<Badge rightIcon={<TestIcon />}>Badge</Badge>)
      expect(screen.getByTestId("test-icon")).toBeInTheDocument()
    })

    it("should render both icons", () => {
      render(
        <Badge leftIcon={<TestIcon />} rightIcon={<TestIcon />}>
          Badge
        </Badge>
      )
      expect(screen.getAllByTestId("test-icon")).toHaveLength(2)
    })
  })

  describe("Accessibility", () => {
    it("should support custom className", () => {
      render(<Badge className="custom-class">Badge</Badge>)
      expect(screen.getByText("Badge")).toHaveClass("custom-class")
    })

    it("should forward ref", () => {
      const ref = React.createRef<HTMLSpanElement>()
      render(<Badge ref={ref}>Badge</Badge>)
      expect(ref.current).toBeInstanceOf(HTMLSpanElement)
    })

    it("should support aria attributes", () => {
      render(<Badge aria-label="Status badge">Active</Badge>)
      expect(screen.getByLabelText("Status badge")).toBeInTheDocument()
    })
  })

  describe("Combinations", () => {
    it("should render filled success badge", () => {
      render(
        <Badge variant="filled" intent="success">
          Success
        </Badge>
      )
      expect(screen.getByText("Success")).toHaveClass("bg-[#34c759]")
    })

    it("should render large outlined error badge with icon", () => {
      const Icon = () => <span data-testid="icon">!</span>
      render(
        <Badge variant="outline" intent="error" size="lg" leftIcon={<Icon />}>
          Error
        </Badge>
      )
      expect(screen.getByText("Error")).toHaveClass("text-base")
      expect(screen.getByTestId("icon")).toBeInTheDocument()
    })
  })
})
