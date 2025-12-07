"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "utils/cn"
import { Button } from "../Button"
import { IconButton } from "../IconButton"

const DAYS = ["S", "M", "T", "W", "T", "F", "S"] // Short day names like iOS
const FULL_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const MONTHS = [
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

export interface CalendarProps {
  value?: Date
  defaultValue?: Date
  onChange?: (date: Date) => void
  onClear?: () => void
  className?: string
  variant?: "default" | "compact" | "elevated" | "minimal"
  showYearSelector?: boolean
  showTodayButton?: boolean
  minDate?: Date
  maxDate?: Date
  disabledDates?: Date[]
  weekStartsOn?: 0 | 1 // 0 = Sunday, 1 = Monday
}

// Utility functions
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number, weekStartsOn: 0 | 1 = 0): number {
  const day = new Date(year, month, 1).getDay()
  if (weekStartsOn === 1) {
    return day === 0 ? 6 : day - 1
  }
  return day
}

function isSameDay(date1: Date | undefined, date2: Date): boolean {
  if (!date1) return false
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  )
}

function isDateDisabled(
  date: Date,
  minDate?: Date,
  maxDate?: Date,
  disabledDates?: Date[]
): boolean {
  if (minDate && date < minDate) return true
  if (maxDate && date > maxDate) return true
  if (disabledDates?.some((d) => isSameDay(d, date))) return true
  return false
}

export function Calendar({
  value,
  defaultValue,
  onChange,
  onClear,
  className,
  variant = "default",
  showYearSelector = true,
  showTodayButton = true,
  minDate,
  maxDate,
  disabledDates,
  weekStartsOn = 0,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    const initial = value || defaultValue || new Date()
    return new Date(initial.getFullYear(), initial.getMonth(), 1)
  })
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value || defaultValue)
  const [showYearPicker, setShowYearPicker] = useState(false)
  const calendarRef = useRef<HTMLDivElement>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfMonth = getFirstDayOfMonth(year, month, weekStartsOn)
  const prevMonthDays = getDaysInMonth(year, month - 1)

  // Update selected date when value prop changes
  useEffect(() => {
    if (value !== undefined) {
      setSelectedDate(value)
      setCurrentDate(new Date(value.getFullYear(), value.getMonth(), 1))
    }
  }, [value])

  const handlePrevMonth = useCallback(() => {
    setCurrentDate(new Date(year, month - 1, 1))
  }, [year, month])

  const handleNextMonth = useCallback(() => {
    setCurrentDate(new Date(year, month + 1, 1))
  }, [year, month])

  const handleDateClick = useCallback(
    (day: number) => {
      const newDate = new Date(year, month, day)
      if (isDateDisabled(newDate, minDate, maxDate, disabledDates)) return

      setSelectedDate(newDate)
      onChange?.(newDate)
    },
    [year, month, onChange, minDate, maxDate, disabledDates]
  )

  const handleClear = useCallback(() => {
    setSelectedDate(undefined)
    onClear?.()
  }, [onClear])

  const handleToday = useCallback(() => {
    const today = new Date()
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelectedDate(today)
    onChange?.(today)
  }, [onChange])

  const handleYearChange = useCallback((newYear: number) => {
    setCurrentDate(new Date(newYear, month, 1))
    setShowYearPicker(false)
  }, [month])

  const isSelected = useCallback(
    (day: number) => {
      if (!selectedDate) return false
      const date = new Date(year, month, day)
      return isSameDay(selectedDate, date)
    },
    [selectedDate, year, month]
  )

  const isToday = useCallback(
    (day: number) => {
      const today = new Date()
      const date = new Date(year, month, day)
      return isSameDay(today, date)
    },
    [year, month]
  )

  const isDisabled = useCallback(
    (day: number) => {
      const date = new Date(year, month, day)
      return isDateDisabled(date, minDate, maxDate, disabledDates)
    },
    [year, month, minDate, maxDate, disabledDates]
  )

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedDate || !calendarRef.current?.contains(document.activeElement)) return

      const currentDay = selectedDate.getDate()
      let newDay = currentDay

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault()
          newDay = currentDay - 1
          break
        case "ArrowRight":
          e.preventDefault()
          newDay = currentDay + 1
          break
        case "ArrowUp":
          e.preventDefault()
          newDay = currentDay - 7
          break
        case "ArrowDown":
          e.preventDefault()
          newDay = currentDay + 7
          break
        case "Home":
          e.preventDefault()
          newDay = 1
          break
        case "End":
          e.preventDefault()
          newDay = daysInMonth
          break
        default:
          return
      }

      if (newDay >= 1 && newDay <= daysInMonth) {
        handleDateClick(newDay)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [selectedDate, daysInMonth, handleDateClick])

  // Generate calendar grid
  const prevMonthDaysArray = Array.from(
    { length: firstDayOfMonth },
    (_, i) => prevMonthDays - firstDayOfMonth + i + 1
  )
  const currentMonthDaysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const totalCells = prevMonthDaysArray.length + currentMonthDaysArray.length
  const nextMonthDays = totalCells > 35 ? 42 - totalCells : 35 - totalCells
  const nextMonthDaysArray = Array.from({ length: nextMonthDays }, (_, i) => i + 1)

  // Adjust day labels based on week start
  const dayLabels = weekStartsOn === 1 ? ["M", "T", "W", "T", "F", "S", "S"] : DAYS

  // Variant styles
  const variantStyles = {
    default: "bg-white border border-neutral-200 shadow-sm",
    compact: "bg-white border border-neutral-200",
    elevated: "bg-white shadow-lg ring-1 ring-black/5",
    minimal: "bg-transparent",
  }

  const containerPadding = {
    default: "p-5",
    compact: "p-3",
    elevated: "p-6",
    minimal: "p-0",
  }

  // Year picker
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i)

  return (
    <div
      ref={calendarRef}
      className={cn(
        "inline-flex flex-col rounded-2xl transition-all duration-300",
        variantStyles[variant],
        containerPadding[variant],
        "w-[320px]",
        className
      )}
      role="application"
      aria-label="Calendar"
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <IconButton
          variant="plain"
          intent="secondary"
          size="sm"
          onClick={handlePrevMonth}
          aria-label="Previous month"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </IconButton>

        <div className="flex items-center gap-2">
          {showYearSelector ? (
            <button
              type="button"
              onClick={() => setShowYearPicker(!showYearPicker)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-[17px] font-semibold transition-colors",
                "text-neutral-900 hover:bg-neutral-100 active:bg-neutral-200",
                "focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:ring-offset-2"
              )}
              aria-label={`${MONTHS[month]} ${year}, click to select year`}
            >
              {MONTHS[month]} {year}
            </button>
          ) : (
            <span className="text-[17px] font-semibold text-neutral-900">
              {MONTHS[month]} {year}
            </span>
          )}
        </div>

        <IconButton
          variant="plain"
          intent="secondary"
          size="sm"
          onClick={handleNextMonth}
          aria-label="Next month"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </IconButton>
      </div>

      {/* Year Picker */}
      {showYearPicker && (
        <div className="mb-4 grid max-h-[200px] grid-cols-3 gap-1 overflow-y-auto rounded-xl bg-neutral-50 p-2">
          {years.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => handleYearChange(y)}
              className={cn(
                "rounded-lg px-3 py-2 text-[15px] font-medium transition-all",
                y === year
                  ? "bg-[#0071e3] text-white shadow-sm"
                  : "text-neutral-700 hover:bg-neutral-200 active:bg-neutral-300"
              )}
            >
              {y}
            </button>
          ))}
        </div>
      )}

      {/* Days header */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {dayLabels.map((day, index) => (
          <div
            key={`${day}-${index}`}
            className="flex h-10 items-center justify-center text-[13px] font-semibold text-neutral-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1" role="grid">
        {/* Previous month days */}
        {prevMonthDaysArray.map((day) => (
          <div
            key={`prev-${day}`}
            className="flex h-10 w-10 items-center justify-center text-[15px] text-neutral-300"
            role="gridcell"
            aria-disabled="true"
          >
            {day}
          </div>
        ))}

        {/* Current month days */}
        {currentMonthDaysArray.map((day) => {
          const selected = isSelected(day)
          const today = isToday(day)
          const disabled = isDisabled(day)
          const date = new Date(year, month, day)
          const dayName = FULL_DAYS[date.getDay()]

          return (
            <button
              key={`current-${day}`}
              type="button"
              onClick={() => handleDateClick(day)}
              disabled={disabled}
              role="gridcell"
              aria-label={`${dayName}, ${MONTHS[month]} ${day}, ${year}`}
              aria-selected={selected}
              aria-current={today ? "date" : undefined}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full text-[15px] font-medium transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:ring-offset-2",
                selected && !disabled && "bg-[#0071e3] text-white shadow-md hover:bg-[#0077ed] active:bg-[#005bb5] scale-105",
                today && !selected && !disabled && "bg-[#0071e3]/10 text-[#0071e3] font-semibold ring-2 ring-[#0071e3]",
                !selected && !today && !disabled && "text-neutral-900 hover:bg-neutral-100 active:bg-neutral-200",
                disabled && "cursor-not-allowed text-neutral-300 hover:bg-transparent active:bg-transparent"
              )}
            >
              {day}
            </button>
          )
        })}

        {/* Next month days */}
        {nextMonthDaysArray.map((day) => (
          <div
            key={`next-${day}`}
            className="flex h-10 w-10 items-center justify-center text-[15px] text-neutral-300"
            role="gridcell"
            aria-disabled="true"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Footer actions */}
      {(showTodayButton || onClear) && (
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-neutral-100 pt-4">
          {showTodayButton && (
            <Button
              variant="plain"
              intent="primary"
              size="sm"
              onClick={handleToday}
              className="text-[15px]"
            >
              Today
            </Button>
          )}
          {onClear && selectedDate && (
            <Button
              variant="plain"
              intent="secondary"
              size="sm"
              onClick={handleClear}
              className="text-[15px]"
            >
              Clear
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
