import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { DatePicker } from "./DatePicker"

describe("DatePicker", () => {
  it("renders with placeholder", () => {
    render(<DatePicker placeholder="Pick a date" />)
    expect(screen.getByText("Pick a date")).toBeInTheDocument()
  })

  it("renders with selected date", () => {
    render(<DatePicker value={new Date(2022, 9, 16)} />)
    expect(screen.getByText("Oct 16, 2022")).toBeInTheDocument()
  })

  it("renders disabled state", () => {
    render(<DatePicker disabled />)
    const button = screen.getByRole("button")
    expect(button).toBeDisabled()
  })

  it("applies custom className", () => {
    render(<DatePicker className="custom-class" />)
    const button = screen.getByRole("button")
    expect(button).toHaveClass("custom-class")
  })
})
