"use client"

import { cva, type VariantProps } from "class-variance-authority"
import React from "react"
import { IconButton } from "components/IconButton/IconButton"
import { cn } from "utils/cn"

/**
 * Header Component
 * 
 * An Apple-inspired header component with multiple variants for different contexts.
 * Features smooth blur effects, elegant animations, and proper accessibility.
 * 
 * @example
 * ```tsx
 * <Header 
 *   title="Messages" 
 *   subtitle="3 active conversations"
 *   actions={<Button>New Chat</Button>}
 * />
 * ```
 */

const headerVariants = cva(
  [
    "w-full transition-all duration-300 ease-out",
    "border-b backdrop-blur-xl",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-white/80 border-neutral-200/60",
          "dark:bg-neutral-900/80 dark:border-neutral-800/60",
        ],
        translucent: [
          "bg-white/70 border-neutral-200/40",
          "dark:bg-neutral-900/70 dark:border-neutral-800/40",
          "backdrop-blur-2xl",
        ],
        solid: [
          "bg-white border-neutral-200",
          "dark:bg-neutral-900 dark:border-neutral-800",
        ],
        elevated: [
          "bg-white border-neutral-200/60 shadow-sm",
          "dark:bg-neutral-900 dark:border-neutral-800/60",
        ],
      },
      size: {
        sm: "h-12",
        md: "h-14",
        lg: "h-16",
        xl: "h-20",
      },
      sticky: {
        true: "sticky top-0 z-1100",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "lg",
      sticky: false,
    },
  }
)

const titleVariants = cva("truncate font-semibold", {
  variants: {
    size: {
      sm: "text-base",
      md: "text-lg",
      lg: "text-xl",
      xl: "text-2xl",
    },
  },
  defaultVariants: {
    size: "lg",
  },
})

const subtitleVariants = cva("truncate text-neutral-600 dark:text-neutral-400", {
  variants: {
    size: {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-[15px]",
      xl: "text-base",
    },
  },
  defaultVariants: {
    size: "lg",
  },
})

export interface HeaderProps extends VariantProps<typeof headerVariants> {
  /** Main title text */
  title: string
  /** Optional subtitle or description */
  subtitle?: string
  /** Action buttons or elements on the right */
  actions?: React.ReactNode
  /** Content on the left (e.g., back button, logo) */
  leftContent?: React.ReactNode
  /** Back button handler */
  onBack?: () => void
  /** Search button handler */
  onSearch?: () => void
  /** Menu button handler (for mobile) */
  onMenu?: () => void
  /** Show badge on title */
  badge?: string | number
  /** Show loading state */
  loading?: boolean
  /** Center align title */
  centered?: boolean
  /** Maximum width container */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
  /** Custom className */
  className?: string
  /** Custom title className */
  titleClassName?: string
  /** Custom subtitle className */
  subtitleClassName?: string
}

export const Header = React.forwardRef<HTMLElement, HeaderProps>(
  (
    {
      title,
      subtitle,
      actions,
      leftContent,
      onBack,
      onSearch,
      onMenu,
      badge,
      loading = false,
      centered = false,
      variant = "default",
      size = "lg",
      sticky = false,
      maxWidth = "full",
      className,
      titleClassName,
      subtitleClassName,
      ...props
    },
    ref
  ) => {
    const maxWidthClasses = {
      sm: "max-w-3xl",
      md: "max-w-5xl",
      lg: "max-w-7xl",
      xl: "max-w-[1440px]",
      "2xl": "max-w-[1680px]",
      full: "max-w-full",
    }

    const hasLeftActions = Boolean(onBack || onMenu || leftContent)
    const hasRightActions = Boolean(onSearch || actions)

    return (
      <header
        ref={ref}
        className={cn(headerVariants({ variant, size, sticky }), className)}
        {...props}
      >
        <div className={cn("mx-auto px-4 sm:px-6 lg:px-8 h-full", maxWidthClasses[maxWidth])}>
          <div className="flex h-full items-center justify-between gap-4">
            {/* Left Section */}
            <div className="flex items-center gap-2 sm:gap-3">
              {onBack && (
                <IconButton
                  variant="plain"
                  size={size === "sm" ? "sm" : "md"}
                  onClick={onBack}
                  aria-label="Go back"
                  className="shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </IconButton>
              )}
              {onMenu && (
                <IconButton
                  variant="plain"
                  size={size === "sm" ? "sm" : "md"}
                  onClick={onMenu}
                  aria-label="Open menu"
                  className="shrink-0 sm:hidden"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </IconButton>
              )}
              {leftContent && <div className="shrink-0">{leftContent}</div>}
            </div>

            {/* Center Section */}
            <div
              className={cn(
                "min-w-0",
                centered ? "flex-1 text-center" : "flex-1",
                !hasLeftActions && "ml-0",
                !hasRightActions && "mr-0"
              )}
            >
              <div className={cn("space-y-0.5", centered && "mx-auto max-w-md")}>
                <div className="flex items-center gap-2">
                  <h1
                    className={cn(
                      titleVariants({ size }),
                      "text-neutral-900 dark:text-white",
                      centered && "justify-center",
                      loading && "opacity-50",
                      titleClassName
                    )}
                  >
                    {title}
                    {loading && (
                      <span className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-[#0071e3]" />
                    )}
                  </h1>
                  {badge !== undefined && (
                    <span
                      className={cn(
                        "inline-flex items-center justify-center rounded-full",
                        "bg-[#0071e3] text-white font-semibold",
                        size === "sm" && "h-4 min-w-4 px-1 text-[10px]",
                        size === "md" && "h-5 min-w-5 px-1.5 text-[11px]",
                        size === "lg" && "h-5 min-w-5 px-1.5 text-xs",
                        size === "xl" && "h-6 min-w-6 px-2 text-sm"
                      )}
                    >
                      {badge}
                    </span>
                  )}
                </div>
                {subtitle && (
                  <p
                    className={cn(
                      subtitleVariants({ size }),
                      centered && "justify-center",
                      subtitleClassName
                    )}
                  >
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 sm:gap-3">
              {onSearch && (
                <IconButton
                  variant="plain"
                  size={size === "sm" ? "sm" : "md"}
                  onClick={onSearch}
                  aria-label="Search"
                  className="shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </IconButton>
              )}
              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
          </div>
        </div>

        {/* Bottom border animation on scroll */}
        {sticky && variant === "translucent" && (
          <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-neutral-200 to-transparent dark:via-neutral-800 opacity-0 transition-opacity duration-300" />
        )}
      </header>
    )
  }
)

Header.displayName = "Header"
