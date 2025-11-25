"use client"

import * as RadixSelect from "@radix-ui/react-select"
import { cva, type VariantProps } from "class-variance-authority"
import React from "react"
import { cn } from "utils/cn"

const selectTrigger = cva(
  [
    "inline-flex",
    "items-center",
    "justify-between",
    "gap-2",
    "rounded-md",
    "border",
    "border-neutral-300",
    "bg-white",
    "text-neutral-900",
    "transition-colors",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-primary",
    "focus:border-primary",
    "disabled:cursor-not-allowed",
    "disabled:opacity-50",
    "data-[placeholder]:text-neutral-400",
  ],
  {
    variants: {
      size: {
        sm: ["h-8", "px-2", "text-sm"],
        md: ["h-10", "px-3", "text-base"],
        lg: ["h-12", "px-4", "text-lg"],
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends VariantProps<typeof selectTrigger> {
  options: SelectOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  label?: string
  className?: string
  id?: string
}

export function Select({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Select an option",
  disabled,
  label,
  size,
  className,
  id,
}: SelectProps) {
  const selectId = id || (label ? `select-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined)

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <RadixSelect.Root value={value} defaultValue={defaultValue} onValueChange={onValueChange} disabled={disabled}>
        <RadixSelect.Trigger id={selectId} className={cn(selectTrigger({ size, className }))}>
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content
            className="z-dropdown overflow-hidden rounded-md border border-neutral-200 bg-white shadow-lg"
            position="popper"
            sideOffset={4}
          >
            <RadixSelect.Viewport className="p-1">
              {options.map((option) => (
                <RadixSelect.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-md px-3 py-2 text-sm text-neutral-900",
                    "outline-none transition-colors",
                    "data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground",
                    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  )}
                >
                  <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                  <RadixSelect.ItemIndicator className="absolute right-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </RadixSelect.ItemIndicator>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
    </div>
  )
}
