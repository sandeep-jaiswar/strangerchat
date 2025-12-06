import React from "react"
import { cn } from "utils/cn"

type HeaderProps = {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  leftContent?: React.ReactNode
  sticky?: boolean
  className?: string
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, actions, leftContent, sticky = false, className }) => {
  return (
    <header
      className={cn(
        "w-full border-b border-neutral-200 bg-white",
        "transition-all duration-200",
        sticky && "sticky top-0 z-[1100]",
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left Section */}
          <div className="flex min-w-0 flex-1 items-center gap-4">
            {leftContent}
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold text-neutral-900">{title}</h1>
              {subtitle && <p className="truncate text-sm text-neutral-600">{subtitle}</p>}
            </div>
          </div>

          {/* Actions */}
          {actions && <div className="ml-4 flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    </header>
  )
}

Header.displayName = "Header"
