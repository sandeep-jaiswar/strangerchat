"use client"

import React from "react"
import { cn } from "utils/cn"

/**
 * Modal Component - Apple-inspired Design
 *
 * Following Apple's Human Interface Guidelines:
 * - iOS sheet-style presentation (slides up from bottom)
 * - Smooth spring animations with backdrop blur
 * - Focus management and keyboard navigation
 * - Lightweight implementation (no external dependencies)
 *
 * Features:
 * - iOS-style entrance/exit animations
 * - Optional backdrop dismiss
 * - Header, content, and footer sections
 * - Keyboard shortcuts (Escape to close)
 * - Focus trap within modal
 * - Body scroll lock
 */

export interface ModalProps {
  /** Modal open state */
  open: boolean

  /** Modal title */
  title?: string

  /** Modal description */
  description?: string

  /** Modal content */
  children: React.ReactNode

  /** Footer content (typically actions/buttons) */
  footer?: React.ReactNode

  /** Modal size */
  size?: "sm" | "md" | "lg" | "full"

  /** Show close button */
  showCloseButton?: boolean

  /** Close on backdrop click */
  closeOnBackdropClick?: boolean

  /** Custom class for body */
  bodyClassName?: string

  /** Callback when modal closes */
  onClose?: () => void

  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void
}

const modalSizes = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  full: "max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]",
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "md",
  showCloseButton = true,
  closeOnBackdropClick = true,
  bodyClassName,
}) => {
  const modalRef = React.useRef<HTMLDivElement>(null)

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange?.(false)
      }
    }

    if (open) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [open, onOpenChange])

  // Focus trap
  React.useEffect(() => {
    if (open && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
      )
      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== "Tab") return

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement?.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement?.focus()
          }
        }
      }

      document.addEventListener("keydown", handleTab)
      firstElement?.focus()

      return () => {
        document.removeEventListener("keydown", handleTab)
      }
    }
  }, [open])

  if (!open) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onOpenChange?.(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[1300] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      aria-describedby={description ? "modal-description" : undefined}
    >
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/40 backdrop-blur-sm",
          "transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        data-testid="modal-content"
        className={cn(
          "relative w-full rounded-3xl bg-white shadow-2xl",
          "transform transition-all duration-300",
          "flex max-h-[90vh] flex-col",
          modalSizes[size],
          open ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"
        )}
      >
        {/* Header */}
        {(title || description || showCloseButton) && (
          <div className="flex items-start justify-between border-b border-neutral-200 p-6">
            <div className="flex-1">
              {title && (
                <h2 id="modal-title" className="text-xl font-semibold text-neutral-900">
                  {title}
                </h2>
              )}
              {description && (
                <p id="modal-description" className="mt-1 text-sm text-neutral-600">
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                onClick={() => onOpenChange?.(false)}
                className={cn(
                  "ml-4 h-8 w-8 shrink-0 rounded-full",
                  "flex items-center justify-center",
                  "text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600",
                  "transition-colors duration-200",
                  "focus:ring-2 focus:ring-[#0071e3] focus:ring-offset-2 focus:outline-none"
                )}
                aria-label="Close modal"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className={cn("flex-1 overflow-y-auto p-6", bodyClassName)}>{children}</div>

        {/* Footer */}
        {footer && <div className="flex items-center justify-end gap-3 border-t border-neutral-200 p-6">{footer}</div>}
      </div>
    </div>
  )
}

Modal.displayName = "Modal"
