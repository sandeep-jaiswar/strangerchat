import { fireEvent, render, screen } from "@testing-library/react"
import React from "react"
import { describe, expect, it, vi } from "vitest"
import { Chip } from "./Chip"

describe("Chip", () => {
  describe("Rendering", () => {
    it("should render chip with text", () => {
      render(<Chip>Tag</Chip>)
      expect(screen.getByText("Tag")).toBeInTheDocument()
    })

    it("should render with default variant and intent", () => {
      render(<Chip>Chip</Chip>)
      expect(screen.getByText("Chip")).toHaveClass("bg-neutral-100")
    })

    it("should have role status", () => {
      render(<Chip>Status</Chip>)
      expect(screen.getByRole("status")).toBeInTheDocument()
    })
  })

  describe("Variants", () => {
    const variants = ["solid", "outline", "soft"] as const

    variants.forEach((variant) => {
      it(`should render ${variant} variant`, () => {
        render(<Chip variant={variant}>Chip</Chip>)
        expect(screen.getByText("Chip")).toBeInTheDocument()
      })
    })
  })

  describe("Intents", () => {
    const intents = ["primary", "secondary", "success", "warning", "error"] as const

    intents.forEach((intent) => {
      it(`should render ${intent} intent`, () => {
        render(<Chip intent={intent}>Chip</Chip>)
        expect(screen.getByText("Chip")).toBeInTheDocument()
      })
    })
  })

  describe("Sizes", () => {
    it("should render small size", () => {
      render(<Chip size="sm">Small</Chip>)
      expect(screen.getByText("Small").parentElement).toHaveClass("h-6")
    })

    it("should render medium size", () => {
      render(<Chip size="md">Medium</Chip>)
      expect(screen.getByText("Medium").parentElement).toHaveClass("h-8")
    })

    it("should render large size", () => {
      render(<Chip size="lg">Large</Chip>)
      expect(screen.getByText("Large").parentElement).toHaveClass("h-10")
    })
  })

  describe("Removable", () => {
    it("should render remove button by default", () => {
      render(<Chip>Removable</Chip>)
      expect(screen.getByLabelText("Remove")).toBeInTheDocument()
    })

    it("should not render remove button when removable is false", () => {
      render(<Chip removable={false}>Not Removable</Chip>)
      expect(screen.queryByLabelText("Remove")).not.toBeInTheDocument()
    })

    it("should call onRemove when remove button is clicked", () => {
      const handleRemove = vi.fn()
      render(<Chip onRemove={handleRemove}>Removable</Chip>)

      fireEvent.click(screen.getByLabelText("Remove"))
      expect(handleRemove).toHaveBeenCalledTimes(1)
    })

    it("should stop propagation when remove button is clicked", () => {
      const handleRemove = vi.fn()
      const handleClick = vi.fn()

      render(
        <Chip onRemove={handleRemove} onClick={handleClick}>
          Removable
        </Chip>
      )

      fireEvent.click(screen.getByLabelText("Remove"))
      expect(handleRemove).toHaveBeenCalledTimes(1)
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe("Accessibility", () => {
    it("should support custom className", () => {
      render(<Chip className="custom-class">Chip</Chip>)
      expect(screen.getByRole("status")).toHaveClass("custom-class")
    })

    it("should forward ref", () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<Chip ref={ref}>Chip</Chip>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it("should have remove button with proper aria-label", () => {
      render(<Chip>Chip</Chip>)
      expect(screen.getByLabelText("Remove")).toHaveAttribute("aria-label", "Remove")
    })

    it("should have focus ring on remove button", () => {
      render(<Chip>Chip</Chip>)
      expect(screen.getByLabelText("Remove")).toHaveClass("focus:ring-2")
    })
  })

  describe("Combinations", () => {
    it("should render solid primary chip", () => {
      render(
        <Chip variant="solid" intent="primary">
          Primary
        </Chip>
      )
      expect(screen.getByText("Primary").parentElement).toHaveClass("bg-[#0071e3]")
    })

    it("should render large outlined error chip without remove", () => {
      render(
        <Chip variant="outline" intent="error" size="lg" removable={false}>
          Error
        </Chip>
      )
      expect(screen.getByText("Error").parentElement).toHaveClass("h-10")
      expect(screen.queryByLabelText("Remove")).not.toBeInTheDocument()
    })
  })
})
