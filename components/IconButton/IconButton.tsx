import { cva, type VariantProps } from "class-variance-authority"
import React from "react"
import { cn } from "utils/cn"

const iconButton = cva(
  [
    "inline-flex",
    "items-center",
    "justify-center",
    "transition-colors",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-primary",
    "disabled:opacity-50",
    "disabled:pointer-events-none",
  ],
  {
    variants: {
      variant: {
        solid: [],
        outline: ["border"],
        ghost: ["bg-transparent"],
      },
      intent: {
        primary: [],
        secondary: [],
        error: [],
      },
      size: {
        sm: ["h-8", "w-8"],
        md: ["h-10", "w-10"],
        lg: ["h-12", "w-12"],
      },
      rounded: {
        md: ["rounded-md"],
        lg: ["rounded-lg"],
        full: ["rounded-full"],
      },
    },
    compoundVariants: [
      // Solid variants
      { variant: "solid", intent: "primary", className: "bg-primary text-primary-foreground hover:bg-primary-hover" },
      { variant: "solid", intent: "secondary", className: "bg-neutral-100 text-neutral-700 hover:bg-neutral-200" },
      { variant: "solid", intent: "error", className: "bg-error text-error-foreground hover:opacity-90" },
      // Outline variants
      {
        variant: "outline",
        intent: "primary",
        className: "border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground",
      },
      {
        variant: "outline",
        intent: "secondary",
        className: "border-neutral-300 text-neutral-700 bg-transparent hover:bg-neutral-100",
      },
      { variant: "outline", intent: "error", className: "border-error text-error bg-transparent hover:bg-error hover:text-white" },
      // Ghost variants
      { variant: "ghost", intent: "primary", className: "text-primary hover:bg-primary/10" },
      { variant: "ghost", intent: "secondary", className: "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700" },
      { variant: "ghost", intent: "error", className: "text-error hover:bg-error/10" },
    ],
    defaultVariants: {
      variant: "ghost",
      intent: "secondary",
      size: "md",
      rounded: "md",
    },
  }
)

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButton> {
  "aria-label": string
}

export function IconButton({ className, variant, intent, size, rounded, children, ...props }: IconButtonProps) {
  return (
    <button className={cn(iconButton({ variant, intent, size, rounded, className }))} {...props}>
      {children}
    </button>
  )
}
