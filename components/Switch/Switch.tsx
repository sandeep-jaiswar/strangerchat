"use client"

import * as RadixSwitch from "@radix-ui/react-switch"
import { cva, type VariantProps } from "class-variance-authority"
import React from "react"
import { cn } from "utils/cn"

const switchRoot = cva(
  [
    "relative",
    "inline-flex",
    "shrink-0",
    "cursor-pointer",
    "rounded-full",
    "transition-colors",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-primary",
    "focus:ring-offset-2",
    "disabled:cursor-not-allowed",
    "disabled:opacity-50",
    "data-[state=unchecked]:bg-neutral-200",
  ],
  {
    variants: {
      intent: {
        primary: ["data-[state=checked]:bg-primary"],
        success: ["data-[state=checked]:bg-success"],
        error: ["data-[state=checked]:bg-error"],
      },
      size: {
        sm: ["h-5", "w-9"],
        md: ["h-6", "w-11"],
        lg: ["h-7", "w-14"],
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "md",
    },
  }
)

const switchThumb = cva(["block", "rounded-full", "bg-white", "shadow-md", "transition-transform"], {
  variants: {
    size: {
      sm: ["h-4", "w-4", "data-[state=checked]:translate-x-4", "data-[state=unchecked]:translate-x-0.5"],
      md: ["h-5", "w-5", "data-[state=checked]:translate-x-5", "data-[state=unchecked]:translate-x-0.5"],
      lg: ["h-6", "w-6", "data-[state=checked]:translate-x-7", "data-[state=unchecked]:translate-x-0.5"],
    },
  },
  defaultVariants: {
    size: "md",
  },
})

export interface SwitchProps extends Omit<RadixSwitch.SwitchProps, "size">, VariantProps<typeof switchRoot> {
  label?: string
}

export function Switch({ className, intent, size, label, id, ...props }: SwitchProps) {
  const switchId = id || (label ? `switch-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined)

  return (
    <div className="flex items-center gap-2">
      <RadixSwitch.Root id={switchId} className={cn(switchRoot({ intent, size, className }))} {...props}>
        <RadixSwitch.Thumb className={cn(switchThumb({ size }))} />
      </RadixSwitch.Root>
      {label && (
        <label htmlFor={switchId} className="cursor-pointer text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
    </div>
  )
}
