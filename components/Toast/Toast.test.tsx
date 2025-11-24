import { fireEvent, render, screen } from "@testing-library/react"
import React from "react"
import { Toast } from "./Toast"

describe("Toast", () => {
  it("renders message", () => {
    render(<Toast message="Msg" onClose={() => {}} />)
    expect(screen.getByText("Msg")).toBeInTheDocument()
  })

  it("calls onClose when button clicked", () => {
    const onClose = jest.fn()
    render(<Toast message="Msg" onClose={onClose} />)
    fireEvent.click(screen.getByText("Close"))
    expect(onClose).toHaveBeenCalled()
  })

  it("renders correct background for type", () => {
    const { rerender } = render(<Toast message="Msg" type="success" onClose={() => {}} />)
    expect(screen.getByText("Msg").parentElement).toHaveStyle("background: #dfd")
    rerender(<Toast message="Msg" type="error" onClose={() => {}} />)
    expect(screen.getByText("Msg").parentElement).toHaveStyle("background: #fdd")
    rerender(<Toast message="Msg" type="info" onClose={() => {}} />)
    expect(screen.getByText("Msg").parentElement).toHaveStyle("background: #eee")
  })
})
