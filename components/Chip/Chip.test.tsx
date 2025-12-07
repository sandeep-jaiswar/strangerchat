import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { describe, expect, it, vi } from "vitest"
import { Chip } from "./Chip"

describe("Chip component", () => {
  describe("Rendering", () => {
    it("renders children text", () => {
      render(<Chip>Test Chip</Chip>)
      expect(screen.getByText("Test Chip")).toBeInTheDocument()
    })

    it("renders with default props (soft, secondary, md)", () => {
      const { container } = render(<Chip>Default</Chip>)
      const chip = container.firstChild as HTMLElement
      expect(chip).toHaveClass("bg-neutral-100")
      expect(chip).toHaveClass("text-neutral-700")
      expect(chip).toHaveClass("h-8")
    })

    it("has role status", () => {
      render(<Chip>Chip</Chip>)
      expect(screen.getByRole("status")).toBeInTheDocument()
    })

    it("renders with custom className", () => {
      const { container } = render(<Chip className="custom-class">Chip</Chip>)
      expect(container.firstChild).toHaveClass("custom-class")
    })

    it("forwards ref correctly", () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<Chip ref={ref}>Chip</Chip>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it("displays component displayName", () => {
      expect(Chip.displayName).toBe("Chip")
    })
  })

  describe("Variants", () => {
    describe("Solid variant", () => {
      it("renders solid primary chip", () => {
        const { container } = render(
          <Chip variant="solid" intent="primary">
            Primary
          </Chip>
        )
        const chip = container.firstChild as HTMLElement
        expect(chip).toHaveClass("bg-[#0071e3]", "text-white")
      })

      it("renders solid secondary chip", () => {
        const { container } = render(
          <Chip variant="solid" intent="secondary">
            Secondary
          </Chip>
        )
        const chip = container.firstChild as HTMLElement
        expect(chip).toHaveClass("bg-neutral-700", "text-white")
      })

      it("renders solid success chip", () => {
        const { container } = render(
          <Chip variant="solid" intent="success">
            Success
          </Chip>
        )
        const chip = container.firstChild as HTMLElement
        expect(chip).toHaveClass("bg-[#34c759]", "text-white")
      })

      it("renders solid warning chip", () => {
        const { container } = render(
          <Chip variant="solid" intent="warning">
            Warning
          </Chip>
        )
        const chip = container.firstChild as HTMLElement
        expect(chip).toHaveClass("bg-[#ff9500]", "text-white")
      })

      it("renders solid error chip", () => {
        const { container } = render(
          <Chip variant="solid" intent="error">
            Error
          </Chip>
        )
        const chip = container.firstChild as HTMLElement
        expect(chip).toHaveClass("bg-[#ff3b30]", "text-white")
      })
    })

    describe("Outline variant", () => {
      it("renders outline primary chip", () => {
        const { container } = render(
          <Chip variant="outline" intent="primary">
            Primary
          </Chip>
        )
        const chip = container.firstChild as HTMLElement
        expect(chip).toHaveClass("border-2", "border-[#0071e3]", "text-[#0071e3]")
      })

      it("renders outline secondary chip", () => {
        const { container } = render(
          <Chip variant="outline" intent="secondary">
            Secondary
          </Chip>
        )
        const chip = container.firstChild as HTMLElement
        expect(chip).toHaveClass("border-2", "border-neutral-400", "text-neutral-700")
      })

      it("renders outline success chip", () => {
        const { container } = render(
          <Chip variant="outline" intent="success">
            Success
          </Chip>
        )
        const chip = container.firstChild as HTMLElement
        expect(chip).toHaveClass("border-2", "border-[#34c759]", "text-[#34c759]")
      })

      it("renders outline warning chip", () => {
        const { container } = render(
          <Chip variant="outline" intent="warning">
            Warning
          </Chip>
        )
        const chip = container.firstChild as HTMLElement
        expect(chip).toHaveClass("border-2", "border-[#ff9500]", "text-[#ff9500]")
      })

      it("renders outline error chip", () => {
        const { container } = render(
          <Chip variant="outline" intent="error">
            Error
          </Chip>
        )
        const chip = container.firstChild as HTMLElement
        expect(chip).toHaveClass("border-2", "border-[#ff3b30]", "text-[#ff3b30]")
      })
    })

    describe("Soft variant", () => {
      it("renders soft primary chip", () => {
        const { container } = render(
          <Chip variant="soft" intent="primary">
            Primary
          </Chip>
        )
        const chip = container.firstChild as HTMLElement
        expect(chip).toHaveClass("bg-[#0071e3]/10", "text-[#0071e3]")
      })

      it("renders soft secondary chip", () => {
        const { container } = render(
          <Chip variant="soft" intent="secondary">
            Secondary
          </Chip>
        )
        const chip = container.firstChild as HTMLElement
        expect(chip).toHaveClass("bg-neutral-100", "text-neutral-700")
      })

      it("renders soft success chip", () => {
        const { container } = render(
          <Chip variant="soft" intent="success">
            Success
          </Chip>
        )
        const chip = container.firstChild as HTMLElement
        expect(chip).toHaveClass("bg-[#34c759]/10", "text-[#34c759]")
      })

      it("renders soft warning chip", () => {
        const { container } = render(
          <Chip variant="soft" intent="warning">
            Warning
          </Chip>
        )
        const chip = container.firstChild as HTMLElement
        expect(chip).toHaveClass("bg-[#ff9500]/10", "text-[#ff9500]")
      })

      it("renders soft error chip", () => {
        const { container } = render(
          <Chip variant="soft" intent="error">
            Error
          </Chip>
        )
        const chip = container.firstChild as HTMLElement
        expect(chip).toHaveClass("bg-[#ff3b30]/10", "text-[#ff3b30]")
      })
    })
  })

  describe("Sizes", () => {
    it("renders small chip", () => {
      const { container } = render(<Chip size="sm">Small</Chip>)
      const chip = container.firstChild as HTMLElement
      expect(chip).toHaveClass("h-6", "px-2", "text-xs", "rounded-md")
    })

    it("renders medium chip", () => {
      const { container } = render(<Chip size="md">Medium</Chip>)
      const chip = container.firstChild as HTMLElement
      expect(chip).toHaveClass("h-8", "px-3", "text-sm", "rounded-lg")
    })

    it("renders large chip", () => {
      const { container } = render(<Chip size="lg">Large</Chip>)
      const chip = container.firstChild as HTMLElement
      expect(chip).toHaveClass("h-10", "px-4", "text-base", "rounded-xl")
    })
  })

  describe("Removable functionality", () => {
    it("renders remove button when removable is true (default)", () => {
      render(<Chip>Removable</Chip>)
      expect(screen.getByLabelText("Remove")).toBeInTheDocument()
    })

    it("does not render remove button when removable is false", () => {
      render(<Chip removable={false}>Not Removable</Chip>)
      expect(screen.queryByLabelText("Remove")).not.toBeInTheDocument()
    })

    it("calls onRemove when remove button is clicked", async () => {
      const onRemove = vi.fn()
      const user = userEvent.setup()
      render(<Chip onRemove={onRemove}>Remove Me</Chip>)

      const removeButton = screen.getByLabelText("Remove")
      await user.click(removeButton)

      expect(onRemove).toHaveBeenCalledTimes(1)
    })

    it("stops propagation when remove button is clicked", () => {
      const onRemove = vi.fn()
      const onChipClick = vi.fn()
      render(
        <Chip onRemove={onRemove} onClick={onChipClick}>
          Chip
        </Chip>
      )

      const removeButton = screen.getByLabelText("Remove")
      fireEvent.click(removeButton)

      expect(onRemove).toHaveBeenCalledTimes(1)
      expect(onChipClick).not.toHaveBeenCalled()
    })

    it("renders small remove button for small chip", () => {
      render(<Chip size="sm">Small</Chip>)
      const removeButton = screen.getByLabelText("Remove")
      expect(removeButton).toHaveClass("w-3", "h-3")
    })

    it("renders medium remove button for medium chip", () => {
      render(<Chip size="md">Medium</Chip>)
      const removeButton = screen.getByLabelText("Remove")
      expect(removeButton).toHaveClass("w-4", "h-4")
    })

    it("renders large remove button for large chip", () => {
      render(<Chip size="lg">Large</Chip>)
      const removeButton = screen.getByLabelText("Remove")
      expect(removeButton).toHaveClass("w-5", "h-5")
    })

    it("applies white focus ring for solid variant", () => {
      render(
        <Chip variant="solid" intent="primary">
          Solid
        </Chip>
      )
      const removeButton = screen.getByLabelText("Remove")
      expect(removeButton).toHaveClass("focus:ring-white")
    })

    it("applies current focus ring for outline variant", () => {
      render(
        <Chip variant="outline" intent="primary">
          Outline
        </Chip>
      )
      const removeButton = screen.getByLabelText("Remove")
      expect(removeButton).toHaveClass("focus:ring-current")
    })

    it("applies current focus ring for soft variant", () => {
      render(
        <Chip variant="soft" intent="primary">
          Soft
        </Chip>
      )
      const removeButton = screen.getByLabelText("Remove")
      expect(removeButton).toHaveClass("focus:ring-current")
    })

    it("renders SVG icon in remove button", () => {
      const { container } = render(<Chip>Chip</Chip>)
      const svg = container.querySelector("svg")
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveAttribute("viewBox", "0 0 24 24")
    })
  })

  describe("Text truncation", () => {
    it("applies truncate class to text span", () => {
      const { container } = render(<Chip>Very Long Chip Text That Should Truncate</Chip>)
      const span = container.querySelector("span")
      expect(span).toHaveClass("truncate")
    })
  })

  describe("Additional HTML attributes", () => {
    it("spreads additional props to container div", () => {
      const { container } = render(
        <Chip data-testid="custom-chip" id="chip-1">
          Chip
        </Chip>
      )
      const chip = container.firstChild as HTMLElement
      expect(chip).toHaveAttribute("data-testid", "custom-chip")
      expect(chip).toHaveAttribute("id", "chip-1")
    })

    it("handles onClick on chip container", async () => {
      const onClick = vi.fn()
      const user = userEvent.setup()
      render(<Chip onClick={onClick}>Clickable</Chip>)

      const chip = screen.getByRole("status")
      await user.click(chip)

      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })

  describe("Combination tests", () => {
    it("renders large solid error chip without remove button", () => {
      const { container } = render(
        <Chip variant="solid" intent="error" size="lg" removable={false}>
          Large Error
        </Chip>
      )
      const chip = container.firstChild as HTMLElement
      expect(chip).toHaveClass("bg-[#ff3b30]", "h-10", "px-4")
      expect(screen.queryByLabelText("Remove")).not.toBeInTheDocument()
    })

    it("renders small outline success chip with remove callback", async () => {
      const onRemove = vi.fn()
      const user = userEvent.setup()
      render(
        <Chip variant="outline" intent="success" size="sm" onRemove={onRemove}>
          Success
        </Chip>
      )

      const chip = screen.getByRole("status")
      expect(chip).toHaveClass("border-[#34c759]", "h-6")

      const removeButton = screen.getByLabelText("Remove")
      await user.click(removeButton)
      expect(onRemove).toHaveBeenCalled()
    })

    it("renders soft warning chip with custom className and props", () => {
      const { container } = render(
        <Chip variant="soft" intent="warning" className="mx-auto" aria-label="Warning chip">
          Warning
        </Chip>
      )
      const chip = container.firstChild as HTMLElement
      expect(chip).toHaveClass("bg-[#ff9500]/10", "mx-auto")
      expect(chip).toHaveAttribute("aria-label", "Warning chip")
    })
  })

  describe("Edge cases", () => {
    it("handles empty children", () => {
      render(<Chip>{""}</Chip>)
      const chip = screen.getByRole("status")
      expect(chip).toBeInTheDocument()
    })

    it("handles undefined onRemove gracefully", () => {
      render(<Chip removable={true}>Chip</Chip>)
      const removeButton = screen.getByLabelText("Remove")
      expect(() => fireEvent.click(removeButton)).not.toThrow()
    })

    it("renders with all size, variant, and intent combinations", () => {
      const sizes = ["sm", "md", "lg"] as const
      const variants = ["solid", "outline", "soft"] as const
      const intents = ["primary", "secondary", "success", "warning", "error"] as const

      sizes.forEach((size) => {
        variants.forEach((variant) => {
          intents.forEach((intent) => {
            const { unmount } = render(
              <Chip size={size} variant={variant} intent={intent}>
                Test
              </Chip>
            )
            expect(screen.getByRole("status")).toBeInTheDocument()
            unmount()
          })
        })
      })
    })
  })

  describe("Accessibility", () => {
    it("has accessible remove button with aria-label", () => {
      render(<Chip>Accessible</Chip>)
      expect(screen.getByLabelText("Remove")).toBeInTheDocument()
    })

    it("remove button is keyboard accessible", () => {
      const onRemove = vi.fn()
      render(<Chip onRemove={onRemove}>Chip</Chip>)
      const removeButton = screen.getByLabelText("Remove")
      expect(removeButton).toHaveAttribute("type", "button")
    })

    it("applies focus styles to remove button", () => {
      render(<Chip>Chip</Chip>)
      const removeButton = screen.getByLabelText("Remove")
      expect(removeButton).toHaveClass("focus:ring-2", "focus:ring-offset-1", "focus:outline-none")
    })
  })
})
