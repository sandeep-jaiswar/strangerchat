"use client"

import { cva, type VariantProps } from "class-variance-authority"
import React from "react"
import { cn } from "utils/cn"

/**
 * Loader Component - Apple-inspired Design
 *
 * Following Apple's Human Interface Guidelines:
 * - Clarity: Clear loading indication
 * - Deference: Non-intrusive spinner
 * - Depth: Smooth rotation animation
 *
 * Features:
 * - Lightweight implementation
 * - Multiple size variants
 * - Intent colors
 * - Optional label
 * - Overlay mode for full-page loading
 */

const loader = cva(["inline-block", "animate-spin", "rounded-full", "border-2", "border-solid"], {
  variants: {
    intent: {
      primary: ["border-[#0071e3]", "border-t-transparent"],
      secondary: ["border-gray-400", "border-t-transparent"],
      success: ["border-[#34c759]", "border-t-transparent"],
      warning: ["border-[#ff9500]", "border-t-transparent"],
      danger: ["border-[#ff3b30]", "border-t-transparent"],
      white: ["border-white", "border-t-transparent"],
    },
    size: {
      xs: ["w-3", "h-3"],
      sm: ["w-4", "h-4"],
      md: ["w-6", "h-6"],
      lg: ["w-8", "h-8"],
      xl: ["w-12", "h-12"],
    },
  },
  defaultVariants: {
    intent: "primary",
    size: "md",
  },
})

export interface LoaderProps extends VariantProps<typeof loader> {
  /** Optional label */
  label?: string

  /** Show as overlay (full-page loading) */
  overlay?: boolean

  /** Custom className */
  className?: string
}

export const Loader = React.forwardRef<HTMLDivElement, LoaderProps>(
  ({ intent, size, label, overlay = false, className, ...props }, ref) => {
    const content = (
      <div
        ref={ref}
        className={cn("flex flex-col items-center justify-center gap-3", !overlay && className)}
        role="status"
        aria-live="polite"
        {...props}
      >
        <div className={cn(loader({ intent, size }))} />
        {label && <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>}
        <span className="sr-only">{label || "Loading..."}</span>
      </div>
    )

    if (overlay) {
      return (
        <div
          className={cn(
            "fixed inset-0 z-[200] flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-gray-900/80",
            className
          )}
        >
          {content}
        </div>
      )
    }

    return content
  }
)

Loader.displayName = "Loader"

/**
 * Dots Loader - Alternative loading indicator
 */
const dots = cva(["inline-flex", "items-center", "gap-1"])

const dot = cva(["rounded-full", "animate-bounce"], {
  variants: {
    intent: {
      primary: ["bg-[#0071e3]"],
      secondary: ["bg-gray-400"],
      success: ["bg-[#34c759]"],
      warning: ["bg-[#ff9500]"],
      danger: ["bg-[#ff3b30]"],
      white: ["bg-white"],
    },
    size: {
      xs: ["w-1", "h-1"],
      sm: ["w-1.5", "h-1.5"],
      md: ["w-2", "h-2"],
      lg: ["w-2.5", "h-2.5"],
      xl: ["w-3", "h-3"],
    },
  },
  defaultVariants: {
    intent: "primary",
    size: "md",
  },
})

export interface DotsLoaderProps extends VariantProps<typeof dot> {
  /** Custom className */
  className?: string
}

export function DotsLoader({ intent, size, className }: DotsLoaderProps) {
  return (
    <div className={cn(dots(), className)} role="status" aria-live="polite">
      <div className={cn(dot({ intent, size }))} style={{ animationDelay: "0ms" }} />
      <div className={cn(dot({ intent, size }))} style={{ animationDelay: "150ms" }} />
      <div className={cn(dot({ intent, size }))} style={{ animationDelay: "300ms" }} />
      <span className="sr-only">Loading...</span>
    </div>
  )
}
