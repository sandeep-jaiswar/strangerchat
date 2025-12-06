import React from "react"
import { cn } from "utils/cn"

/**
 * Badge Component - Apple-inspired Design
 *
 * A versatile badge component following Apple's design principles:
 * - Clarity: Clear visual hierarchy with precise typography
 * - Deference: Subtle and non-intrusive, supporting content
 * - Depth: Smooth animations and subtle shadows
 *
 * Features:
 * - Multiple variants: filled, outline, soft (tinted)
 * - Semantic color intents
 * - Smooth spring animations
 * - Icon support with proper spacing
 * - Accessible with proper ARIA attributes
 */

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "filled" | "outline" | "soft" | "minimal"
  intent?: "primary" | "secondary" | "success" | "warning" | "error" | "info" | "purple" | "pink" | "teal"
  size?: "sm" | "md" | "lg"
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const badgeVariants = {
  filled: {
    primary: "bg-[#0071e3] text-white",
    secondary: "bg-neutral-700 text-white",
    success: "bg-[#34c759] text-white",
    warning: "bg-[#ff9500] text-white",
    error: "bg-[#ff3b30] text-white",
    info: "bg-[#007aff] text-white",
    purple: "bg-purple-500 text-white",
    pink: "bg-pink-500 text-white",
    teal: "bg-teal-500 text-white",
  },
  outline: {
    primary: "border border-[#0071e3] text-[#0071e3]",
    secondary: "border border-neutral-400 text-neutral-700",
    success: "border border-[#34c759] text-[#34c759]",
    warning: "border border-[#ff9500] text-[#ff9500]",
    error: "border border-[#ff3b30] text-[#ff3b30]",
    info: "border border-[#007aff] text-[#007aff]",
    purple: "border border-purple-500 text-purple-600",
    pink: "border border-pink-500 text-pink-600",
    teal: "border border-teal-500 text-teal-600",
  },
  soft: {
    primary: "bg-[#0071e3]/10 text-[#0071e3]",
    secondary: "bg-neutral-100 text-neutral-700",
    success: "bg-[#34c759]/10 text-[#34c759]",
    warning: "bg-[#ff9500]/10 text-[#ff9500]",
    error: "bg-[#ff3b30]/10 text-[#ff3b30]",
    info: "bg-[#007aff]/10 text-[#007aff]",
    purple: "bg-purple-100 text-purple-700",
    pink: "bg-pink-100 text-pink-700",
    teal: "bg-teal-100 text-teal-700",
  },
  minimal: {
    primary: "text-[#0071e3]",
    secondary: "text-neutral-700",
    success: "text-[#34c759]",
    warning: "text-[#ff9500]",
    error: "text-[#ff3b30]",
    info: "text-[#007aff]",
    purple: "text-purple-600",
    pink: "text-pink-600",
    teal: "text-teal-600",
  },
}

const badgeSizes = {
  sm: "px-2 py-0.5 text-xs rounded-md",
  md: "px-2.5 py-1 text-sm rounded-lg",
  lg: "px-3 py-1.5 text-base rounded-lg",
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ children, variant = "soft", intent = "primary", size = "md", leftIcon, rightIcon, className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-1 font-medium whitespace-nowrap",
          "transition-colors duration-200",
          badgeVariants[variant][intent],
          badgeSizes[size],
          className
        )}
        {...props}
      >
        {leftIcon && (
          <span className="shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        {children}
        {rightIcon && (
          <span className="shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </span>
    )
  }
)

Badge.displayName = "Badge"
