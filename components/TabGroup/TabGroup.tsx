"use client"

/**
 * TabGroup Component - Apple-inspired Design
 * 
 * A fully customizable, accessible tab component following Apple's design principles.
 * 
 * Features:
 * - 7 variants: default, pills, underline, enclosed, solid, buttons, minimal
 * - 3 sizes: sm, md, lg
 * - Smooth animated indicator with spring physics
 * - Keyboard navigation (Arrow keys, Home, End)
 * - Full accessibility support (ARIA attributes, focus management)
 * - Controlled and uncontrolled modes
 * - Icons and badges support
 * - Disabled tabs
 * - Full width option
 * - Apple-style colors and transitions
 * - Dark mode support
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <TabGroup tabs={[
 *   { value: "tab1", label: "Tab 1" },
 *   { value: "tab2", label: "Tab 2" },
 * ]} />
 * 
 * // With content panels
 * const [activeTab, setActiveTab] = useState("tab1")
 * <TabGroup tabs={tabs} value={activeTab} onValueChange={setActiveTab} />
 * <TabPanel value="tab1" activeValue={activeTab}>Content 1</TabPanel>
 * <TabPanel value="tab2" activeValue={activeTab}>Content 2</TabPanel>
 * 
 * // Different variants
 * <TabGroup tabs={tabs} variant="pills" />
 * <TabGroup tabs={tabs} variant="enclosed" fullWidth />
 * <TabGroup tabs={tabs} variant="buttons" size="lg" />
 * ```
 */

import { cva, type VariantProps } from "class-variance-authority"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { cn } from "utils/cn"

const tabList = cva(["inline-flex", "items-center", "relative", "transition-all", "duration-300"], {
  variants: {
    variant: {
      default: ["border-b", "border-neutral-200", "dark:border-neutral-800", "gap-1"],
      pills: ["bg-neutral-100", "dark:bg-neutral-800", "rounded-xl", "p-1", "gap-1"],
      underline: ["gap-1"],
      enclosed: ["border", "border-neutral-200", "dark:border-neutral-800", "rounded-xl", "divide-x", "divide-neutral-200", "dark:divide-neutral-800"],
      solid: ["bg-neutral-100", "dark:bg-neutral-800", "rounded-xl", "p-1", "gap-1"],
      buttons: ["gap-2"],
      minimal: ["gap-4"],
    },
    fullWidth: {
      true: ["w-full"],
      false: [],
    },
    size: {
      sm: [],
      md: [],
      lg: [],
    },
  },
  defaultVariants: {
    variant: "default",
    fullWidth: false,
    size: "md",
  },
})

const tabTrigger = cva(
  [
    "inline-flex",
    "items-center",
    "justify-center",
    "gap-2",
    "font-medium",
    "transition-all",
    "duration-200",
    "ease-out",
    "focus:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-[#0071e3]",
    "focus-visible:ring-offset-2",
    "disabled:pointer-events-none",
    "disabled:opacity-40",
    "cursor-pointer",
    "relative",
    "whitespace-nowrap",
  ],
  {
    variants: {
      variant: {
        default: [
          "text-neutral-600",
          "dark:text-neutral-400",
          "border-b-2",
          "border-transparent",
          "-mb-0.5",
          "hover:text-neutral-900",
          "dark:hover:text-neutral-200",
          "hover:border-neutral-300",
          "dark:hover:border-neutral-700",
        ],
        pills: [
          "text-neutral-600",
          "dark:text-neutral-400",
          "rounded-lg",
          "hover:text-neutral-900",
          "dark:hover:text-neutral-200",
          "hover:bg-neutral-50",
          "dark:hover:bg-neutral-700/50",
        ],
        underline: [
          "text-neutral-600",
          "dark:text-neutral-400",
          "hover:text-neutral-900",
          "dark:hover:text-neutral-200",
        ],
        enclosed: [
          "text-neutral-600",
          "dark:text-neutral-400",
          "hover:bg-neutral-50",
          "dark:hover:bg-neutral-700/50",
          "flex-1",
        ],
        solid: [
          "text-neutral-600",
          "dark:text-neutral-400",
          "rounded-lg",
          "hover:text-neutral-900",
          "dark:hover:text-neutral-200",
        ],
        buttons: [
          "text-neutral-600",
          "dark:text-neutral-400",
          "border",
          "border-neutral-200",
          "dark:border-neutral-700",
          "rounded-xl",
          "hover:bg-neutral-50",
          "dark:hover:bg-neutral-800",
          "hover:border-neutral-300",
          "dark:hover:border-neutral-600",
        ],
        minimal: [
          "text-neutral-500",
          "dark:text-neutral-500",
          "hover:text-neutral-900",
          "dark:hover:text-neutral-200",
        ],
      },
      size: {
        sm: ["text-sm", "px-3", "py-1.5", "min-h-8"],
        md: ["text-[15px]", "px-4", "py-2", "min-h-10"],
        lg: ["text-base", "px-5", "py-2.5", "min-h-11"],
      },
      active: {
        true: [],
        false: [],
      },
      fullWidth: {
        true: ["flex-1"],
        false: [],
      },
    },
    compoundVariants: [
      {
        variant: "default",
        active: true,
        className: ["border-[#0071e3]", "text-[#0071e3]", "dark:text-[#0a84ff]", "font-semibold"],
      },
      {
        variant: "pills",
        active: true,
        className: ["bg-white", "dark:bg-neutral-700", "text-neutral-900", "dark:text-white", "shadow-sm", "font-semibold"],
      },
      {
        variant: "underline",
        active: true,
        className: ["text-[#0071e3]", "dark:text-[#0a84ff]", "font-semibold"],
      },
      {
        variant: "enclosed",
        active: true,
        className: ["bg-[#0071e3]/10", "dark:bg-[#0a84ff]/20", "text-[#0071e3]", "dark:text-[#0a84ff]", "font-semibold"],
      },
      {
        variant: "solid",
        active: true,
        className: ["bg-white", "dark:bg-neutral-700", "text-neutral-900", "dark:text-white", "shadow-sm", "font-semibold"],
      },
      {
        variant: "buttons",
        active: true,
        className: ["bg-[#0071e3]", "dark:bg-[#0a84ff]", "border-[#0071e3]", "dark:border-[#0a84ff]", "text-white", "font-semibold", "shadow-sm"],
      },
      {
        variant: "minimal",
        active: true,
        className: ["text-[#0071e3]", "dark:text-[#0a84ff]", "font-semibold"],
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "md",
      active: false,
      fullWidth: false,
    },
  }
)

const tabIndicator = cva(["absolute", "transition-all", "duration-300", "ease-out"], {
  variants: {
    variant: {
      default: ["bottom-0", "h-0.5", "bg-[#0071e3]", "dark:bg-[#0a84ff]", "rounded-full"],
      pills: ["rounded-lg", "bg-white", "dark:bg-neutral-700", "shadow-sm"],
      underline: ["bottom-0", "h-0.5", "bg-[#0071e3]", "dark:bg-[#0a84ff]", "rounded-full"],
      enclosed: ["bg-[#0071e3]/10", "dark:bg-[#0a84ff]/20", "rounded-lg"],
      solid: ["rounded-lg", "bg-white", "dark:bg-neutral-700", "shadow-sm"],
      buttons: ["rounded-xl", "bg-[#0071e3]", "dark:bg-[#0a84ff]"],
      minimal: ["bottom-0", "h-0.5", "bg-[#0071e3]", "dark:bg-[#0a84ff]", "rounded-full"],
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

export interface Tab {
  value: string
  label: string
  icon?: React.ReactNode
  badge?: string | number
  disabled?: boolean
}

export interface TabGroupProps extends VariantProps<typeof tabList> {
  tabs: Tab[]
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  animated?: boolean
  colorScheme?: "primary" | "success" | "error" | "warning" | "info"
}

export function TabGroup({ 
  tabs, 
  defaultValue, 
  value, 
  onValueChange, 
  variant = "default", 
  size = "md",
  fullWidth = false,
  className,
  animated = true,
}: TabGroupProps) {
  const [activeTab, setActiveTab] = useState<string>(value || defaultValue || tabs[0]?.value || "")
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number; height?: number }>({ 
    left: 0, 
    width: 0,
    height: 0,
  })
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({})
  const listRef = useRef<HTMLDivElement>(null)

  // Controlled component support
  const currentTab = value !== undefined ? value : activeTab

  useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value)
    }
  }, [value])

  const handleTabChange = useCallback((newValue: string) => {
    const tab = tabs.find(t => t.value === newValue)
    if (tab?.disabled) return

    if (value === undefined) {
      setActiveTab(newValue)
    }
    onValueChange?.(newValue)
  }, [tabs, value, onValueChange])

  // Update indicator position
  useEffect(() => {
    const activeRef = tabRefs.current[currentTab]
    const listElement = listRef.current

    if (activeRef && listElement && animated) {
      const listRect = listElement.getBoundingClientRect()
      const tabRect = activeRef.getBoundingClientRect()
      
      setIndicatorStyle({
        left: tabRect.left - listRect.left,
        width: tabRect.width,
        height: tabRect.height,
      })
    }
  }, [currentTab, tabs, animated])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent, _currentIndex: number) => {
    const enabledTabs = tabs.filter(tab => !tab.disabled)
    const currentEnabledIndex = enabledTabs.findIndex(tab => tab.value === currentTab)
    
    let nextIndex = currentEnabledIndex

    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault()
        nextIndex = currentEnabledIndex > 0 ? currentEnabledIndex - 1 : enabledTabs.length - 1
        break
      case "ArrowRight":
        e.preventDefault()
        nextIndex = currentEnabledIndex < enabledTabs.length - 1 ? currentEnabledIndex + 1 : 0
        break
      case "Home":
        e.preventDefault()
        nextIndex = 0
        break
      case "End":
        e.preventDefault()
        nextIndex = enabledTabs.length - 1
        break
      default:
        return
    }

    const nextTab = enabledTabs[nextIndex]
    if (nextTab) {
      handleTabChange(nextTab.value)
      tabRefs.current[nextTab.value]?.focus()
    }
  }, [tabs, currentTab, handleTabChange])

  const showIndicator = useMemo(() => {
    return animated && (variant === "default" || variant === "pills" || variant === "underline" || variant === "solid" || variant === "minimal")
  }, [animated, variant])

  return (
    <div 
      ref={listRef}
      className={cn(tabList({ variant, fullWidth, size }), className)}
      role="tablist"
      aria-orientation="horizontal"
    >
      {/* Animated indicator */}
      {showIndicator && indicatorStyle.width > 0 && (
        <div
          className={cn(tabIndicator({ variant }), "pointer-events-none")}
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
            height: variant === "pills" || variant === "solid" ? `${indicatorStyle.height}px` : undefined,
          }}
          aria-hidden="true"
        />
      )}

      {tabs.map((tab, index) => {
        const isActive = currentTab === tab.value
        
        return (
          <button
            key={tab.value}
            ref={(el) => {
              tabRefs.current[tab.value] = el
            }}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.value}`}
            aria-disabled={tab.disabled}
            tabIndex={isActive ? 0 : -1}
            disabled={tab.disabled}
            onClick={() => handleTabChange(tab.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              tabTrigger({ 
                variant, 
                size, 
                active: isActive,
                fullWidth,
              })
            )}
          >
            {tab.icon && (
              <span className="shrink-0" aria-hidden="true">
                {tab.icon}
              </span>
            )}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span 
                className={cn(
                  "ml-1 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold transition-colors",
                  isActive 
                    ? "bg-[#0071e3]/20 text-[#0071e3] dark:bg-[#0a84ff]/30 dark:text-[#0a84ff]" 
                    : "bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300"
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// Tab Panel component for content
export interface TabPanelProps {
  value: string
  activeValue: string
  children: React.ReactNode
  className?: string
}

export function TabPanel({ value, activeValue, children, className }: TabPanelProps) {
  const isActive = value === activeValue

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${value}`}
      aria-labelledby={`tab-${value}`}
      hidden={!isActive}
      className={cn(
        "focus:outline-none",
        !isActive && "hidden",
        className
      )}
      tabIndex={0}
    >
      {children}
    </div>
  )
}
