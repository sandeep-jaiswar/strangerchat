import { cva, type VariantProps } from "class-variance-authority"
import React from "react"
import { cn } from "utils/cn"

const progressBar = cva(["w-full", "rounded-full", "overflow-hidden", "bg-neutral-200"], {
  variants: {
    size: {
      sm: ["h-1"],
      md: ["h-2"],
      lg: ["h-3"],
    },
  },
  defaultVariants: {
    size: "md",
  },
})

const progressIndicator = cva(["h-full", "rounded-full", "transition-all", "duration-300"], {
  variants: {
    intent: {
      primary: ["bg-primary"],
      success: ["bg-success"],
      warning: ["bg-warning"],
      error: ["bg-error"],
    },
  },
  defaultVariants: {
    intent: "primary",
  },
})

export interface ProgressBarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressBar>,
    VariantProps<typeof progressIndicator> {
  value: number
  max?: number
  showLabel?: boolean
  labelPosition?: "left" | "right"
}

export function ProgressBar({
  value,
  max = 100,
  size,
  intent,
  showLabel = false,
  labelPosition = "right",
  className,
  ...props
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className={cn("flex items-center gap-3", className)} {...props}>
      {showLabel && labelPosition === "left" && (
        <span className="text-sm font-medium whitespace-nowrap text-neutral-700">
          {value}/{max}
        </span>
      )}
      <div className={cn(progressBar({ size }), "flex-1")}>
        <div className={cn(progressIndicator({ intent }))} style={{ width: `${percentage}%` }} />
      </div>
      {showLabel && labelPosition === "right" && (
        <span className="text-sm whitespace-nowrap text-neutral-500">in total</span>
      )}
    </div>
  )
}
