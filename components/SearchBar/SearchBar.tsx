"use client"

import { cva, type VariantProps } from "class-variance-authority"
import React, { useCallback, useEffect, useRef } from "react"
import { IconButton } from "components/IconButton/IconButton"
import { cn } from "utils/cn"

/**
 * SearchBar Component
 *
 * An Apple-inspired search bar with elegant design and smooth interactions.
 * Features auto-focus, clear button, loading state, and keyboard shortcuts.
 *
 * @example
 * ```tsx
 * <SearchBar
 *   value={query}
 *   onChange={setQuery}
 *   placeholder="Search messages..."
 *   onSearch={() => performSearch()}
 * />
 * ```
 */

const searchBarVariants = cva(
  [
    "relative flex items-center gap-2",
    "transition-all duration-300 ease-out",
    "focus-within:ring-2 focus-within:ring-[#0071e3] focus-within:ring-offset-1",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-neutral-100 border border-transparent",
          "hover:bg-neutral-200",
          "dark:bg-neutral-800 dark:hover:bg-neutral-700",
        ],
        bordered: [
          "bg-white border border-neutral-300",
          "hover:border-neutral-400",
          "dark:bg-neutral-900 dark:border-neutral-700 dark:hover:border-neutral-600",
        ],
        filled: [
          "bg-[#0071e3]/5 border border-[#0071e3]/20",
          "hover:bg-[#0071e3]/10",
          "dark:bg-[#0071e3]/10 dark:border-[#0071e3]/30",
        ],
        minimal: [
          "bg-transparent border-b-2 border-neutral-300",
          "hover:border-neutral-400",
          "dark:border-neutral-700 dark:hover:border-neutral-600",
          "rounded-none",
        ],
      },
      size: {
        sm: "h-9 px-3 text-sm rounded-lg",
        md: "h-11 px-4 text-[15px] rounded-xl",
        lg: "h-12 px-5 text-base rounded-xl",
      },
      fullWidth: {
        true: "w-full",
        false: "w-auto",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      fullWidth: true,
    },
  }
)

const iconSize = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-5 h-5",
}

export interface SearchBarProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "onChange">,
    VariantProps<typeof searchBarVariants> {
  /** Current search value */
  value: string
  /** Change handler receiving the new value */
  onChange: (value: string) => void
  /** Search action handler (triggered on Enter or search button) */
  onSearch?: () => void
  /** Clear handler (called when clear button is clicked) */
  onClear?: () => void
  /** Placeholder text */
  placeholder?: string
  /** Show loading spinner */
  loading?: boolean
  /** Auto focus on mount */
  autoFocus?: boolean
  /** Show search icon */
  showSearchIcon?: boolean
  /** Show clear button when there's text */
  showClearButton?: boolean
  /** Disabled state */
  disabled?: boolean
  /** Custom className */
  className?: string
  /** Custom input className */
  inputClassName?: string
  /** Keyboard shortcut hint (e.g., "⌘K") */
  shortcut?: string
}

export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      value,
      onChange,
      onSearch,
      onClear,
      placeholder = "Search...",
      loading = false,
      autoFocus = false,
      showSearchIcon = true,
      showClearButton = true,
      disabled = false,
      variant = "default",
      size = "md",
      fullWidth = true,
      className,
      inputClassName,
      shortcut,
      onKeyDown,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const [isFocused, setIsFocused] = React.useState(false)

    // Merge refs
    React.useImperativeHandle(ref, () => inputRef.current!)

    // Auto focus
    useEffect(() => {
      if (autoFocus && inputRef.current) {
        inputRef.current.focus()
      }
    }, [autoFocus])

    // Handle keyboard shortcuts
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && onSearch) {
          e.preventDefault()
          onSearch()
        } else if (e.key === "Escape") {
          e.preventDefault()
          if (value) {
            handleClear()
          } else {
            inputRef.current?.blur()
          }
        }
        onKeyDown?.(e)
      },
      [onSearch, value, onKeyDown]
    )

    const handleClear = useCallback(() => {
      onChange("")
      onClear?.()
      inputRef.current?.focus()
    }, [onChange, onClear])

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true)
        onFocus?.(e)
      },
      [onFocus]
    )

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false)
        onBlur?.(e)
      },
      [onBlur]
    )

    const showClear = showClearButton && value && !loading

    return (
      <div
        className={cn(
          searchBarVariants({ variant, size, fullWidth }),
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        {/* Search Icon */}
        {showSearchIcon && (
          <svg
            className={cn(
              size ? iconSize[size] : iconSize.md,
              "shrink-0 text-neutral-500 dark:text-neutral-400",
              isFocused && "text-[#0071e3]"
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        )}

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          role="searchbox"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled || loading}
          className={cn(
            "flex-1 bg-transparent outline-none",
            "text-neutral-900 placeholder:text-neutral-500",
            "dark:text-white dark:placeholder:text-neutral-400",
            "disabled:cursor-not-allowed",
            inputClassName
          )}
          {...props}
        />

        {/* Loading Spinner */}
        {loading && (
          <div
            className={cn(
              "shrink-0 animate-spin rounded-full border-2 border-neutral-300 border-t-[#0071e3]",
              size === "sm" && "h-4 w-4",
              size === "md" && "h-4 w-4",
              size === "lg" && "h-5 w-5"
            )}
            aria-label="Loading"
          />
        )}

        {/* Clear Button */}
        {showClear && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              "shrink-0 rounded-full p-1",
              "text-neutral-500 hover:text-neutral-700",
              "hover:bg-neutral-200 active:bg-neutral-300",
              "dark:text-neutral-400 dark:hover:text-neutral-200",
              "dark:hover:bg-neutral-700 dark:active:bg-neutral-600",
              "transition-colors duration-200",
              "focus:ring-2 focus:ring-[#0071e3] focus:ring-offset-1 focus:outline-none"
            )}
            aria-label="Clear search"
          >
            <svg className={size ? iconSize[size] : iconSize.md} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Keyboard Shortcut Hint */}
        {shortcut && !isFocused && !value && (
          <kbd
            className={cn(
              "shrink-0 rounded px-2 py-0.5",
              "bg-neutral-200 dark:bg-neutral-700",
              "text-neutral-600 dark:text-neutral-400",
              "font-mono font-semibold",
              size === "sm" && "text-[10px]",
              size === "md" && "text-xs",
              size === "lg" && "text-xs"
            )}
          >
            {shortcut}
          </kbd>
        )}

        {/* Search Button (optional) */}
        {onSearch && value && !loading && (
          <IconButton
            variant="tinted"
            intent="primary"
            size="sm"
            onClick={onSearch}
            aria-label="Search"
            className="shrink-0"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </IconButton>
        )}
      </div>
    )
  }
)

SearchBar.displayName = "SearchBar"
