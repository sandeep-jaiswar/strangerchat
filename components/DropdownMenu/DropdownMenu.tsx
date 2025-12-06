"use client"

import React from "react"
import { cn } from "utils/cn"

/**
 * DropdownMenu Component - Apple-inspired Design
 *
 * Following Apple's Human Interface Guidelines:
 * - Clarity: Clear menu structure and hierarchy
 * - Deference: Subtle and contextual
 * - Depth: Smooth animations and layering
 *
 * Features:
 * - Lightweight implementation (no dependencies)
 * - iOS-style dropdown menu
 * - Keyboard navigation
 * - Nested submenus
 * - Icons and shortcuts
 * - Dividers and sections
 * - Custom positioning
 */

export interface DropdownMenuItem {
  id: string
  label: string
  icon?: React.ReactNode
  shortcut?: string
  disabled?: boolean
  danger?: boolean
  submenu?: DropdownMenuItem[]
  onClick?: () => void
}

export interface DropdownMenuProps {
  /** Trigger element */
  trigger: React.ReactNode

  /** Menu items */
  items: (DropdownMenuItem | "divider")[]

  /** Position of the menu */
  position?: "bottom-start" | "bottom-end" | "top-start" | "top-end"

  /** Custom className */
  className?: string
}

const positionClasses = {
  "bottom-start": "top-full left-0 mt-2",
  "bottom-end": "top-full right-0 mt-2",
  "top-start": "bottom-full left-0 mb-2",
  "top-end": "bottom-full right-0 mb-2",
}

export const DropdownMenu = React.forwardRef<HTMLDivElement, DropdownMenuProps>(
  ({ trigger, items, position = "bottom-start", className, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const [openSubmenuId, setOpenSubmenuId] = React.useState<string | null>(null)
    const menuRef = React.useRef<HTMLDivElement>(null)

    // Close on outside click
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
          setIsOpen(false)
          setOpenSubmenuId(null)
        }
      }

      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // Close on escape
    React.useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setIsOpen(false)
          setOpenSubmenuId(null)
        }
      }

      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }, [])

    const handleItemClick = (item: DropdownMenuItem) => {
      if (item.disabled) return

      if (item.submenu) {
        setOpenSubmenuId(openSubmenuId === item.id ? null : item.id)
      } else {
        item.onClick?.()
        setIsOpen(false)
        setOpenSubmenuId(null)
      }
    }

    const renderMenuItem = (item: DropdownMenuItem, isSubmenu = false) => {
      const hasSubmenu = !!item.submenu
      const isSubmenuOpen = openSubmenuId === item.id

      return (
        <div key={item.id} className="relative">
          <button
            onClick={() => handleItemClick(item)}
            disabled={item.disabled}
            className={cn(
              "flex w-full items-center gap-3 px-3 py-2 text-sm transition-colors",
              "focus:outline-none",
              item.danger && "text-[#ff3b30]",
              !item.danger && "text-neutral-900",
              item.disabled && "cursor-not-allowed opacity-50",
              !item.disabled && !item.danger && "hover:bg-neutral-100",
              !item.disabled && item.danger && "hover:bg-[#ff3b30]/10"
            )}
          >
            {item.icon && (
              <span className="h-4 w-4 shrink-0" aria-hidden="true">
                {item.icon}
              </span>
            )}
            <span className="flex-1 text-left">{item.label}</span>
            {item.shortcut && <span className="text-xs font-medium text-neutral-400">{item.shortcut}</span>}
            {hasSubmenu && (
              <svg
                className={cn("h-4 w-4 text-neutral-400 transition-transform", isSubmenuOpen && "rotate-180")}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>

          {hasSubmenu && isSubmenuOpen && (
            <div
              className={cn(
                "absolute top-0 left-full ml-1 min-w-[12rem]",
                "rounded-xl border border-neutral-200 bg-white shadow-lg",
                "py-1"
              )}
            >
              {item.submenu!.map((subItem) => renderMenuItem(subItem, true))}
            </div>
          )}
        </div>
      )
    }

    return (
      <div ref={menuRef} className={cn("relative inline-block", className)} {...props}>
        {/* Trigger */}
        <div
          ref={ref}
          role="button"
          aria-haspopup="true"
          aria-expanded={isOpen}
          tabIndex={0}
          className={typeof trigger === "string" ? cn(trigger) : undefined}
          onClick={() => setIsOpen(!isOpen)}
        >
          {trigger}
        </div>

        {/* Menu */}
        {isOpen && (
          <div
            className={cn(
              "absolute z-[1400] min-w-[12rem]",
              "rounded-xl border border-neutral-200 bg-white shadow-lg",
              "py-1",
              positionClasses[position]
            )}
            role="menu"
          >
            {items.map((item, index) => {
              if (item === "divider") {
                return <div key={`divider-${index}`} className="my-1 h-px bg-neutral-200" role="separator" />
              }
              return renderMenuItem(item)
            })}
          </div>
        )}
      </div>
    )
  }
)

DropdownMenu.displayName = "DropdownMenu"
