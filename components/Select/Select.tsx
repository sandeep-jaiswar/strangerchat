"use client"

import React from "react"
import { cn } from "utils/cn"

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps {
  /** Options to display */
  options: SelectOption[]

  /** Selected value(s) */
  value?: string | string[]

  /** Callback when selection changes */
  onChange?: (value: string | string[]) => void

  /** Label text */
  label?: string

  /** Helper text */
  helperText?: string

  /** Error message */
  error?: string

  /** Placeholder text */
  placeholder?: string

  /** Size of the select */
  size?: "sm" | "md" | "lg"

  /** Disabled state */
  disabled?: boolean

  /** Required field */
  required?: boolean

  /** Enable multiple selection */
  multiple?: boolean

  /** Enable search/filter */
  searchable?: boolean

  /** Full width */
  fullWidth?: boolean
}

const selectSizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-11 px-4 text-base",
  lg: "h-14 px-5 text-lg",
}

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      options,
      value,
      onChange,
      label,
      helperText,
      error,
      placeholder = "Select...",
      size = "md",
      disabled = false,
      required = false,
      multiple = false,
      searchable = false,
      fullWidth = true,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    const selectRef = React.useRef<HTMLDivElement>(null)
    const inputRef = React.useRef<HTMLInputElement>(null)
    const selectId = React.useId()
    const hasError = !!error

    const selectedValues = Array.isArray(value) ? value : value ? [value] : []
    const selectedOptions = options.filter((opt) => selectedValues.includes(opt.value))

    const filteredOptions =
      searchable && searchQuery
        ? options.filter((opt) => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
        : options

    // Close dropdown on outside click
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setIsOpen(false)
          setSearchQuery("")
        }
      }

      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // Handle keyboard navigation
    React.useEffect(() => {
      if (isOpen && searchable && inputRef.current) {
        inputRef.current.focus()
      }
    }, [isOpen, searchable])

    const handleToggle = () => {
      if (!disabled) {
        setIsOpen(!isOpen)
      }
    }

    const handleSelect = (optionValue: string) => {
      if (multiple) {
        const newValues = selectedValues.includes(optionValue)
          ? selectedValues.filter((v) => v !== optionValue)
          : [...selectedValues, optionValue]
        onChange?.(newValues)
      } else {
        onChange?.(optionValue)
        setIsOpen(false)
        setSearchQuery("")
      }
    }

    const handleRemove = (optionValue: string, e: React.MouseEvent) => {
      e.stopPropagation()
      if (multiple) {
        onChange?.(selectedValues.filter((v) => v !== optionValue))
      } else {
        onChange?.("")
      }
    }

    const getDisplayText = () => {
      if (selectedOptions.length === 0) return placeholder
      if (multiple) {
        return `${selectedOptions.length} selected`
      }
      return selectedOptions[0]?.label || placeholder
    }

    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")} ref={selectRef}>
        {/* Label */}
        {label && (
          <label htmlFor={selectId} className="flex items-center gap-1 text-sm font-medium text-neutral-900">
            {label}
            {required && (
              <span className="text-[#ff3b30]" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        {/* Select Button */}
        <div className="relative">
          <button
            id={selectId}
            type="button"
            onClick={handleToggle}
            disabled={disabled}
            className={cn(
              "w-full rounded-xl border transition-all duration-200",
              "flex items-center justify-between gap-2",
              "text-left font-medium",
              "focus:ring-2 focus:ring-offset-1 focus:outline-none",
              selectSizes[size],
              hasError ? "border-[#ff3b30] bg-[#ff3b30]/5 focus:border-[#ff3b30] focus:ring-[#ff3b30]/20" : "",
              !hasError ? "border-neutral-200 bg-neutral-50 focus:border-[#0071e3] focus:ring-[#0071e3]/20" : "",
              disabled && "cursor-not-allowed opacity-50",
              isOpen && "border-[#0071e3] ring-2 ring-[#0071e3]/20"
            )}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
          >
            <span className={cn("truncate", selectedValues.length === 0 && "text-neutral-400")}>
              {getDisplayText()}
            </span>
            <svg
              className={cn("h-5 w-5 text-neutral-400 transition-transform", isOpen && "rotate-180")}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown */}
          {isOpen && (
            <div
              className={cn(
                "absolute z-50 mt-2 w-full py-2",
                "rounded-xl border border-neutral-200 bg-white shadow-lg",
                "max-h-60 overflow-auto"
              )}
              role="listbox"
            >
              {/* Search Input */}
              {searchable && (
                <div className="px-2 pb-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:ring-2 focus:ring-[#0071e3]/20 focus:outline-none"
                  />
                </div>
              )}

              {/* Options */}
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-center text-sm text-neutral-400">No options found</div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = selectedValues.includes(option.value)
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => !option.disabled && handleSelect(option.value)}
                      disabled={option.disabled}
                      className={cn(
                        "w-full px-3 py-2 text-left text-sm transition-colors",
                        "flex items-center justify-between gap-2",
                        isSelected && "bg-[#0071e3]/10 font-medium text-[#0071e3]",
                        !isSelected && "text-neutral-900 hover:bg-neutral-50",
                        option.disabled && "cursor-not-allowed opacity-50"
                      )}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <span className="truncate">{option.label}</span>
                      {isSelected && (
                        <svg
                          className="h-4 w-4 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          )}
        </div>

        {/* Selected Pills (Multiple) */}
        {multiple && selectedOptions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedOptions.map((option) => (
              <span
                key={option.value}
                className="inline-flex items-center gap-1 rounded-lg bg-[#0071e3]/10 px-2 py-1 text-xs font-medium text-[#0071e3]"
              >
                {option.label}
                <button
                  type="button"
                  onClick={(e) => handleRemove(option.value, e)}
                  className="rounded p-0.5 transition-colors hover:bg-[#0071e3]/20"
                  aria-label={`Remove ${option.label}`}
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-sm text-[#ff3b30]" role="alert">
            {error}
          </p>
        )}

        {/* Helper Text */}
        {helperText && !error && <p className="text-sm text-neutral-500">{helperText}</p>}
      </div>
    )
  }
)

Select.displayName = "Select"
