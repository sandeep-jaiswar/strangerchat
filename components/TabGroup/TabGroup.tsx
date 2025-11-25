"use client"

import * as RadixTabs from "@radix-ui/react-tabs"
import { cva, type VariantProps } from "class-variance-authority"
import React from "react"
import { cn } from "utils/cn"

const tabList = cva(["inline-flex", "items-center", "gap-1"], {
  variants: {
    variant: {
      default: ["border-b", "border-neutral-200"],
      pills: ["bg-neutral-100", "rounded-lg", "p-1"],
      underline: [],
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

const tabTrigger = cva(
  [
    "inline-flex",
    "items-center",
    "justify-center",
    "gap-2",
    "font-medium",
    "transition-colors",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-primary",
    "disabled:pointer-events-none",
    "disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        default: [
          "px-4",
          "py-2",
          "text-sm",
          "text-neutral-500",
          "border-b-2",
          "border-transparent",
          "data-[state=active]:border-primary",
          "data-[state=active]:text-primary",
          "hover:text-neutral-700",
        ],
        pills: [
          "px-3",
          "py-1.5",
          "text-sm",
          "text-neutral-600",
          "rounded-md",
          "data-[state=active]:bg-white",
          "data-[state=active]:text-neutral-900",
          "data-[state=active]:shadow-sm",
          "hover:text-neutral-900",
        ],
        underline: [
          "px-4",
          "py-2",
          "text-sm",
          "text-neutral-500",
          "data-[state=active]:text-primary",
          "hover:text-neutral-700",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface Tab {
  value: string
  label: string
  icon?: React.ReactNode
  disabled?: boolean
}

export interface TabGroupProps extends VariantProps<typeof tabList> {
  tabs: Tab[]
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}

export function TabGroup({ tabs, defaultValue, value, onValueChange, variant, className }: TabGroupProps) {
  return (
    <RadixTabs.Root defaultValue={defaultValue || tabs[0]?.value} value={value} onValueChange={onValueChange}>
      <RadixTabs.List className={cn(tabList({ variant, className }))}>
        {tabs.map((tab) => (
          <RadixTabs.Trigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
            className={cn(tabTrigger({ variant }))}
          >
            {tab.icon}
            {tab.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
    </RadixTabs.Root>
  )
}
