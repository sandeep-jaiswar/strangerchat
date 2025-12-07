import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Calendar } from "./Calendar"

describe("Calendar", () => {
  it("renders calendar with day labels", () => {
    render(<Calendar />)
    expect(screen.getByText("S")).toBeInTheDocument() // Sunday
    expect(screen.getByText("M")).toBeInTheDocument() // Monday
    expect(screen.getByText("T")).toBeInTheDocument() // Tuesday/Thursday
  })

  it("displays current month and year", () => {
    render(<Calendar defaultValue={new Date(2024, 11, 15)} />)
    expect(screen.getByText("December 2024")).toBeInTheDocument()
  })

  it("renders with different variants", () => {
    const { container, rerender } = render(<Calendar variant="default" />)
    expect(container.firstChild).toHaveClass("bg-white", "border")

    rerender(<Calendar variant="elevated" />)
    expect(container.firstChild).toHaveClass("shadow-lg")

    rerender(<Calendar variant="minimal" />)
    expect(container.firstChild).toHaveClass("bg-transparent")
  })

  it("navigates to previous month", () => {
    render(<Calendar defaultValue={new Date(2024, 11, 15)} />)
    fireEvent.click(screen.getByRole("button", { name: "Previous month" }))
    expect(screen.getByText("November 2024")).toBeInTheDocument()
  })

  it("navigates to next month", () => {
    render(<Calendar defaultValue={new Date(2024, 11, 15)} />)
    fireEvent.click(screen.getByRole("button", { name: "Next month" }))
    expect(screen.getByText("January 2025")).toBeInTheDocument()
  })

  it("calls onChange when a date is clicked", () => {
    const onChange = vi.fn()
    render(<Calendar defaultValue={new Date(2024, 11, 1)} onChange={onChange} />)

    const dateButton = screen.getByRole("gridcell", { name: /December 15, 2024/ })
    fireEvent.click(dateButton)

    expect(onChange).toHaveBeenCalledWith(new Date(2024, 11, 15))
  })

  it("shows Today button and navigates to today", () => {
    const onChange = vi.fn()
    const today = new Date()
    render(<Calendar showTodayButton onChange={onChange} />)

    const todayButton = screen.getByRole("button", { name: "Today" })
    expect(todayButton).toBeInTheDocument()

    fireEvent.click(todayButton)
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        getDate: expect.any(Function),
        getMonth: expect.any(Function),
        getFullYear: expect.any(Function),
      })
    )
  })

  it("shows Clear button when onClear is provided and date is selected", () => {
    const onClear = vi.fn()
    render(<Calendar defaultValue={new Date(2024, 11, 15)} onClear={onClear} />)

    const clearButton = screen.getByRole("button", { name: "Clear" })
    expect(clearButton).toBeInTheDocument()

    fireEvent.click(clearButton)
    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it("shows year selector when enabled", () => {
    render(<Calendar showYearSelector defaultValue={new Date(2024, 11, 15)} />)

    const yearButton = screen.getByRole("button", { name: /December 2024/ })
    expect(yearButton).toBeInTheDocument()

    fireEvent.click(yearButton)

    // Year picker should appear
    expect(screen.getByText("2024")).toBeInTheDocument()
    expect(screen.getByText("2023")).toBeInTheDocument()
    expect(screen.getByText("2025")).toBeInTheDocument()
  })

  it("respects minDate constraint", () => {
    const onChange = vi.fn()
    const minDate = new Date(2024, 11, 15)
    render(<Calendar defaultValue={new Date(2024, 11, 20)} minDate={minDate} onChange={onChange} />)

    // Try to click a date before minDate
    const disabledDate = screen.getByRole("gridcell", { name: /December 10, 2024/ })
    expect(disabledDate).toBeDisabled()

    fireEvent.click(disabledDate)
    expect(onChange).not.toHaveBeenCalled()
  })

  it("respects maxDate constraint", () => {
    const onChange = vi.fn()
    const maxDate = new Date(2024, 11, 15)
    render(<Calendar defaultValue={new Date(2024, 11, 10)} maxDate={maxDate} onChange={onChange} />)

    // Try to click a date after maxDate
    const disabledDate = screen.getByRole("gridcell", { name: /December 20, 2024/ })
    expect(disabledDate).toBeDisabled()

    fireEvent.click(disabledDate)
    expect(onChange).not.toHaveBeenCalled()
  })

  it("disables specific dates", () => {
    const onChange = vi.fn()
    const disabledDates = [new Date(2024, 11, 15), new Date(2024, 11, 20)]
    render(<Calendar defaultValue={new Date(2024, 11, 1)} disabledDates={disabledDates} onChange={onChange} />)

    const disabledDate = screen.getByRole("gridcell", { name: /December 15, 2024/ })
    expect(disabledDate).toBeDisabled()

    fireEvent.click(disabledDate)
    expect(onChange).not.toHaveBeenCalled()
  })

  it("supports week starting on Monday", () => {
    render(<Calendar weekStartsOn={1} />)

    const dayLabels = screen.getAllByRole("columnheader")
    expect(dayLabels[0]).toHaveTextContent("M") // Monday first
  })

  it("highlights today's date", () => {
    const today = new Date()
    render(<Calendar />)

    const todayCell = screen.getByRole("gridcell", {
      name: new RegExp(
        `${today.toLocaleString("default", { month: "long" })} ${today.getDate()}, ${today.getFullYear()}`
      ),
    })

    expect(todayCell).toHaveAttribute("aria-current", "date")
  })

  it("highlights selected date", () => {
    const selectedDate = new Date(2024, 11, 15)
    render(<Calendar value={selectedDate} />)

    const selectedCell = screen.getByRole("gridcell", { name: /December 15, 2024/ })
    expect(selectedCell).toHaveAttribute("aria-selected", "true")
  })

  it("applies custom className", () => {
    const { container } = render(<Calendar className="custom-class" />)
    expect(container.firstChild).toHaveClass("custom-class")
  })

  it("updates when value prop changes", () => {
    const { rerender } = render(<Calendar value={new Date(2024, 11, 15)} />)
    expect(screen.getByText("December 2024")).toBeInTheDocument()

    rerender(<Calendar value={new Date(2024, 0, 1)} />)
    expect(screen.getByText("January 2024")).toBeInTheDocument()
  })

  it("renders without optional buttons", () => {
    render(<Calendar showTodayButton={false} />)
    expect(screen.queryByRole("button", { name: "Today" })).not.toBeInTheDocument()
  })
})
