"use client"

import { cva, type VariantProps } from "class-variance-authority"
import React, { useEffect, useRef, useState } from "react"
import { twMerge } from "tailwind-merge"

const tooltipContent = cva([], {
  variants: {
    intent: {
      primary: ["rounded-md", "bg-zinc-700", "font-sans", "text-white"],
    },
    size: {
      md: ["px-4", "py-2.5", "text-xs"],
    },
  },
  defaultVariants: {
    intent: "primary",
    size: "md",
  },
})

const tooltipArrow = cva([], {
  variants: {
    intent: {
      primary: ["fill-zinc-700"],
    },
    size: {
      md: ["w-4", "h-2"],
    },
  },
  defaultVariants: {
    intent: "primary",
    size: "md",
  },
})

export interface TooltipProps extends VariantProps<typeof tooltipContent> {
  explainer: React.ReactElement | string
  children: React.ReactElement
  className?: string
  withArrow?: boolean
  side?: "top" | "right" | "bottom" | "left"
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  delayDuration?: number
}

export function Tooltip({
  children,
  explainer,
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
  intent,
  size,
  side = "top",
  className,
  withArrow,
  delayDuration = 200,
}: TooltipProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const open = controlledOpen ?? internalOpen

  const setOpen = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen)
    } else {
      setInternalOpen(newOpen)
    }
  }

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(true)
    }, delayDuration)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setOpen(false)
  }

  useEffect(() => {
    if (open && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect()
      const tooltipRect = tooltipRef.current.getBoundingClientRect()

      let top = 0
      let left = 0

      switch (side) {
        case "top":
          top = triggerRect.top - tooltipRect.height - 5
          left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2
          break
        case "bottom":
          top = triggerRect.bottom + 5
          left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2
          break
        case "left":
          top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2
          left = triggerRect.left - tooltipRect.width - 5
          break
        case "right":
          top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2
          left = triggerRect.right + 5
          break
      }

      setPosition({ top, left })
    }
  }, [open, side])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>
      {open && (
        <div
          ref={tooltipRef}
          className={twMerge(tooltipContent({ intent, size, className }))}
          style={{
            position: "fixed",
            top: `${position.top}px`,
            left: `${position.left}px`,
            zIndex: 9999,
          }}
        >
          {explainer}
          {withArrow && (
            <div
              className={twMerge(tooltipArrow({ intent, size, className }))}
              style={{
                position: "absolute",
                ...(side === "top" && { bottom: "-8px", left: "50%", transform: "translateX(-50%) rotate(180deg)" }),
                ...(side === "bottom" && { top: "-8px", left: "50%", transform: "translateX(-50%)" }),
                ...(side === "left" && { right: "-8px", top: "50%", transform: "translateY(-50%) rotate(90deg)" }),
                ...(side === "right" && { left: "-8px", top: "50%", transform: "translateY(-50%) rotate(-90deg)" }),
              }}
            >
              <svg width="16" height="8" viewBox="0 0 16 8">
                <path d="M0 8 L8 0 L16 8 Z" />
              </svg>
            </div>
          )}
        </div>
      )}
    </>
  )
}
