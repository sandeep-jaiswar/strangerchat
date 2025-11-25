"use client"

import * as Popover from "@radix-ui/react-popover"
import React, { useState } from "react"
import { cn } from "utils/cn"
import { Calendar } from "../Calendar"

export interface DatePickerProps {
  value?: Date
  defaultValue?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  }
  return date.toLocaleDateString("en-US", options)
}

export function DatePicker({
  value,
  defaultValue,
  onChange,
  placeholder = "Pick a date",
  disabled,
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value || defaultValue)

  const handleDateChange = (date: Date) => {
    setSelectedDate(date)
    onChange?.(date)
    setOpen(false)
  }

  const handleClear = () => {
    setSelectedDate(undefined)
    onChange?.(undefined)
    setOpen(false)
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild disabled={disabled}>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-2",
            "text-sm text-neutral-900 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
            !selectedDate && "text-neutral-400",
            className
          )}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {selectedDate ? formatDate(selectedDate) : placeholder}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content sideOffset={4} className="z-dropdown">
          <Calendar value={selectedDate} onChange={handleDateChange} onClear={handleClear} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
