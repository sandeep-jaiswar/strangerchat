"use client"

import React from "react"
import { cn } from "utils/cn"

/**
 * Chip Component - Apple-inspired Design
 *
 * Following Apple's Human Interface Guidelines:
 * - Clarity: Clear, readable tags and labels
 * - Deference: Subtle and non-intrusive
 * - Depth: Smooth animations
 *
 * Features:
 * - Lightweight implementation (no dependencies)
 * - Multiple variants and intents
 * - Removable functionality
 * - Icon support
 * - Smooth animations
 */

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "solid" | "outline" | "soft"
  intent?: "primary" | "secondary" | "success" | "warning" | "error"
  size?: "sm" | "md" | "lg"
  removable?: boolean
  onRemove?: () => void
}

const chipVariants = {
  solid: {
    primary: "bg-[#0071e3] text-white",
    secondary: "bg-neutral-700 text-white",
    success: "bg-[#34c759] text-white",
    warning: "bg-[#ff9500] text-white",
    error: "bg-[#ff3b30] text-white",
  },
  outline: {
    primary: "border-2 border-[#0071e3] text-[#0071e3]",
    secondary: "border-2 border-neutral-400 text-neutral-700",
    success: "border-2 border-[#34c759] text-[#34c759]",
    warning: "border-2 border-[#ff9500] text-[#ff9500]",
    error: "border-2 border-[#ff3b30] text-[#ff3b30]",
  },
  soft: {
    primary: "bg-[#0071e3]/10 text-[#0071e3]",
    secondary: "bg-neutral-100 text-neutral-700",
    success: "bg-[#34c759]/10 text-[#34c759]",
    warning: "bg-[#ff9500]/10 text-[#ff9500]",
    error: "bg-[#ff3b30]/10 text-[#ff3b30]",
  },
}

const chipSizes = {
  sm: "h-6 px-2 text-xs rounded-md gap-1",
  md: "h-8 px-3 text-sm rounded-lg gap-1.5",
  lg: "h-10 px-4 text-base rounded-xl gap-2",
}

const removeButtonSizes = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-5 h-5",
}

export const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  (
    { children, variant = "soft", intent = "secondary", size = "md", removable = true, onRemove, className, ...props },
    ref
  ) => {
    const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation()
      onRemove?.()
    }

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium",
          "transition-all duration-200",
          chipVariants[variant][intent],
          chipSizes[size],
          className
        )}
        role="status"
        {...props}
      >
        <span className="truncate">{children}</span>
        {removable && (
          <button
            type="button"
            onClick={handleRemove}
            className={cn(
              "shrink-0 rounded-full transition-opacity hover:opacity-70",
              "focus:ring-2 focus:ring-offset-1 focus:outline-none",
              variant === "solid" ? "focus:ring-white" : "focus:ring-current",
              removeButtonSizes[size]
            )}
            aria-label="Remove"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    )
  }
)

Chip.displayName = "Chip"
