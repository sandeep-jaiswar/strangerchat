"use client"

import { cva, type VariantProps } from "class-variance-authority"
import React from "react"
import { Badge } from "components/Badge/Badge"
import { cn } from "utils/cn"

/**
 * Sidebar Component
 * 
 * An Apple-inspired sidebar navigation with elegant design and smooth interactions.
 * Features collapsible sections, active states, badges, and multiple variants.
 * 
 * @example
 * ```tsx
 * <Sidebar 
 *   items={[
 *     { id: 'chats', label: 'Chats', icon: <ChatIcon />, onClick: () => {} }
 *   ]}
 *   activeItemId="chats"
 * />
 * ```
 */

const sidebarVariants = cva(
  ["transition-all duration-300 ease-out", "border-r"],
  {
    variants: {
      variant: {
        default: [
          "bg-neutral-50 border-neutral-200",
          "dark:bg-neutral-900 dark:border-neutral-800",
        ],
        translucent: [
          "bg-white/80 backdrop-blur-xl border-neutral-200/60",
          "dark:bg-neutral-900/80 dark:border-neutral-800/60",
        ],
        solid: [
          "bg-white border-neutral-200",
          "dark:bg-neutral-900 dark:border-neutral-800",
        ],
        elevated: [
          "bg-white border-neutral-200 shadow-sm",
          "dark:bg-neutral-900 dark:border-neutral-800",
        ],
      },
      size: {
        sm: "w-52",
        md: "w-64",
        lg: "w-72",
        xl: "w-80",
      },
      collapsed: {
        true: "w-16",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      collapsed: false,
    },
  }
)

const itemVariants = cva(
  [
    "group flex items-center gap-3 px-3 py-2.5 rounded-xl",
    "cursor-pointer select-none",
    "transition-all duration-200 ease-out",
    "focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:ring-offset-2",
  ],
  {
    variants: {
      active: {
        true: [
          "bg-[#0071e3] text-white",
          "hover:bg-[#0077ed]",
          "active:bg-[#005bb5]",
        ],
        false: [
          "text-neutral-700 hover:bg-neutral-100",
          "active:bg-neutral-200",
          "dark:text-neutral-300 dark:hover:bg-neutral-800",
          "dark:active:bg-neutral-700",
        ],
      },
      disabled: {
        true: "opacity-50 cursor-not-allowed",
        false: "",
      },
    },
    defaultVariants: {
      active: false,
      disabled: false,
    },
  }
)

export interface SidebarItem {
  /** Unique identifier */
  id: string
  /** Display label */
  label: string
  /** Optional icon */
  icon?: React.ReactNode
  /** Click handler */
  onClick: () => void
  /** Badge content (number or text) */
  badge?: string | number
  /** Disabled state */
  disabled?: boolean
  /** Show divider after this item */
  divider?: boolean
}

export interface SidebarSection {
  /** Section title */
  title?: string
  /** Items in this section */
  items: SidebarItem[]
  /** Collapsible section */
  collapsible?: boolean
  /** Initially collapsed */
  defaultCollapsed?: boolean
}

export interface SidebarProps extends VariantProps<typeof sidebarVariants> {
  /** Navigation items (simple array) */
  items?: SidebarItem[]
  /** Sections with items (grouped navigation) */
  sections?: SidebarSection[]
  /** Currently active item ID */
  activeItemId?: string
  /** Header content (logo, title, etc.) */
  header?: React.ReactNode
  /** Footer content (user profile, settings, etc.) */
  footer?: React.ReactNode
  /** Collapsed state */
  collapsed?: boolean
  /** Toggle collapsed state */
  onToggleCollapse?: () => void
  /** Show collapse button */
  showCollapseButton?: boolean
  /** Custom className */
  className?: string
  /** Custom nav className */
  navClassName?: string
}

export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  (
    {
      items,
      sections,
      activeItemId,
      header,
      footer,
      collapsed = false,
      onToggleCollapse,
      showCollapseButton = false,
      variant = "default",
      size = "md",
      className,
      navClassName,
      ...props
    },
    ref
  ) => {
    const [collapsedSections, setCollapsedSections] = React.useState<Set<number>>(
      new Set(
        sections
          ?.map((section, index) => (section.defaultCollapsed ? index : null))
          .filter((i) => i !== null) as number[]
      )
    )

    const toggleSection = (index: number) => {
      setCollapsedSections((prev) => {
        const next = new Set(prev)
        if (next.has(index)) {
          next.delete(index)
        } else {
          next.add(index)
        }
        return next
      })
    }

    const renderItem = (item: SidebarItem) => {
      const isActive = activeItemId === item.id

      return (
        <li key={item.id}>
          <button
            onClick={item.onClick}
            disabled={item.disabled}
            className={cn(itemVariants({ active: isActive, disabled: item.disabled }), "w-full")}
            aria-current={isActive ? "page" : undefined}
          >
            {/* Icon */}
            {item.icon && (
              <span
                className={cn(
                  "shrink-0 transition-colors",
                  isActive
                    ? "text-white"
                    : "text-neutral-500 group-hover:text-neutral-700 dark:text-neutral-400 dark:group-hover:text-neutral-200",
                  collapsed && "mx-auto"
                )}
              >
                {item.icon}
              </span>
            )}

            {/* Label */}
            {!collapsed && (
              <span className="flex-1 truncate text-left text-[15px] font-medium">
                {item.label}
              </span>
            )}

            {/* Badge */}
            {!collapsed && item.badge !== undefined && (
              <Badge
                variant={isActive ? "filled" : "soft"}
                intent={isActive ? "primary" : "secondary"}
                size="sm"
                className={cn(isActive && "bg-white/20 text-white hover:bg-white/30")}
              >
                {item.badge}
              </Badge>
            )}
          </button>

          {/* Divider */}
          {item.divider && (
            <hr className="my-2 border-neutral-200 dark:border-neutral-700" />
          )}
        </li>
      )
    }

    const renderSection = (section: SidebarSection, index: number) => {
      const isCollapsed = collapsedSections.has(index)

      return (
        <div key={index} className="space-y-1">
          {/* Section Header */}
          {section.title && !collapsed && (
            <div className="px-3 py-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {section.title}
              </h3>
              {section.collapsible && (
                <button
                  onClick={() => toggleSection(index)}
                  className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                  aria-label={isCollapsed ? "Expand section" : "Collapse section"}
                >
                  <svg
                    className={cn(
                      "w-4 h-4 text-neutral-500 transition-transform",
                      isCollapsed && "-rotate-90"
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Section Items */}
          {!isCollapsed && <ul className="space-y-1">{section.items.map(renderItem)}</ul>}
        </div>
      )
    }

    return (
      <aside
        ref={ref}
        className={cn(
          sidebarVariants({ variant, size, collapsed }),
          "flex flex-col h-full",
          className
        )}
        {...props}
      >
        {/* Header */}
        {header && (
          <div
            className={cn(
              "px-4 py-4 border-b border-neutral-200 dark:border-neutral-800",
              collapsed && "px-2"
            )}
          >
            {header}
          </div>
        )}

        {/* Navigation */}
        <nav className={cn("flex-1 overflow-y-auto p-3", navClassName)}>
          {/* Simple items list */}
          {items && <ul className="space-y-1">{items.map(renderItem)}</ul>}

          {/* Sections */}
          {sections && <div className="space-y-6">{sections.map(renderSection)}</div>}
        </nav>

        {/* Footer */}
        {footer && (
          <div
            className={cn(
              "px-4 py-4 border-t border-neutral-200 dark:border-neutral-800",
              collapsed && "px-2"
            )}
          >
            {footer}
          </div>
        )}

        {/* Collapse Toggle Button */}
        {showCollapseButton && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className={cn(
              "absolute -right-3 top-20 z-10",
              "w-6 h-6 rounded-full",
              "bg-white dark:bg-neutral-800",
              "border-2 border-neutral-200 dark:border-neutral-700",
              "hover:border-[#0071e3] dark:hover:border-[#0071e3]",
              "flex items-center justify-center",
              "transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:ring-offset-2"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              className={cn(
                "w-3 h-3 text-neutral-600 dark:text-neutral-400 transition-transform",
                collapsed && "rotate-180"
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}
      </aside>
    )
  }
)

Sidebar.displayName = "Sidebar"
