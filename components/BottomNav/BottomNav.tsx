import React from "react"
import { cn } from "utils/cn"

export interface BottomNavProps {
  items: Array<{ label: string; icon: React.ReactNode; active?: boolean; onClick?: () => void }>
  className?: string
}

export const BottomNav: React.FC<BottomNavProps> = ({ items, className }) => (
  <nav className={cn("fixed right-0 bottom-0 left-0 z-10 flex justify-around border-t bg-white py-2", className)}>
    {items.map((item, i) => (
      <button
        key={i}
        className={cn("flex flex-col items-center text-xs", item.active ? "text-primary" : "text-neutral-500")}
        onClick={item.onClick}
      >
        {item.icon}
        <span>{item.label}</span>
      </button>
    ))}
  </nav>
)
