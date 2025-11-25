import { cva, type VariantProps } from "class-variance-authority"
import React from "react"
import { cn } from "utils/cn"

const input = cva(
  [
    "block",
    "w-full",
    "border",
    "border-neutral-300",
    "bg-white",
    "text-neutral-900",
    "placeholder:text-neutral-400",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-primary",
    "focus:border-primary",
    "rounded-md",
    "transition",
    "disabled:bg-neutral-100",
    "disabled:cursor-not-allowed",
  ],
  {
    variants: {
      size: {
        sm: ["h-8", "px-2", "text-sm"],
        md: ["h-10", "px-3", "text-base"],
        lg: ["h-12", "px-4", "text-lg"],
      },
      intent: {
        default: [],
        error: ["border-error", "focus:ring-error"],
      },
    },
    defaultVariants: {
      size: "md",
      intent: "default",
    },
  }
)

type InputBaseProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">
export interface InputProps extends InputBaseProps, VariantProps<typeof input> {
  label?: string
  error?: string
  size?: "sm" | "md" | "lg"
}

export const Input: React.FC<InputProps> = ({ label, error, size, intent, className, id, ...props }) => {
  const inputId = id || (label ? `input-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined)
  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(input({ size, intent: error ? "error" : intent, className }))}
        aria-invalid={!!error}
        {...props}
      />
      {error && <span className="text-error mt-1 block text-xs">{error}</span>}
    </div>
  )
}
