import React from "react"
import { cn } from "utils/cn"

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "filled" | "tinted" | "bordered" | "plain"
  intent?: "primary" | "secondary" | "success" | "danger" | "warning"
  size?: "sm" | "md" | "lg"
  shape?: "circle" | "rounded"
  loading?: boolean
  "aria-label": string // Required for accessibility
}

const iconButtonVariants = {
  filled: {
    primary: "bg-[#0071e3] text-white hover:bg-[#0077ed] active:bg-[#005bb5]",
    secondary: "bg-neutral-700 text-white hover:bg-neutral-600 active:bg-neutral-800",
    success: "bg-[#34c759] text-white hover:opacity-90 active:opacity-80",
    danger: "bg-[#ff3b30] text-white hover:opacity-90 active:opacity-80",
    warning: "bg-[#ff9500] text-white hover:opacity-90 active:opacity-80",
  },
  tinted: {
    primary: "bg-[#0071e3]/10 text-[#0071e3] hover:bg-[#0071e3]/20 active:bg-[#0071e3]/30",
    secondary: "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 active:bg-neutral-300",
    success: "bg-[#34c759]/10 text-[#34c759] hover:bg-[#34c759]/20 active:bg-[#34c759]/30",
    danger: "bg-[#ff3b30]/10 text-[#ff3b30] hover:bg-[#ff3b30]/20 active:bg-[#ff3b30]/30",
    warning: "bg-[#ff9500]/10 text-[#ff9500] hover:bg-[#ff9500]/20 active:bg-[#ff9500]/30",
  },
  bordered: {
    primary: "border-2 border-[#0071e3] text-[#0071e3] hover:bg-[#0071e3]/5 active:bg-[#0071e3]/10",
    secondary: "border-2 border-neutral-300 text-neutral-900 hover:bg-neutral-50 active:bg-neutral-100",
    success: "border-2 border-[#34c759] text-[#34c759] hover:bg-[#34c759]/5 active:bg-[#34c759]/10",
    danger: "border-2 border-[#ff3b30] text-[#ff3b30] hover:bg-[#ff3b30]/5 active:bg-[#ff3b30]/10",
    warning: "border-2 border-[#ff9500] text-[#ff9500] hover:bg-[#ff9500]/5 active:bg-[#ff9500]/10",
  },
  plain: {
    primary: "text-[#0071e3] hover:bg-[#0071e3]/10 active:bg-[#0071e3]/20",
    secondary: "text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200",
    success: "text-[#34c759] hover:bg-[#34c759]/10 active:bg-[#34c759]/20",
    danger: "text-[#ff3b30] hover:bg-[#ff3b30]/10 active:bg-[#ff3b30]/20",
    warning: "text-[#ff9500] hover:bg-[#ff9500]/10 active:bg-[#ff9500]/20",
  },
}

const iconButtonSizes = {
  sm: "w-9 h-9 text-sm", // 36px
  md: "w-11 h-11 text-base", // 44px iOS standard
  lg: "w-14 h-14 text-lg", // 56px
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      children,
      variant = "tinted",
      intent = "secondary",
      size = "md",
      shape = "circle",
      loading = false,
      disabled,
      className,
      type = "button",
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          "inline-flex shrink-0 items-center justify-center",
          "font-medium transition-all duration-200 ease-out",
          "focus:ring-2 focus:ring-offset-2 focus:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          iconButtonVariants[variant][intent],
          iconButtonSizes[size],
          shape === "circle" ? "rounded-full" : "rounded-xl",
          intent === "primary" && "focus:ring-[#0071e3]",
          intent === "secondary" && "focus:ring-neutral-400",
          intent === "success" && "focus:ring-[#34c759]",
          intent === "danger" && "focus:ring-[#ff3b30]",
          intent === "warning" && "focus:ring-[#ff9500]",
          className
        )}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <svg
            className="h-5 w-5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          children
        )}
      </button>
    )
  }
)

IconButton.displayName = "IconButton"
