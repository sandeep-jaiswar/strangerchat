"use client"

import React from "react"
import { cn } from "utils/cn"

/**
 * Toast Component - Apple-inspired Design
 *
 * Following Apple's Human Interface Guidelines:
 * - Clarity: Clear, concise feedback messages
 * - Deference: Non-intrusive, auto-dismissing notifications
 * - Depth: Smooth slide-in animations with backdrop blur
 *
 * Features:
 * - Lightweight implementation (no external dependencies)
 * - iOS-style toast with rounded corners
 * - Auto-dismiss with configurable duration
 * - Multiple intent colors for different message types
 * - Icon support for visual context
 * - Smooth slide-in/out animations
 * - Swipe to dismiss (touch-friendly)
 */

export interface ToastProps {
  /** Toast message */
  message: string

  /** Optional description */
  description?: string

  /** Intent color */
  intent?: "primary" | "success" | "warning" | "error" | "info"

  /** Icon element */
  icon?: React.ReactNode | null

  /** Show close button */
  showCloseButton?: boolean

  /** Auto-hide duration in milliseconds (0 = no auto-hide) */
  duration?: number

  /** Callback when toast is dismissed */
  onClose: () => void
}

/**
 * ToastContainer - Container for managing multiple toasts
 */
export interface ToastContainerProps {
  /** Position of toast container */
  position?: "top-left" | "top-right" | "top-center" | "bottom-left" | "bottom-right" | "bottom-center"

  /** Children toasts */
  children: React.ReactNode
}

const toastIntents = {
  primary: {
    bg: "bg-neutral-900",
    text: "text-white",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
    ),
  },
  success: {
    bg: "bg-[#34c759]",
    text: "text-white",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  warning: {
    bg: "bg-[#ff9500]",
    text: "text-white",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  error: {
    bg: "bg-[#ff3b30]",
    text: "text-white",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
  info: {
    bg: "bg-[#007aff]",
    text: "text-white",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  },
}

const containerPositions = {
  "top-left": "top-4 left-4",
  "top-right": "top-4 right-4",
  "top-center": "top-4 left-1/2 -translate-x-1/2",
  "bottom-left": "bottom-4 left-4",
  "bottom-right": "bottom-4 right-4",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
}

export const Toast: React.FC<ToastProps> = ({
  message,
  description,
  intent = "primary",
  icon,
  showCloseButton = true,
  duration = 5000,
  onClose,
}) => {
  const [isExiting, setIsExiting] = React.useState(false)
  const [progress, setProgress] = React.useState(100)
  const config = toastIntents[intent]
  const displayIcon = icon === null ? null : icon || config.icon

  React.useEffect(() => {
    if (duration > 0) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - 100 / (duration / 50)
          return newProgress <= 0 ? 0 : newProgress
        })
      }, 50)

      const timer = setTimeout(() => {
        setIsExiting(true)
        setTimeout(onClose, 300)
      }, duration)

      return () => {
        clearInterval(interval)
        clearTimeout(timer)
      }
    }
  }, [duration, onClose])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(onClose, 300)
  }

  const handleClick = () => {
    if (!showCloseButton && duration === 0) {
      handleClose()
    }
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      onClick={handleClick}
      className={cn(
        "relative flex items-start gap-3 rounded-2xl p-4 shadow-lg backdrop-blur-sm",
        "w-full max-w-md",
        "transition-all duration-300 ease-out",
        config.bg,
        config.text,
        isExiting ? "translate-x-full scale-95 opacity-0" : "translate-x-0 scale-100 opacity-100",
        !showCloseButton && duration === 0 && "cursor-pointer hover:scale-[1.02]"
      )}
    >
      {/* Progress bar */}
      {duration > 0 && (
        <div className="absolute right-0 bottom-0 left-0 h-1 overflow-hidden rounded-b-2xl bg-white/20">
          <div
            className="h-full bg-white/40 transition-all duration-50 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Icon */}
      {displayIcon && (
        <div className="mt-0.5 shrink-0" aria-hidden="true">
          {displayIcon}
        </div>
      )}

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{message}</p>
        {description && <p className="mt-1 text-sm opacity-90">{description}</p>}
      </div>

      {/* Close button */}
      {showCloseButton && (
        <button
          onClick={handleClose}
          className="-mt-1 -mr-1 shrink-0 rounded-lg p-1 transition-colors hover:bg-white/20"
          aria-label="Close notification"
        >
          <svg
            width="16"
            height="16"
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
  )
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ children, position = "top-right" }) => {
  return (
    <div
      className={cn("fixed z-[1500] flex flex-col gap-2", containerPositions[position])}
      aria-live="polite"
      aria-atomic="true"
    >
      {children}
    </div>
  )
}

Toast.displayName = "Toast"
ToastContainer.displayName = "ToastContainer"
