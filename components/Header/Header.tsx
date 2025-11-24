import React from "react"
import { cn } from "utils/cn"

type HeaderProps = {
  title: string
  actions?: React.ReactNode
  className?: string
}

export const Header: React.FC<HeaderProps> = ({ title, actions, className }) => (
  <header className={cn("flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4", className)}>
    <h1 className="text-xl font-bold text-neutral-900">{title}</h1>
    <div>{actions}</div>
  </header>
)
