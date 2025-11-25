import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Calendar } from "./Calendar"

describe("Calendar", () => {
  it("renders calendar", () => {
    render(<Calendar />)
    expect(screen.getByText("Mon")).toBeInTheDocument()
    expect(screen.getByText("Tue")).toBeInTheDocument()
    expect(screen.getByText("Clear")).toBeInTheDocument()
  })

  it("displays current month and year", () => {
    render(<Calendar defaultValue={new Date(2022, 9, 16)} />)
    expect(screen.getByText("October 2022")).toBeInTheDocument()
  })

  it("navigates to previous month", () => {
    render(<Calendar defaultValue={new Date(2022, 9, 16)} />)
    fireEvent.click(screen.getByRole("button", { name: "Previous month" }))
    expect(screen.getByText("September 2022")).toBeInTheDocument()
  })

  it("navigates to next month", () => {
    render(<Calendar defaultValue={new Date(2022, 9, 16)} />)
    fireEvent.click(screen.getByRole("button", { name: "Next month" }))
    expect(screen.getByText("November 2022")).toBeInTheDocument()
  })

  it("calls onChange when a date is clicked", () => {
    const onChange = vi.fn()
    render(<Calendar defaultValue={new Date(2022, 9, 1)} onChange={onChange} />)
    fireEvent.click(screen.getByText("16"))
    expect(onChange).toHaveBeenCalledWith(new Date(2022, 9, 16))
  })

  it("calls onClear when clear button is clicked", () => {
    const onClear = vi.fn()
    render(<Calendar onClear={onClear} />)
    fireEvent.click(screen.getByText("Clear"))
    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it("applies custom className", () => {
    const { container } = render(<Calendar className="custom-class" />)
    expect(container.firstChild).toHaveClass("custom-class")
  })
})
