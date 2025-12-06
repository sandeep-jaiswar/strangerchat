import { fireEvent, render, screen } from "@testing-library/react"
import React from "react"
import { describe, expect, it, vi } from "vitest"
import { IconButton } from "./IconButton"

const TestIcon = () => (
  <svg data-testid="test-icon" width="20" height="20" viewBox="0 0 24 24">
    <path d="M12 5v14M5 12h14" />
  </svg>
)

describe("IconButton", () => {
  describe("Rendering", () => {
    it("should render icon button", () => {
      render(
        <IconButton aria-label="Test button">
          <TestIcon />
        </IconButton>
      )
      expect(screen.getByRole("button")).toBeInTheDocument()
      expect(screen.getByTestId("test-icon")).toBeInTheDocument()
    })

    it("should require aria-label", () => {
      render(
        <IconButton aria-label="Required label">
          <TestIcon />
        </IconButton>
      )
      expect(screen.getByLabelText("Required label")).toBeInTheDocument()
    })
  })

  describe("Variants", () => {
    const variants = ["filled", "tinted", "bordered", "plain"] as const

    variants.forEach((variant) => {
      it(`should render ${variant} variant`, () => {
        render(
          <IconButton variant={variant} aria-label="Test">
            <TestIcon />
          </IconButton>
        )
        expect(screen.getByRole("button")).toBeInTheDocument()
      })
    })
  })

  describe("Intents", () => {
    const intents = ["primary", "secondary", "success", "danger", "warning"] as const

    intents.forEach((intent) => {
      it(`should render ${intent} intent`, () => {
        render(
          <IconButton intent={intent} aria-label="Test">
            <TestIcon />
          </IconButton>
        )
        expect(screen.getByRole("button")).toBeInTheDocument()
      })
    })
  })

  describe("Sizes", () => {
    it("should render small size", () => {
      render(
        <IconButton size="sm" aria-label="Small">
          <TestIcon />
        </IconButton>
      )
      expect(screen.getByRole("button")).toHaveClass("w-9")
    })

    it("should render medium size", () => {
      render(
        <IconButton size="md" aria-label="Medium">
          <TestIcon />
        </IconButton>
      )
      expect(screen.getByRole("button")).toHaveClass("w-11")
    })

    it("should render large size", () => {
      render(
        <IconButton size="lg" aria-label="Large">
          <TestIcon />
        </IconButton>
      )
      expect(screen.getByRole("button")).toHaveClass("w-14")
    })
  })

  describe("Shapes", () => {
    it("should render circle shape by default", () => {
      render(
        <IconButton aria-label="Circle">
          <TestIcon />
        </IconButton>
      )
      expect(screen.getByRole("button")).toHaveClass("rounded-full")
    })

    it("should render rounded shape", () => {
      render(
        <IconButton shape="rounded" aria-label="Rounded">
          <TestIcon />
        </IconButton>
      )
      expect(screen.getByRole("button")).toHaveClass("rounded-xl")
    })
  })

  describe("Loading state", () => {
    it("should show loading spinner", () => {
      render(
        <IconButton loading aria-label="Loading">
          <TestIcon />
        </IconButton>
      )
      const button = screen.getByRole("button")
      expect(button).toHaveAttribute("aria-busy", "true")
      expect(button.querySelector("svg.animate-spin")).toBeInTheDocument()
    })

    it("should hide icon when loading", () => {
      render(
        <IconButton loading aria-label="Loading">
          <TestIcon />
        </IconButton>
      )
      expect(screen.queryByTestId("test-icon")).not.toBeInTheDocument()
    })

    it("should be disabled when loading", () => {
      render(
        <IconButton loading aria-label="Loading">
          <TestIcon />
        </IconButton>
      )
      expect(screen.getByRole("button")).toBeDisabled()
    })
  })

  describe("Disabled state", () => {
    it("should be disabled", () => {
      render(
        <IconButton disabled aria-label="Disabled">
          <TestIcon />
        </IconButton>
      )
      expect(screen.getByRole("button")).toBeDisabled()
    })

    it("should have disabled styling", () => {
      render(
        <IconButton disabled aria-label="Disabled">
          <TestIcon />
        </IconButton>
      )
      expect(screen.getByRole("button")).toHaveClass("disabled:opacity-50")
    })

    it("should not trigger onClick when disabled", () => {
      const handleClick = vi.fn()
      render(
        <IconButton disabled onClick={handleClick} aria-label="Disabled">
          <TestIcon />
        </IconButton>
      )
      fireEvent.click(screen.getByRole("button"))
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe("Interaction", () => {
    it("should call onClick handler", () => {
      const handleClick = vi.fn()
      render(
        <IconButton onClick={handleClick} aria-label="Click">
          <TestIcon />
        </IconButton>
      )
      fireEvent.click(screen.getByRole("button"))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it("should support custom type attribute", () => {
      render(
        <IconButton type="submit" aria-label="Submit">
          <TestIcon />
        </IconButton>
      )
      expect(screen.getByRole("button")).toHaveAttribute("type", "submit")
    })
  })

  describe("Accessibility", () => {
    it("should support custom className", () => {
      render(
        <IconButton className="custom-class" aria-label="Custom">
          <TestIcon />
        </IconButton>
      )
      expect(screen.getByRole("button")).toHaveClass("custom-class")
    })

    it("should forward ref", () => {
      const ref = React.createRef<HTMLButtonElement>()
      render(
        <IconButton ref={ref} aria-label="Ref">
          <TestIcon />
        </IconButton>
      )
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    })

    it("should have focus ring styles", () => {
      render(
        <IconButton aria-label="Focus">
          <TestIcon />
        </IconButton>
      )
      expect(screen.getByRole("button")).toHaveClass("focus:ring-2")
    })
  })
})
