"use client"

import { cva, type VariantProps } from "class-variance-authority"
import React from "react"
import { cn } from "utils/cn"

const chip = cva(
  [
    "inline-flex",
    "items-center",
    "justify-center",
    "gap-1.5",
    "font-medium",
    "transition-colors",
    "whitespace-nowrap",
  ],
  {
    variants: {
      variant: {
        solid: [],
        outline: ["border", "bg-transparent"],
        soft: [],
      },
      intent: {
        primary: [],
        secondary: [],
        success: [],
        warning: [],
        error: [],
      },
      size: {
        sm: ["h-6", "px-2", "text-xs", "rounded"],
        md: ["h-7", "px-2.5", "text-sm", "rounded-md"],
        lg: ["h-8", "px-3", "text-sm", "rounded-md"],
      },
    },
    compoundVariants: [
      // Solid variants
      { variant: "solid", intent: "primary", className: "bg-primary text-primary-foreground" },
      { variant: "solid", intent: "secondary", className: "bg-neutral-200 text-neutral-700" },
      { variant: "solid", intent: "success", className: "bg-success text-success-foreground" },
      { variant: "solid", intent: "warning", className: "bg-warning text-warning-foreground" },
      { variant: "solid", intent: "error", className: "bg-error text-error-foreground" },
      // Outline variants
      { variant: "outline", intent: "primary", className: "border-primary text-primary" },
      { variant: "outline", intent: "secondary", className: "border-neutral-300 text-neutral-700" },
      { variant: "outline", intent: "success", className: "border-success text-success" },
      { variant: "outline", intent: "warning", className: "border-warning text-warning" },
      { variant: "outline", intent: "error", className: "border-error text-error" },
      // Soft variants
      { variant: "soft", intent: "primary", className: "bg-primary/10 text-primary" },
      { variant: "soft", intent: "secondary", className: "bg-neutral-100 text-neutral-700" },
      { variant: "soft", intent: "success", className: "bg-success/10 text-success" },
      { variant: "soft", intent: "warning", className: "bg-warning/10 text-warning" },
      { variant: "soft", intent: "error", className: "bg-error/10 text-error" },
    ],
    defaultVariants: {
      variant: "soft",
      intent: "secondary",
      size: "md",
    },
  }
)

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof chip> {
  onRemove?: () => void
  removable?: boolean
}

export function Chip({ className, variant, intent, size, onRemove, removable = true, children, ...props }: ChipProps) {
  return (
    <span className={cn(chip({ variant, intent, size, className }))} {...props}>
      {children}
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-black/10"
          aria-label="Remove"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  )
}
