import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { Calendar } from "./Calendar"

describe("Calendar component", () => {
  const mockOnChange = vi.fn()
  const mockOnClear = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Rendering - Basic", () => {
    it("renders calendar with default props", () => {
      render(<Calendar />)
      expect(screen.getByRole("application", { name: "Calendar" })).toBeInTheDocument()
      expect(screen.getByRole("grid")).toBeInTheDocument()
    })

    it("renders all day headers", () => {
      render(<Calendar />)
      // Use getAllByText for duplicate letters (S appears twice, T appears twice)
      const allHeaders = screen
        .getAllByRole("generic")
        .filter((el) => el.className.includes("font-semibold") && el.className.includes("text-neutral-500"))
      expect(allHeaders.length).toBe(7)
    })

    it("renders current month and year", () => {
      const date = new Date(2024, 0, 15) // January 2024
      render(<Calendar defaultValue={date} />)
      expect(screen.getByText(/January 2024/)).toBeInTheDocument()
    })

    it("renders previous month button", () => {
      render(<Calendar />)
      expect(screen.getByLabelText("Previous month")).toBeInTheDocument()
    })

    it("renders next month button", () => {
      render(<Calendar />)
      expect(screen.getByLabelText("Next month")).toBeInTheDocument()
    })

    it("renders all days in current month", () => {
      const date = new Date(2024, 0, 1) // January 2024 has 31 days
      render(<Calendar defaultValue={date} />)
      // Check that we have 31 clickable buttons for January days
      const allButtons = screen
        .getAllByRole("gridcell")
        .filter(
          (cell) =>
            cell.tagName === "BUTTON" &&
            cell.getAttribute("aria-label")?.includes("January") &&
            cell.getAttribute("aria-label")?.includes("2024")
        )
      expect(allButtons.length).toBe(31)
    })

    it("renders days from previous and next months as disabled", () => {
      const date = new Date(2024, 0, 1) // January 2024
      render(<Calendar defaultValue={date} />)
      const gridcells = screen.getAllByRole("gridcell")
      const disabledCells = gridcells.filter((cell) => cell.getAttribute("aria-disabled") === "true")
      expect(disabledCells.length).toBeGreaterThan(0)
    })
  })

  describe("Variants", () => {
    it("renders default variant", () => {
      const { container } = render(<Calendar variant="default" />)
      const calendar = container.querySelector('[role="application"]')
      expect(calendar).toHaveClass("bg-white", "border", "border-neutral-200", "shadow-sm")
    })

    it("renders compact variant", () => {
      const { container } = render(<Calendar variant="compact" />)
      const calendar = container.querySelector('[role="application"]')
      expect(calendar).toHaveClass("bg-white", "border", "border-neutral-200", "p-3")
    })

    it("renders elevated variant", () => {
      const { container } = render(<Calendar variant="elevated" />)
      const calendar = container.querySelector('[role="application"]')
      expect(calendar).toHaveClass("bg-white", "shadow-lg")
    })

    it("renders minimal variant", () => {
      const { container } = render(<Calendar variant="minimal" />)
      const calendar = container.querySelector('[role="application"]')
      expect(calendar).toHaveClass("bg-transparent", "p-0")
    })
  })

  describe("Date Selection", () => {
    it("selects a date when clicked", async () => {
      const user = userEvent.setup()
      const date = new Date(2024, 0, 1)
      render(<Calendar defaultValue={date} onChange={mockOnChange} />)

      const day15 = screen.getByRole("button", { name: "Monday, January 15, 2024" })
      await user.click(day15)

      expect(mockOnChange).toHaveBeenCalledTimes(1)
      const selectedDate = mockOnChange.mock.calls[0][0]
      expect(selectedDate.getDate()).toBe(15)
      expect(selectedDate.getMonth()).toBe(0)
      expect(selectedDate.getFullYear()).toBe(2024)
    })

    it("highlights selected date", async () => {
      const user = userEvent.setup()
      const date = new Date(2024, 0, 1)
      render(<Calendar defaultValue={date} onChange={mockOnChange} />)

      const day15 = screen.getByRole("button", { name: "Monday, January 15, 2024" })
      await user.click(day15)

      expect(day15).toHaveAttribute("aria-selected", "true")
      expect(day15).toHaveClass("bg-[#0071e3]", "text-white")
    })

    it("shows initial selected date from value prop", () => {
      const date = new Date(2024, 0, 15)
      render(<Calendar value={date} />)

      const day15 = screen.getByRole("button", { name: "Monday, January 15, 2024" })
      expect(day15).toHaveAttribute("aria-selected", "true")
    })

    it("shows initial selected date from defaultValue prop", () => {
      const date = new Date(2024, 0, 15)
      render(<Calendar defaultValue={date} />)

      const day15 = screen.getByRole("button", { name: "Monday, January 15, 2024" })
      expect(day15).toHaveAttribute("aria-selected", "true")
    })

    it("updates when value prop changes", () => {
      const date1 = new Date(2024, 0, 10)
      const date2 = new Date(2024, 0, 20)
      const { rerender } = render(<Calendar value={date1} />)

      const day10 = screen.getByRole("button", { name: "Wednesday, January 10, 2024" })
      expect(day10).toHaveAttribute("aria-selected", "true")

      rerender(<Calendar value={date2} />)

      const day20 = screen.getByRole("button", { name: "Saturday, January 20, 2024" })
      expect(day20).toHaveAttribute("aria-selected", "true")
    })

    it("highlights today's date", () => {
      const today = new Date()
      render(<Calendar />)

      const todayButton = screen.getByRole("button", {
        name: new RegExp(`${today.getDate()}, ${today.getFullYear()}`),
      })
      expect(todayButton).toHaveAttribute("aria-current", "date")
      expect(todayButton).toHaveClass("ring-2", "ring-[#0071e3]")
    })
  })

  describe("Month Navigation", () => {
    it("navigates to previous month", async () => {
      const user = userEvent.setup()
      const date = new Date(2024, 1, 15) // February 2024
      render(<Calendar defaultValue={date} />)

      expect(screen.getByText(/February 2024/)).toBeInTheDocument()

      const prevButton = screen.getByLabelText("Previous month")
      await user.click(prevButton)

      expect(screen.getByText(/January 2024/)).toBeInTheDocument()
    })

    it("navigates to next month", async () => {
      const user = userEvent.setup()
      const date = new Date(2024, 0, 15) // January 2024
      render(<Calendar defaultValue={date} />)

      expect(screen.getByText(/January 2024/)).toBeInTheDocument()

      const nextButton = screen.getByLabelText("Next month")
      await user.click(nextButton)

      expect(screen.getByText(/February 2024/)).toBeInTheDocument()
    })

    it("navigates across year boundaries", async () => {
      const user = userEvent.setup()
      const date = new Date(2023, 11, 15) // December 2023
      render(<Calendar defaultValue={date} />)

      expect(screen.getByText(/December 2023/)).toBeInTheDocument()

      const nextButton = screen.getByLabelText("Next month")
      await user.click(nextButton)

      expect(screen.getByText(/January 2024/)).toBeInTheDocument()
    })

    it("navigates backwards across year boundaries", async () => {
      const user = userEvent.setup()
      const date = new Date(2024, 0, 15) // January 2024
      render(<Calendar defaultValue={date} />)

      expect(screen.getByText(/January 2024/)).toBeInTheDocument()

      const prevButton = screen.getByLabelText("Previous month")
      await user.click(prevButton)

      expect(screen.getByText(/December 2023/)).toBeInTheDocument()
    })
  })

  describe("Year Selector", () => {
    it("shows year selector when showYearSelector is true", () => {
      const date = new Date(2024, 0, 1)
      render(<Calendar defaultValue={date} showYearSelector={true} />)

      const yearButton = screen.getByRole("button", { name: /January 2024, click to select year/ })
      expect(yearButton).toBeInTheDocument()
    })

    it("hides year selector when showYearSelector is false", () => {
      const date = new Date(2024, 0, 1)
      render(<Calendar defaultValue={date} showYearSelector={false} />)

      const yearButton = screen.queryByRole("button", { name: /January 2024, click to select year/ })
      expect(yearButton).not.toBeInTheDocument()
      expect(screen.getByText("January 2024")).toBeInTheDocument()
    })

    it("opens year picker when year button is clicked", async () => {
      const user = userEvent.setup()
      const date = new Date(2024, 0, 1)
      render(<Calendar defaultValue={date} showYearSelector={true} />)

      const yearButton = screen.getByRole("button", { name: /January 2024, click to select year/ })
      await user.click(yearButton)

      // Year picker should show years around current year
      expect(screen.getByRole("button", { name: "2024" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "2023" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "2025" })).toBeInTheDocument()
    })

    it("closes year picker when year button is clicked again", async () => {
      const user = userEvent.setup()
      const date = new Date(2024, 0, 1)
      render(<Calendar defaultValue={date} showYearSelector={true} />)

      const yearButton = screen.getByRole("button", { name: /January 2024, click to select year/ })
      await user.click(yearButton)

      expect(screen.getByRole("button", { name: "2024" })).toBeInTheDocument()

      await user.click(yearButton)

      await waitFor(() => {
        expect(screen.queryByRole("button", { name: "2023" })).not.toBeInTheDocument()
      })
    })

    it("changes year when a year is selected from picker", async () => {
      const user = userEvent.setup()
      const date = new Date(2024, 0, 1)
      render(<Calendar defaultValue={date} showYearSelector={true} />)

      const yearButton = screen.getByRole("button", { name: /January 2024, click to select year/ })
      await user.click(yearButton)

      const year2023Button = screen.getByRole("button", { name: "2023" })
      await user.click(year2023Button)

      expect(screen.getByText(/January 2023/)).toBeInTheDocument()
    })

    it("highlights current year in year picker", async () => {
      const user = userEvent.setup()
      const date = new Date(2024, 0, 1)
      render(<Calendar defaultValue={date} showYearSelector={true} />)

      const yearButton = screen.getByRole("button", { name: /January 2024, click to select year/ })
      await user.click(yearButton)

      const year2024Button = screen.getByRole("button", { name: "2024" })
      expect(year2024Button).toHaveClass("bg-[#0071e3]", "text-white")
    })
  })

  describe("Today Button", () => {
    it("shows today button when showTodayButton is true", () => {
      render(<Calendar showTodayButton={true} />)
      expect(screen.getByRole("button", { name: "Today" })).toBeInTheDocument()
    })

    it("hides today button when showTodayButton is false", () => {
      render(<Calendar showTodayButton={false} />)
      expect(screen.queryByRole("button", { name: "Today" })).not.toBeInTheDocument()
    })

    it("selects today's date when today button is clicked", async () => {
      const user = userEvent.setup()
      const today = new Date()
      const pastDate = new Date(2020, 0, 1)
      render(<Calendar defaultValue={pastDate} onChange={mockOnChange} showTodayButton={true} />)

      const todayButton = screen.getByRole("button", { name: "Today" })
      await user.click(todayButton)

      expect(mockOnChange).toHaveBeenCalledTimes(1)
      const selectedDate = mockOnChange.mock.calls[0][0]
      expect(selectedDate.getDate()).toBe(today.getDate())
      expect(selectedDate.getMonth()).toBe(today.getMonth())
      expect(selectedDate.getFullYear()).toBe(today.getFullYear())
    })

    it("navigates to current month when today button is clicked", async () => {
      const user = userEvent.setup()
      const today = new Date()
      const pastDate = new Date(2020, 0, 1)
      render(<Calendar defaultValue={pastDate} showTodayButton={true} />)

      expect(screen.getByText(/January 2020/)).toBeInTheDocument()

      const todayButton = screen.getByRole("button", { name: "Today" })
      await user.click(todayButton)

      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ]
      const currentMonth = monthNames[today.getMonth()]
      expect(screen.getByText(new RegExp(`${currentMonth} ${today.getFullYear()}`))).toBeInTheDocument()
    })
  })

  describe("Clear Button", () => {
    it("shows clear button when onClear is provided and date is selected", () => {
      const date = new Date(2024, 0, 15)
      render(<Calendar defaultValue={date} onClear={mockOnClear} />)
      expect(screen.getByRole("button", { name: "Clear" })).toBeInTheDocument()
    })

    it("hides clear button when onClear is not provided", () => {
      const date = new Date(2024, 0, 15)
      render(<Calendar defaultValue={date} />)
      expect(screen.queryByRole("button", { name: "Clear" })).not.toBeInTheDocument()
    })

    it("hides clear button when no date is selected", () => {
      render(<Calendar onClear={mockOnClear} />)
      // Clear button should not be shown without a selected date
      expect(screen.queryByRole("button", { name: "Clear" })).not.toBeInTheDocument()
    })

    it("calls onClear when clear button is clicked", async () => {
      const user = userEvent.setup()
      const date = new Date(2024, 0, 15)
      render(<Calendar defaultValue={date} onClear={mockOnClear} />)

      const clearButton = screen.getByRole("button", { name: "Clear" })
      await user.click(clearButton)

      expect(mockOnClear).toHaveBeenCalledTimes(1)
    })

    it("removes selection when clear button is clicked", async () => {
      const user = userEvent.setup()
      const date = new Date(2024, 0, 15)
      render(<Calendar defaultValue={date} onClear={mockOnClear} />)

      const day15 = screen.getByRole("button", { name: "Monday, January 15, 2024" })
      expect(day15).toHaveAttribute("aria-selected", "true")

      const clearButton = screen.getByRole("button", { name: "Clear" })
      await user.click(clearButton)

      expect(day15).toHaveAttribute("aria-selected", "false")
    })
  })

  describe("Disabled Dates", () => {
    it("disables dates before minDate", () => {
      const minDate = new Date(2024, 0, 15)
      render(<Calendar defaultValue={new Date(2024, 0, 1)} minDate={minDate} />)

      const day10 = screen.getByRole("button", { name: "Wednesday, January 10, 2024" })
      expect(day10).toBeDisabled()
      expect(day10).toHaveClass("cursor-not-allowed", "text-neutral-300")
    })

    it("disables dates after maxDate", () => {
      const maxDate = new Date(2024, 0, 15)
      render(<Calendar defaultValue={new Date(2024, 0, 1)} maxDate={maxDate} />)

      const day20 = screen.getByRole("button", { name: "Saturday, January 20, 2024" })
      expect(day20).toBeDisabled()
    })

    it("allows dates within minDate and maxDate range", () => {
      const minDate = new Date(2024, 0, 10)
      const maxDate = new Date(2024, 0, 20)
      render(<Calendar defaultValue={new Date(2024, 0, 1)} minDate={minDate} maxDate={maxDate} />)

      const day15 = screen.getByRole("button", { name: "Monday, January 15, 2024" })
      expect(day15).not.toBeDisabled()
    })

    it("disables specific dates from disabledDates array", () => {
      const disabledDates = [new Date(2024, 0, 15), new Date(2024, 0, 20)]
      render(<Calendar defaultValue={new Date(2024, 0, 1)} disabledDates={disabledDates} />)

      const day15 = screen.getByRole("button", { name: "Monday, January 15, 2024" })
      const day20 = screen.getByRole("button", { name: "Saturday, January 20, 2024" })
      expect(day15).toBeDisabled()
      expect(day20).toBeDisabled()
    })

    it("does not call onChange when disabled date is clicked", async () => {
      const user = userEvent.setup()
      const minDate = new Date(2024, 0, 15)
      render(<Calendar defaultValue={new Date(2024, 0, 1)} minDate={minDate} onChange={mockOnChange} />)

      const day10 = screen.getByRole("button", { name: "Wednesday, January 10, 2024" })
      await user.click(day10)

      expect(mockOnChange).not.toHaveBeenCalled()
    })
  })

  describe("Week Start Day", () => {
    it("starts week on Sunday by default (weekStartsOn=0)", () => {
      render(<Calendar weekStartsOn={0} />)
      const dayHeaders = screen.getAllByText(/^[SMTWF]$/)
      expect(dayHeaders[0]).toHaveTextContent("S") // Sunday
    })

    it("starts week on Monday when weekStartsOn=1", () => {
      render(<Calendar weekStartsOn={1} />)
      const dayHeaders = screen.getAllByText(/^[SMTWF]$/)
      expect(dayHeaders[0]).toHaveTextContent("M") // Monday
    })
  })

  describe("Keyboard Navigation", () => {
    it("navigates to previous day with ArrowLeft", async () => {
      const date = new Date(2024, 0, 15)
      render(<Calendar defaultValue={date} onChange={mockOnChange} />)

      const day15 = screen.getByRole("button", { name: "Monday, January 15, 2024" })
      day15.focus()

      await userEvent.keyboard("{ArrowLeft}")

      expect(mockOnChange).toHaveBeenCalledTimes(1)
      const selectedDate = mockOnChange.mock.calls[0][0]
      expect(selectedDate.getDate()).toBe(14)
    })

    it("navigates to next day with ArrowRight", async () => {
      const date = new Date(2024, 0, 15)
      render(<Calendar defaultValue={date} onChange={mockOnChange} />)

      const day15 = screen.getByRole("button", { name: "Monday, January 15, 2024" })
      day15.focus()

      await userEvent.keyboard("{ArrowRight}")

      expect(mockOnChange).toHaveBeenCalledTimes(1)
      const selectedDate = mockOnChange.mock.calls[0][0]
      expect(selectedDate.getDate()).toBe(16)
    })

    it("navigates to previous week with ArrowUp", async () => {
      const date = new Date(2024, 0, 15)
      render(<Calendar defaultValue={date} onChange={mockOnChange} />)

      const day15 = screen.getByRole("button", { name: "Monday, January 15, 2024" })
      day15.focus()

      await userEvent.keyboard("{ArrowUp}")

      expect(mockOnChange).toHaveBeenCalledTimes(1)
      const selectedDate = mockOnChange.mock.calls[0][0]
      expect(selectedDate.getDate()).toBe(8)
    })

    it("navigates to next week with ArrowDown", async () => {
      const date = new Date(2024, 0, 15)
      render(<Calendar defaultValue={date} onChange={mockOnChange} />)

      const day15 = screen.getByRole("button", { name: "Monday, January 15, 2024" })
      day15.focus()

      await userEvent.keyboard("{ArrowDown}")

      expect(mockOnChange).toHaveBeenCalledTimes(1)
      const selectedDate = mockOnChange.mock.calls[0][0]
      expect(selectedDate.getDate()).toBe(22)
    })

    it("navigates to first day of month with Home", async () => {
      const date = new Date(2024, 0, 15)
      render(<Calendar defaultValue={date} onChange={mockOnChange} />)

      const day15 = screen.getByRole("button", { name: "Monday, January 15, 2024" })
      day15.focus()

      await userEvent.keyboard("{Home}")

      expect(mockOnChange).toHaveBeenCalledTimes(1)
      const selectedDate = mockOnChange.mock.calls[0][0]
      expect(selectedDate.getDate()).toBe(1)
    })

    it("navigates to last day of month with End", async () => {
      const date = new Date(2024, 0, 15)
      render(<Calendar defaultValue={date} onChange={mockOnChange} />)

      const day15 = screen.getByRole("button", { name: "Monday, January 15, 2024" })
      day15.focus()

      await userEvent.keyboard("{End}")

      expect(mockOnChange).toHaveBeenCalledTimes(1)
      const selectedDate = mockOnChange.mock.calls[0][0]
      expect(selectedDate.getDate()).toBe(31)
    })

    it("does not navigate beyond month boundaries with ArrowLeft", async () => {
      const date = new Date(2024, 0, 1)
      render(<Calendar defaultValue={date} onChange={mockOnChange} />)

      const day1 = screen.getByRole("button", { name: "Monday, January 1, 2024" })
      day1.focus()

      await userEvent.keyboard("{ArrowLeft}")

      // Should not navigate to previous month
      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it("does not navigate beyond month boundaries with ArrowRight", async () => {
      const date = new Date(2024, 0, 31)
      render(<Calendar defaultValue={date} onChange={mockOnChange} />)

      const day31 = screen.getByRole("button", { name: "Wednesday, January 31, 2024" })
      day31.focus()

      await userEvent.keyboard("{ArrowRight}")

      // Should not navigate to next month
      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it("does not navigate beyond month boundaries with ArrowUp", async () => {
      const date = new Date(2024, 0, 3)
      render(<Calendar defaultValue={date} onChange={mockOnChange} />)

      const day3 = screen.getByRole("button", { name: "Wednesday, January 3, 2024" })
      day3.focus()

      await userEvent.keyboard("{ArrowUp}")

      // Should not navigate to previous month (3 - 7 = -4)
      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it("does not navigate beyond month boundaries with ArrowDown", async () => {
      const date = new Date(2024, 0, 29)
      render(<Calendar defaultValue={date} onChange={mockOnChange} />)

      const day29 = screen.getByRole("button", { name: "Monday, January 29, 2024" })
      day29.focus()

      await userEvent.keyboard("{ArrowDown}")

      // Should not navigate to next month (29 + 7 = 36 > 31)
      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it("does not trigger keyboard navigation when calendar is not focused", async () => {
      const date = new Date(2024, 0, 15)
      render(
        <div>
          <Calendar defaultValue={date} onChange={mockOnChange} />
          <button>Outside Button</button>
        </div>
      )

      const outsideButton = screen.getByRole("button", { name: "Outside Button" })
      outsideButton.focus()

      await userEvent.keyboard("{ArrowRight}")

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it("does not trigger keyboard navigation when no date is selected", async () => {
      render(<Calendar onChange={mockOnChange} />)

      await userEvent.keyboard("{ArrowRight}")

      expect(mockOnChange).not.toHaveBeenCalled()
    })
  })

  describe("Custom className", () => {
    it("applies custom className", () => {
      const { container } = render(<Calendar className="custom-calendar-class" />)
      const calendar = container.querySelector('[role="application"]')
      expect(calendar).toHaveClass("custom-calendar-class")
    })

    it("merges custom className with default classes", () => {
      const { container } = render(<Calendar className="custom-class" variant="default" />)
      const calendar = container.querySelector('[role="application"]')
      expect(calendar).toHaveClass("custom-class", "bg-white", "border")
    })
  })

  describe("Accessibility", () => {
    it("has proper ARIA role for calendar", () => {
      render(<Calendar />)
      expect(screen.getByRole("application", { name: "Calendar" })).toBeInTheDocument()
    })

    it("has proper ARIA role for grid", () => {
      render(<Calendar />)
      expect(screen.getByRole("grid")).toBeInTheDocument()
    })

    it("has proper ARIA labels for month navigation buttons", () => {
      render(<Calendar />)
      expect(screen.getByLabelText("Previous month")).toBeInTheDocument()
      expect(screen.getByLabelText("Next month")).toBeInTheDocument()
    })

    it("has proper ARIA labels for date buttons", () => {
      const date = new Date(2024, 0, 15)
      render(<Calendar defaultValue={date} />)
      expect(screen.getByRole("button", { name: /Monday, January 15, 2024/ })).toBeInTheDocument()
    })

    it("sets aria-selected on selected date", () => {
      const date = new Date(2024, 0, 15)
      render(<Calendar defaultValue={date} />)
      const day15 = screen.getByRole("button", { name: "Monday, January 15, 2024" })
      expect(day15).toHaveAttribute("aria-selected", "true")
    })

    it("sets aria-current=date on today", () => {
      const today = new Date()
      render(<Calendar />)
      const todayButton = screen.getByRole("button", {
        name: new RegExp(`${today.getDate()}, ${today.getFullYear()}`),
      })
      expect(todayButton).toHaveAttribute("aria-current", "date")
    })

    it("sets aria-disabled on disabled gridcells", () => {
      render(<Calendar />)
      const gridcells = screen.getAllByRole("gridcell")
      const disabledCells = gridcells.filter((cell) => cell.getAttribute("aria-disabled") === "true")
      expect(disabledCells.length).toBeGreaterThan(0)
    })

    it("buttons have proper disabled attribute", () => {
      const minDate = new Date(2024, 0, 15)
      render(<Calendar defaultValue={new Date(2024, 0, 1)} minDate={minDate} />)
      const day10 = screen.getByRole("button", { name: "Wednesday, January 10, 2024" })
      expect(day10).toBeDisabled()
    })
  })

  describe("Edge Cases", () => {
    it("handles leap year correctly", () => {
      const date = new Date(2024, 1, 1) // February 2024 (leap year)
      render(<Calendar defaultValue={date} />)
      // February 2024 has 29 days
      expect(screen.getByRole("button", { name: "Thursday, February 29, 2024" })).toBeInTheDocument()
    })

    it("handles non-leap year correctly", () => {
      const date = new Date(2023, 1, 1) // February 2023 (non-leap year)
      render(<Calendar defaultValue={date} />)
      // February 2023 has 28 days, so 29 should not exist
      expect(screen.queryByRole("button", { name: /February 29, 2023/ })).not.toBeInTheDocument()
      expect(screen.getByRole("button", { name: /February 28, 2023/ })).toBeInTheDocument()
    })

    it("handles months with 30 days", () => {
      const date = new Date(2024, 3, 1) // April 2024
      render(<Calendar defaultValue={date} />)
      expect(screen.getByRole("button", { name: "Tuesday, April 30, 2024" })).toBeInTheDocument()
      expect(screen.queryByRole("button", { name: "April 31, 2024" })).not.toBeInTheDocument()
    })

    it("handles months with 31 days", () => {
      const date = new Date(2024, 0, 1) // January 2024
      render(<Calendar defaultValue={date} />)
      expect(screen.getByRole("button", { name: "Wednesday, January 31, 2024" })).toBeInTheDocument()
    })

    it("handles selecting same date twice", async () => {
      const user = userEvent.setup()
      const date = new Date(2024, 0, 15)
      render(<Calendar defaultValue={date} onChange={mockOnChange} />)

      const day15 = screen.getByRole("button", { name: "Monday, January 15, 2024" })
      await user.click(day15)
      await user.click(day15)

      expect(mockOnChange).toHaveBeenCalledTimes(2)
    })

    it("handles rapid month navigation", async () => {
      const user = userEvent.setup()
      const date = new Date(2024, 0, 1)
      render(<Calendar defaultValue={date} />)

      const nextButton = screen.getByLabelText("Next month")

      await user.click(nextButton)
      await user.click(nextButton)
      await user.click(nextButton)

      expect(screen.getByText(/April 2024/)).toBeInTheDocument()
    })

    it("handles controlled value prop updates", () => {
      const date1 = new Date(2024, 0, 10)
      const date2 = new Date(2024, 5, 20) // Different month
      const { rerender } = render(<Calendar value={date1} />)

      expect(screen.getByText(/January 2024/)).toBeInTheDocument()

      rerender(<Calendar value={date2} />)

      expect(screen.getByText(/June 2024/)).toBeInTheDocument()
      const day20 = screen.getByRole("button", { name: "Thursday, June 20, 2024" })
      expect(day20).toHaveAttribute("aria-selected", "true")
    })

    it("handles undefined value gracefully", () => {
      render(<Calendar value={undefined} />)
      expect(screen.getByRole("application")).toBeInTheDocument()
    })

    it("handles date selection at month boundaries", async () => {
      const user = userEvent.setup()
      const date = new Date(2024, 0, 1)
      render(<Calendar defaultValue={date} onChange={mockOnChange} />)

      const day31 = screen.getByRole("button", { name: "Wednesday, January 31, 2024" })
      await user.click(day31)

      expect(mockOnChange).toHaveBeenCalledTimes(1)
      const selectedDate = mockOnChange.mock.calls[0][0]
      expect(selectedDate.getDate()).toBe(31)
    })

    it("cleans up keyboard event listeners on unmount", () => {
      const { unmount } = render(<Calendar defaultValue={new Date(2024, 0, 15)} />)
      const removeEventListenerSpy = vi.spyOn(document, "removeEventListener")

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith("keydown", expect.any(Function))
    })
  })

  describe("Integration Scenarios", () => {
    it("works as controlled component", async () => {
      const user = userEvent.setup()
      const ControlledCalendar = () => {
        const [value, setValue] = React.useState(new Date(2024, 0, 15))
        return <Calendar value={value} onChange={setValue} />
      }

      render(<ControlledCalendar />)

      const day20 = screen.getByRole("button", { name: "Saturday, January 20, 2024" })
      await user.click(day20)

      expect(day20).toHaveAttribute("aria-selected", "true")
    })

    it("works as uncontrolled component", async () => {
      const user = userEvent.setup()
      render(<Calendar defaultValue={new Date(2024, 0, 15)} onChange={mockOnChange} />)

      const day20 = screen.getByRole("button", { name: "Saturday, January 20, 2024" })
      await user.click(day20)

      expect(mockOnChange).toHaveBeenCalledTimes(1)
      expect(day20).toHaveAttribute("aria-selected", "true")
    })

    it("combines multiple features together", async () => {
      const user = userEvent.setup()
      const minDate = new Date(2024, 0, 10)
      const maxDate = new Date(2024, 0, 25)
      const disabledDates = [new Date(2024, 0, 15)]

      render(
        <Calendar
          defaultValue={new Date(2024, 0, 20)}
          onChange={mockOnChange}
          onClear={mockOnClear}
          minDate={minDate}
          maxDate={maxDate}
          disabledDates={disabledDates}
          showYearSelector={true}
          showTodayButton={true}
          variant="elevated"
        />
      )

      // Check disabled dates
      const day5 = screen.getByRole("button", { name: "Friday, January 5, 2024" })
      const day15 = screen.getByRole("button", { name: "Monday, January 15, 2024" })
      const day30 = screen.getByRole("button", { name: "Tuesday, January 30, 2024" })

      expect(day5).toBeDisabled()
      expect(day15).toBeDisabled()
      expect(day30).toBeDisabled()

      // Select valid date
      const day18 = screen.getByRole("button", { name: "Thursday, January 18, 2024" })
      await user.click(day18)
      expect(mockOnChange).toHaveBeenCalled()

      // Clear selection
      const clearButton = screen.getByRole("button", { name: "Clear" })
      await user.click(clearButton)
      expect(mockOnClear).toHaveBeenCalled()
    })
  })
})
