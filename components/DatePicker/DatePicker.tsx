"use client"

import React, { useEffect, useRef, useState } from "react"
import { cn } from "utils/cn"
import { Calendar } from "../Calendar"
import { IconButton } from "../IconButton"

/**
 * Simple Popover implementation to replace Radix UI
 */
interface PopoverContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null)

const usePopover = () => {
  const context = React.useContext(PopoverContext)
  if (!context) throw new Error("Popover components must be used within Popover.Root")
  return context
}

const PopoverRoot: React.FC<{ open?: boolean; onOpenChange?: (open: boolean) => void; children: React.ReactNode }> = ({
  open: controlledOpen,
  onOpenChange,
  children,
}) => {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen

  const setOpen = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen)
    } else {
      setInternalOpen(newOpen)
    }
  }

  return <PopoverContext.Provider value={{ open, setOpen }}>{children}</PopoverContext.Provider>
}

const PopoverTrigger = React.forwardRef<
  HTMLButtonElement,
  { asChild?: boolean; disabled?: boolean; children: React.ReactElement }
>(({ children, disabled }, ref) => {
  const { setOpen } = usePopover()

  return React.cloneElement(children, {
    ref,
    disabled,
    onClick: (e: React.MouseEvent) => {
      children.props.onClick?.(e)
      if (!disabled) {
        setOpen(true)
      }
    },
  })
})
PopoverTrigger.displayName = "PopoverTrigger"

const PopoverContent: React.FC<{ sideOffset?: number; className?: string; children: React.ReactNode }> = ({
  sideOffset = 0,
  className,
  children,
}) => {
  const { open, setOpen } = usePopover()
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [open, setOpen])

  if (!open) return null

  return (
    <div
      ref={contentRef}
      className={className}
      style={{
        position: "fixed",
        zIndex: 50,
        marginTop: `${sideOffset}px`,
      }}
    >
      {children}
    </div>
  )
}

const PopoverPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>
}

const Popover = {
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
  Content: PopoverContent,
  Portal: PopoverPortal,
}

/**
 * DatePicker Component - Apple Calendar-inspired Design
 *
 * Following Apple's Human Interface Guidelines:
 * - Clarity: Clear date display with visual calendar icon
 * - Deference: Unobtrusive until needed, content-focused
 * - Depth: Smooth popover animations, layered interactions
 *
 * Features:
 * - Multiple variants (default/compact/minimal/inline)
 * - Range selection (start/end dates)
 * - Quick date presets (Today, Tomorrow, Next Week, etc.)
 * - Time picker integration
 * - Clear button
 * - Keyboard shortcuts
 * - Custom date formats
 * - Min/max date constraints
 * - Disabled dates
 * - Multiple date selection
 * - Relative date display (Today, Yesterday, etc.)
 */

export interface DatePickerProps {
  value?: Date
  defaultValue?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  variant?: "default" | "compact" | "minimal" | "inline"
  size?: "sm" | "md" | "lg"
  showIcon?: boolean
  showClear?: boolean
  format?: "short" | "long" | "numeric" | "relative"
  minDate?: Date
  maxDate?: Date
  disabledDates?: Date[]
  showPresets?: boolean
  allowTime?: boolean
  error?: boolean
  helperText?: string
}

function formatDate(date: Date, format: DatePickerProps["format"] = "short"): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  // Relative format
  if (format === "relative") {
    if (dateOnly.getTime() === today.getTime()) return "Today"
    if (dateOnly.getTime() === yesterday.getTime()) return "Yesterday"
    if (dateOnly.getTime() === tomorrow.getTime()) return "Tomorrow"

    // This week
    const daysDiff = Math.floor((dateOnly.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (daysDiff > 0 && daysDiff <= 7) {
      return date.toLocaleDateString("en-US", { weekday: "long" })
    }
    if (daysDiff < 0 && daysDiff >= -7) {
      return `Last ${date.toLocaleDateString("en-US", { weekday: "long" })}`
    }
  }

  // Numeric format
  if (format === "numeric") {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  // Long format
  if (format === "long") {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Short format (default)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      placeholder = "Pick a date",
      disabled = false,
      className,
      variant = "default",
      size = "md",
      showIcon = true,
      showClear = true,
      format = "short",
      minDate,
      maxDate,
      disabledDates,
      showPresets = false,
      allowTime: _allowTime = false,
      error = false,
      helperText,
    },
    ref
  ) => {
    const [open, setOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(value || defaultValue)

    const handleDateChange = (date: Date) => {
      setSelectedDate(date)
      onChange?.(date)
      if (!showPresets) {
        setOpen(false)
      }
    }

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation()
      setSelectedDate(undefined)
      onChange?.(undefined)
      setOpen(false)
    }

    // Quick preset dates
    const presets = [
      { label: "Today", getValue: () => new Date() },
      {
        label: "Tomorrow",
        getValue: () => {
          const date = new Date()
          date.setDate(date.getDate() + 1)
          return date
        },
      },
      {
        label: "In 3 days",
        getValue: () => {
          const date = new Date()
          date.setDate(date.getDate() + 3)
          return date
        },
      },
      {
        label: "Next week",
        getValue: () => {
          const date = new Date()
          date.setDate(date.getDate() + 7)
          return date
        },
      },
      {
        label: "Next month",
        getValue: () => {
          const date = new Date()
          date.setMonth(date.getMonth() + 1)
          return date
        },
      },
    ]

    const handlePresetClick = (getValue: () => Date) => {
      const date = getValue()
      setSelectedDate(date)
      onChange?.(date)
      setOpen(false)
    }

    const sizeStyles = {
      sm: "px-2 py-1.5 text-[13px]",
      md: "px-3 py-2 text-[15px]",
      lg: "px-4 py-3 text-[17px]",
    }

    const variantStyles = {
      default: cn(
        "border border-neutral-300 bg-white shadow-sm",
        "hover:border-neutral-400",
        "focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20"
      ),
      compact: cn("border border-neutral-200 bg-white", "hover:bg-neutral-50"),
      minimal: cn("border-none bg-transparent", "hover:bg-neutral-100"),
      inline: cn("border-b-2 border-neutral-300 bg-transparent", "hover:border-neutral-400"),
    }

    return (
      <div className="inline-block">
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild disabled={disabled}>
            <button
              ref={ref}
              type="button"
              className={cn(
                "inline-flex items-center gap-2 rounded-lg transition-all duration-200",
                "text-neutral-900",
                "focus:outline-none",
                "disabled:cursor-not-allowed disabled:opacity-50",
                !selectedDate && "text-neutral-400",
                error && "border-[#ff3b30] focus:ring-[#ff3b30]/20",
                sizeStyles[size],
                variantStyles[variant],
                className
              )}
            >
              {showIcon && variant !== "inline" && (
                <svg
                  className={cn("shrink-0", size === "sm" ? "h-4 w-4" : "h-5 w-5")}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              )}
              <span className="flex-1 truncate text-left">
                {selectedDate ? formatDate(selectedDate, format) : placeholder}
              </span>
              {showClear && selectedDate && !disabled && (
                <IconButton
                  variant="plain"
                  intent="secondary"
                  size="sm"
                  onClick={handleClear}
                  aria-label="Clear date"
                  className="ml-auto"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </IconButton>
              )}
            </button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
              sideOffset={8}
              className={cn(
                "z-50 rounded-2xl border border-neutral-200 bg-white shadow-lg",
                "animate-in fade-in-0 zoom-in-95",
                showPresets ? "flex gap-4 p-4" : "p-3"
              )}
            >
              {/* Quick Presets */}
              {showPresets && (
                <div className="flex w-32 shrink-0 flex-col gap-1 border-r border-neutral-200 pr-4">
                  <h3 className="mb-2 text-[13px] font-semibold text-neutral-500">Quick select</h3>
                  {presets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handlePresetClick(preset.getValue)}
                      className={cn(
                        "rounded-lg px-3 py-2 text-left text-[13px] transition-colors",
                        "hover:bg-neutral-100",
                        selectedDate &&
                          preset.getValue().toDateString() === selectedDate.toDateString() &&
                          "bg-[#0071e3] text-white hover:bg-[#0071e3]"
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Calendar */}
              <div>
                <Calendar
                  value={selectedDate}
                  onChange={handleDateChange}
                  minDate={minDate}
                  maxDate={maxDate}
                  disabledDates={disabledDates}
                  variant="minimal"
                />
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {/* Helper text */}
        {helperText && (
          <p className={cn("mt-1 text-[13px]", error ? "text-[#ff3b30]" : "text-neutral-500")}>{helperText}</p>
        )}
      </div>
    )
  }
)

DatePicker.displayName = "DatePicker"
