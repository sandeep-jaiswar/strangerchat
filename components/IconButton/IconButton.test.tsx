import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { IconButton } from "./IconButton"

describe("IconButton", () => {
  it("renders button with aria-label", () => {
    render(<IconButton aria-label="Add item">+</IconButton>)
    expect(screen.getByRole("button", { name: "Add item" })).toBeInTheDocument()
  })

  it("applies ghost secondary variant by default", () => {
    const { container } = render(<IconButton aria-label="Test">+</IconButton>)
    const btn = container.querySelector("button")
    expect(btn).toHaveClass("bg-transparent")
    expect(btn).toHaveClass("text-neutral-500")
  })

  it("applies solid primary variant", () => {
    const { container } = render(
      <IconButton variant="solid" intent="primary" aria-label="Test">
        +
      </IconButton>
    )
    const btn = container.querySelector("button")
    expect(btn).toHaveClass("bg-primary")
    expect(btn).toHaveClass("text-primary-foreground")
  })

  it("applies outline variant", () => {
    const { container } = render(
      <IconButton variant="outline" intent="secondary" aria-label="Test">
        +
      </IconButton>
    )
    const btn = container.querySelector("button")
    expect(btn).toHaveClass("border")
    expect(btn).toHaveClass("border-neutral-300")
  })

  it("applies size classes", () => {
    const { container } = render(
      <IconButton size="lg" aria-label="Test">
        +
      </IconButton>
    )
    const btn = container.querySelector("button")
    expect(btn).toHaveClass("h-12")
    expect(btn).toHaveClass("w-12")
  })

  it("applies rounded classes", () => {
    const { container } = render(
      <IconButton rounded="full" aria-label="Test">
        +
      </IconButton>
    )
    const btn = container.querySelector("button")
    expect(btn).toHaveClass("rounded-full")
  })

  it("renders disabled state", () => {
    render(
      <IconButton disabled aria-label="Test">
        +
      </IconButton>
    )
    expect(screen.getByRole("button")).toBeDisabled()
  })

  it("applies custom className", () => {
    const { container } = render(
      <IconButton className="custom-class" aria-label="Test">
        +
      </IconButton>
    )
    const btn = container.querySelector("button")
    expect(btn).toHaveClass("custom-class")
  })
})
