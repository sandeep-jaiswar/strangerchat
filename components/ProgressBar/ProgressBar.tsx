"use client"

import React from "react"
import { cn } from "utils/cn"

/**
 * ProgressBar Component - Apple-inspired Design
 *
 * Following Apple's Human Interface Guidelines:
 * - Clarity: Clear progress indication
 * - Deference: Subtle and non-intrusive
 * - Depth: Smooth animations
 *
 * Features:
 * - Lightweight implementation
 * - Multiple intent colors
 * - Size variants
 * - Optional label display
 * - Smooth progress animation
 */

export interface ProgressBarProps {
  /** Current progress value */
  value: number

  /** Maximum value */
  max?: number

  /** Intent color */
  intent?: "primary" | "success" | "warning" | "danger" | "info"

  /** Size variant */
  size?: "sm" | "md" | "lg"

  /** Show label */
  showLabel?: boolean

  /** Label position */
  labelPosition?: "left" | "right" | "top"

  /** Custom label format function */
  formatLabel?: (value: number, max: number) => string

  /** Custom className */
  className?: string
}

const progressIntents = {
  primary: "bg-[#0071e3]",
  success: "bg-[#34c759]",
  warning: "bg-[#ff9500]",
  danger: "bg-[#ff3b30]",
  info: "bg-[#007aff]",
}

const progressSizes = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
}

export function ProgressBar({
  value,
  max = 100,
  intent = "primary",
  size = "md",
  showLabel = false,
  labelPosition = "right",
  formatLabel = (val, maximum) => `${Math.round((val / maximum) * 100)}%`,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  const label = formatLabel(value, max)

  const progressBar = (
    <div
      className={cn("flex-1 overflow-hidden rounded-full bg-neutral-200", progressSizes[size], className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className={cn("h-full rounded-full transition-all duration-300 ease-out", progressIntents[intent])}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )

  if (!showLabel) {
    return progressBar
  }

  if (labelPosition === "top") {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-neutral-700">{label}</span>
        </div>
        {progressBar}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      {labelPosition === "left" && (
        <span className="min-w-[3rem] text-right text-sm font-medium text-neutral-700">{label}</span>
      )}
      {progressBar}
      {labelPosition === "right" && <span className="min-w-[3rem] text-sm font-medium text-neutral-700">{label}</span>}
    </div>
  )
}

/**
 * CircularProgress - Circular progress indicator
 */
export interface CircularProgressProps {
  /** Current progress value */
  value: number

  /** Maximum value */
  max?: number

  /** Intent color */
  intent?: "primary" | "success" | "warning" | "danger" | "info"

  /** Size of the circle */
  size?: number

  /** Stroke width */
  strokeWidth?: number

  /** Show percentage label */
  showLabel?: boolean

  /** Custom className */
  className?: string
}

export function CircularProgress({
  value,
  max = 100,
  intent = "primary",
  size = 80,
  strokeWidth = 8,
  showLabel = true,
  className,
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  const colors = {
    primary: "#0071e3",
    success: "#34c759",
    warning: "#ff9500",
    danger: "#ff3b30",
    info: "#007aff",
  }

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className="-rotate-90 transform"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        {/* Background circle */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e5e5" strokeWidth={strokeWidth} />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors[intent]}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-out"
        />
      </svg>
      {showLabel && (
        <span
          className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-neutral-900"
          style={{ fontSize: size / 5 }}
        >
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  )
}

ProgressBar.displayName = "ProgressBar"
CircularProgress.displayName = "CircularProgress"
