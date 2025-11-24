import React from "react"
import { cn } from "utils/cn"

type SidebarProps = {
  items: { label: string; icon?: React.ReactNode; onClick: () => void }[]
  className?: string
}

export const Sidebar: React.FC<SidebarProps> = ({ items, className }) => (
  <nav className={cn("w-56 bg-neutral-50 p-4", className)}>
    <ul className="space-y-2">
      {items.map((item, idx) => (
        <li
          key={idx}
          className="flex cursor-pointer items-center rounded-md px-2 py-2 hover:bg-neutral-100"
          onClick={item.onClick}
        >
          {item.icon && <span className="mr-2">{item.icon}</span>}
          <span className="text-neutral-800">{item.label}</span>
        </li>
      ))}
    </ul>
  </nav>
)
