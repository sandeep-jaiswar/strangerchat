import { cva, type VariantProps } from "class-variance-authority"
import React from "react"
import { cn } from "utils/cn"

const button = cva(
  [
    "inline-flex",
    "items-center",
    "justify-center",
    "font-medium",
    "transition-colors",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-primary",
    "disabled:opacity-50",
    "disabled:pointer-events-none",
    "gap-2",
  ],
  {
    variants: {
      variant: {
        solid: [],
        outline: ["border", "bg-transparent"],
        ghost: ["bg-transparent"],
      },
      intent: {
        primary: [],
        secondary: [],
        error: [],
      },
      size: {
        sm: ["h-8", "px-3", "text-sm"],
        md: ["h-10", "px-4", "text-base"],
        lg: ["h-12", "px-6", "text-lg"],
        icon: ["h-10", "w-10", "p-0"],
        "icon-sm": ["h-8", "w-8", "p-0"],
        "icon-lg": ["h-12", "w-12", "p-0"],
      },
      rounded: {
        sm: ["rounded-sm"],
        md: ["rounded-md"],
        lg: ["rounded-lg"],
        xl: ["rounded-xl"],
        full: ["rounded-full"],
      },
    },
    compoundVariants: [
      // Solid variants
      { variant: "solid", intent: "primary", className: "bg-primary text-primary-foreground hover:bg-primary-hover" },
      {
        variant: "solid",
        intent: "secondary",
        className: "bg-secondary text-secondary-foreground hover:bg-secondary-hover",
      },
      { variant: "solid", intent: "error", className: "bg-error text-error-foreground hover:opacity-90" },
      // Outline variants
      {
        variant: "outline",
        intent: "primary",
        className: "border-primary text-primary hover:bg-primary hover:text-primary-foreground",
      },
      {
        variant: "outline",
        intent: "secondary",
        className: "border-neutral-300 text-neutral-700 hover:bg-neutral-100",
      },
      { variant: "outline", intent: "error", className: "border-error text-error hover:bg-error hover:text-white" },
      // Ghost variants
      { variant: "ghost", intent: "primary", className: "text-primary hover:bg-primary/10" },
      { variant: "ghost", intent: "secondary", className: "text-neutral-700 hover:bg-neutral-100" },
      { variant: "ghost", intent: "error", className: "text-error hover:bg-error/10" },
    ],
    defaultVariants: {
      variant: "solid",
      intent: "primary",
      size: "md",
      rounded: "md",
    },
  }
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof button> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export function Button({
  className,
  variant,
  intent,
  size,
  rounded,
  leftIcon,
  rightIcon,
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={cn(button({ variant, intent, size, rounded, className }))} {...props}>
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  )
}
