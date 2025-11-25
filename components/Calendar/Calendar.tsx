"use client"

import React, { useState } from "react"
import { cn } from "utils/cn"

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
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
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
}

export function Calendar({ value, defaultValue, onChange, onClear, className }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    const initial = value || defaultValue || new Date()
    return new Date(initial.getFullYear(), initial.getMonth(), 1)
  })
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value || defaultValue)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfMonth = getFirstDayOfMonth(year, month)
  const prevMonthDays = getDaysInMonth(year, month - 1)

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const handleDateClick = (day: number) => {
    const newDate = new Date(year, month, day)
    setSelectedDate(newDate)
    onChange?.(newDate)
  }

  const handleClear = () => {
    setSelectedDate(undefined)
    onClear?.()
  }

  const isSelected = (day: number) => {
    if (!selectedDate) return false
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    )
  }

  const isToday = (day: number) => {
    const today = new Date()
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
  }

  const prevMonthDaysArray = Array.from(
    { length: firstDayOfMonth },
    (_, i) => prevMonthDays - firstDayOfMonth + i + 1
  )
  const currentMonthDaysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const totalCells = prevMonthDaysArray.length + currentMonthDaysArray.length
  const nextMonthDays = totalCells > 35 ? 42 - totalCells : 35 - totalCells
  const nextMonthDaysArray = Array.from({ length: nextMonthDays }, (_, i) => i + 1)

  return (
    <div className={cn("w-64 rounded-lg border border-neutral-200 bg-white p-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-1 rounded hover:bg-neutral-100 transition-colors"
          aria-label="Previous month"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span className="font-medium text-neutral-900">
          {MONTHS[month]} {year}
        </span>
        <button
          type="button"
          onClick={handleNextMonth}
          className="p-1 rounded hover:bg-neutral-100 transition-colors"
          aria-label="Next month"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Days header */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-neutral-500 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Previous month days */}
        {prevMonthDaysArray.map((day) => (
          <div
            key={`prev-${day}`}
            className="h-8 w-8 flex items-center justify-center text-sm text-neutral-300"
          >
            {day}
          </div>
        ))}

        {/* Current month days */}
        {currentMonthDaysArray.map((day) => (
          <button
            key={`current-${day}`}
            type="button"
            onClick={() => handleDateClick(day)}
            className={cn(
              "h-8 w-8 flex items-center justify-center text-sm rounded-md transition-colors",
              isSelected(day)
                ? "bg-primary text-primary-foreground"
                : isToday(day)
                ? "border border-primary text-primary"
                : "text-neutral-900 hover:bg-neutral-100"
            )}
          >
            {day}
          </button>
        ))}

        {/* Next month days */}
        {nextMonthDaysArray.map((day) => (
          <div
            key={`next-${day}`}
            className="h-8 w-8 flex items-center justify-center text-sm text-neutral-300"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Clear button */}
      <button
        type="button"
        onClick={handleClear}
        className="w-full mt-4 text-center text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
      >
        Clear
      </button>
    </div>
  )
}
