import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Switch } from "./Switch"

describe("Switch", () => {
  it("renders switch element", () => {
    render(<Switch />)
    expect(screen.getByRole("switch")).toBeInTheDocument()
  })

  it("renders with label", () => {
    render(<Switch label="Enable notifications" />)
    expect(screen.getByText("Enable notifications")).toBeInTheDocument()
  })

  it("toggles checked state on click", () => {
    const onCheckedChange = vi.fn()
    render(<Switch onCheckedChange={onCheckedChange} />)
    fireEvent.click(screen.getByRole("switch"))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it("renders unchecked by default", () => {
    render(<Switch />)
    expect(screen.getByRole("switch")).toHaveAttribute("data-state", "unchecked")
  })

  it("renders checked when defaultChecked is true", () => {
    render(<Switch defaultChecked />)
    expect(screen.getByRole("switch")).toHaveAttribute("data-state", "checked")
  })

  it("renders disabled state", () => {
    render(<Switch disabled />)
    expect(screen.getByRole("switch")).toBeDisabled()
  })

  it("applies custom className", () => {
    const { container } = render(<Switch className="custom-class" />)
    const switchEl = container.querySelector("[role='switch']")
    expect(switchEl).toHaveClass("custom-class")
  })
})
