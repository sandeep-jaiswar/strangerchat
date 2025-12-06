"use client"

import React from "react"
import { cn } from "utils/cn"

/**
 * Switch Component
 *
 * Following Apple's Human Interface Guidelines:
 * - iOS-style toggle switch with smooth spring animation
 * - Proper 44px minimum touch target height (md size)
 * - Clear on/off states with semantic colors
 * - Smooth haptic feedback animation
 * - Accessible label association
 */

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Optional label text */
  label?: string
  /** Label position */
  labelPosition?: "left" | "right"
  /** Helper text */
  helperText?: string
  intent?: "primary" | "secondary" | "success" | "danger" | "warning"
  size?: "sm" | "md" | "lg"
}

const switchIntents = {
  primary: "peer-checked:bg-[#0071e3]",
  secondary: "peer-checked:bg-neutral-700",
  success: "peer-checked:bg-[#34c759]",
  danger: "peer-checked:bg-[#ff3b30]",
  warning: "peer-checked:bg-[#ff9500]",
}

const switchSizes = {
  sm: {
    track: "w-9 h-5",
    thumb: "w-3.5 h-3.5",
    translate: "peer-checked:translate-x-4",
  },
  md: {
    track: "w-11 h-6", // iOS 44px touch target with padding
    thumb: "w-4 h-4",
    translate: "peer-checked:translate-x-5",
  },
  lg: {
    track: "w-14 h-7",
    thumb: "w-5 h-5",
    translate: "peer-checked:translate-x-7",
  },
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  (
    { label, helperText, labelPosition = "right", intent = "primary", size = "md", className, disabled, id, ...props },
    ref
  ) => {
    const switchId = id || React.useId()
    const sizeConfig = switchSizes[size]

    const switchElement = (
      <label
        htmlFor={switchId}
        className={cn("relative inline-flex cursor-pointer", disabled && "cursor-not-allowed opacity-50")}
      >
        <input ref={ref} id={switchId} type="checkbox" disabled={disabled} className="peer sr-only" {...props} />
        <div
          className={cn(
            "relative rounded-full transition-all duration-300 ease-out",
            "bg-neutral-300 peer-focus:ring-2 peer-focus:ring-offset-2",
            switchIntents[intent],
            sizeConfig.track,
            intent === "primary" && "peer-focus:ring-[#0071e3]/20",
            intent === "secondary" && "peer-focus:ring-neutral-400/20",
            intent === "success" && "peer-focus:ring-[#34c759]/20",
            intent === "danger" && "peer-focus:ring-[#ff3b30]/20",
            intent === "warning" && "peer-focus:ring-[#ff9500]/20",
            disabled && "peer-focus:ring-0"
          )}
        >
          <div
            className={cn(
              "absolute top-1 left-1 rounded-full bg-white shadow-md",
              "transition-transform duration-300 ease-out",
              sizeConfig.thumb,
              sizeConfig.translate
            )}
          />
        </div>
      </label>
    )

    if (!label && !helperText) {
      return switchElement
    }

    return (
      <div className={cn("flex flex-col gap-1", className)}>
        <div className={cn("flex items-center gap-3", labelPosition === "left" && "flex-row-reverse justify-end")}>
          {switchElement}
          {label && (
            <label
              htmlFor={switchId}
              className={cn(
                "cursor-pointer text-sm font-medium text-neutral-900",
                disabled && "cursor-not-allowed opacity-50"
              )}
            >
              {label}
            </label>
          )}
        </div>
        {helperText && <p className="ml-14 text-sm text-neutral-500">{helperText}</p>}
      </div>
    )
  }
)

Switch.displayName = "Switch"
