import React from "react"
import { cn } from "utils/cn"

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Label text displayed above the input */
  label?: string

  /** Helper text displayed below the input */
  helperText?: string

  /** Error message - overrides helperText and applies error styling */
  error?: string

  /** Success message - applies success styling */
  success?: string

  /** Icon component displayed on the left side */
  leftIcon?: React.ReactNode

  /** Icon component displayed on the right side */
  rightIcon?: React.ReactNode

  /** Size of the input */
  size?: "sm" | "md" | "lg"

  /** Marks the field as required with an asterisk */
  required?: boolean

  /** Custom wrapper className */
  wrapperClassName?: string

  /** If true, input takes the full width of the container */
  fullWidth?: boolean
}

const inputSizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-11 px-4 text-base", // iOS 44px standard
  lg: "h-14 px-5 text-lg",
}

const iconSizes = {
  sm: "left-3 right-3",
  md: "left-4 right-4",
  lg: "left-5 right-5",
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      success,
      leftIcon,
      rightIcon,
      size = "md",
      fullWidth = true,
      className,
      id,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || React.useId()
    const hasError = !!error
    const hasSuccess = !!success && !hasError
    const helperId = helperText ? `${inputId}-helper` : undefined
    const errorId = error ? `${inputId}-error` : undefined
    const successId = success ? `${inputId}-success` : undefined

    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
        {/* Label */}
        {label && (
          <label htmlFor={inputId} className="flex items-center gap-1 text-sm font-medium text-neutral-900">
            {label}
            {required && (
              <span className="text-[#ff3b30]" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        {/* Input Wrapper with Icons */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div
              className={cn(
                "pointer-events-none absolute top-1/2 flex -translate-y-1/2 items-center",
                "text-neutral-400",
                iconSizes[size].split(" ")[0]
              )}
              aria-hidden="true"
            >
              {leftIcon}
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            className={cn(
              "w-full rounded-xl border transition-all duration-200",
              "font-medium placeholder:font-normal placeholder:text-neutral-400",
              "focus:ring-2 focus:ring-offset-1 focus:outline-none",
              // Sizes
              inputSizes[size],
              // Icon padding
              leftIcon ? (size === "sm" ? "pl-9" : size === "md" ? "pl-11" : "pl-14") : "",
              rightIcon ? (size === "sm" ? "pr-9" : size === "md" ? "pr-11" : "pr-14") : "",
              // States
              hasError
                ? "border-[#ff3b30] bg-[#ff3b30]/5 text-[#ff3b30] focus:border-[#ff3b30] focus:ring-[#ff3b30]/20"
                : "",
              hasSuccess
                ? "border-[#34c759] bg-[#34c759]/5 text-[#34c759] focus:border-[#34c759] focus:ring-[#34c759]/20"
                : "",
              !hasError && !hasSuccess
                ? "border-neutral-200 bg-neutral-50 text-neutral-900 focus:border-[#0071e3] focus:ring-[#0071e3]/20"
                : "",
              // Disabled
              disabled && "cursor-not-allowed bg-neutral-100 opacity-50",
              className
            )}
            aria-invalid={hasError}
            aria-describedby={cn(errorId && errorId, successId && successId, helperId && helperId) || undefined}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <div
              className={cn(
                "pointer-events-none absolute top-1/2 flex -translate-y-1/2 items-center",
                hasError ? "text-[#ff3b30]" : hasSuccess ? "text-[#34c759]" : "text-neutral-400",
                iconSizes[size].split(" ")[1]
              )}
              aria-hidden="true"
            >
              {rightIcon}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p id={errorId} className="text-sm text-[#ff3b30]" role="alert">
            {error}
          </p>
        )}

        {/* Success Message */}
        {success && !error && (
          <p id={successId} className="text-sm text-[#34c759]">
            {success}
          </p>
        )}

        {/* Helper Text */}
        {helperText && !error && !success && (
          <p id={helperId} className="text-sm text-neutral-500">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"
