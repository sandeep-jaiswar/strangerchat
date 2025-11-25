import React from "react"
import { cn } from "utils/cn"

export interface ProfileTabsProps {
  tabs: Array<{ label: string; active?: boolean; onClick?: () => void }>
  className?: string
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({ tabs, className }) => (
  <div className={cn("flex border-b bg-white", className)}>
    {tabs.map((tab, i) => (
      <button
        key={i}
        className={cn(
          "flex-1 py-2 text-center font-medium",
          tab.active ? "border-primary text-primary border-b-2" : "text-neutral-500"
        )}
        onClick={tab.onClick}
      >
        {tab.label}
      </button>
    ))}
  </div>
)
