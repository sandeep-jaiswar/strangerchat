import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Chip } from "./Chip"

describe("Chip", () => {
  it("renders with children", () => {
    render(<Chip>Cameron</Chip>)
    expect(screen.getByText("Cameron")).toBeInTheDocument()
  })

  it("renders remove button when removable", () => {
    render(<Chip removable>Cameron</Chip>)
    expect(screen.getByRole("button", { name: "Remove" })).toBeInTheDocument()
  })

  it("does not render remove button when removable is false", () => {
    render(<Chip removable={false}>Cameron</Chip>)
    expect(screen.queryByRole("button", { name: "Remove" })).not.toBeInTheDocument()
  })

  it("calls onRemove when remove button is clicked", () => {
    const onRemove = vi.fn()
    render(<Chip onRemove={onRemove}>Cameron</Chip>)
    fireEvent.click(screen.getByRole("button", { name: "Remove" }))
    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  it("applies soft secondary intent by default", () => {
    const { container } = render(<Chip>Default</Chip>)
    const chip = container.querySelector("span")
    expect(chip).toHaveClass("text-neutral-700")
  })

  it("applies solid variant", () => {
    const { container } = render(
      <Chip variant="solid" intent="primary">
        Solid
      </Chip>
    )
    const chip = container.querySelector("span")
    expect(chip).toHaveClass("bg-primary")
    expect(chip).toHaveClass("text-primary-foreground")
  })

  it("applies custom className", () => {
    const { container } = render(<Chip className="custom-class">Custom</Chip>)
    const chip = container.querySelector("span")
    expect(chip).toHaveClass("custom-class")
  })
})
