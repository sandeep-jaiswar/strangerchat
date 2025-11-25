import { fireEvent, render, screen } from "@testing-library/react"
import React from "react"
import { vi } from "vitest"
import { Toast } from "./Toast"

describe("Toast", () => {
  it("renders message", () => {
    render(<Toast message="Msg" onClose={() => {}} />)
    expect(screen.getByText("Msg")).toBeInTheDocument()
  })

  it("calls onClose when button clicked", () => {
    const onClose = vi.fn()
    render(<Toast message="Msg" onClose={onClose} />)
    fireEvent.click(screen.getByText("Close"))
    expect(onClose).toHaveBeenCalled()
  })

  it("renders correct background for type", () => {
    const { rerender, container } = render(<Toast message="Msg" type="success" onClose={() => {}} />)
    expect(container.firstChild).toHaveClass("bg-success")
    rerender(<Toast message="Msg" type="error" onClose={() => {}} />)
    expect(container.firstChild).toHaveClass("bg-error")
    rerender(<Toast message="Msg" type="info" onClose={() => {}} />)
    expect(container.firstChild).toHaveClass("bg-neutral-800")
  })

  it("applies custom className", () => {
    const { container } = render(<Toast message="Msg" onClose={() => {}} className="custom-toast" />)
    expect(container.firstChild).toHaveClass("custom-toast")
  })

  it("renders default type as info", () => {
    const { container } = render(<Toast message="Msg" onClose={() => {}} />)
    expect(container.firstChild).toHaveClass("bg-neutral-800")
  })

  it("handles empty message", () => {
    render(<Toast message="" onClose={() => {}} />)
    const emptySpans = screen.getAllByText("")
    expect(emptySpans.length).toBeGreaterThan(0)
  })
})
