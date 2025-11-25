import React from "react"
import { cn } from "utils/cn"

export interface MessageActionsProps {
  actions: Array<{ icon: React.ReactNode; label: string; onClick: () => void }>
  className?: string
}

export const MessageActions: React.FC<MessageActionsProps> = ({ actions, className }) => (
  <div className={cn("absolute z-20 flex gap-2 rounded bg-white p-2 shadow", className)}>
    {actions.map((action, i) => (
      <button
        key={i}
        className="hover:text-primary flex flex-col items-center text-xs text-neutral-700"
        onClick={action.onClick}
        title={action.label}
      >
        {action.icon}
        <span>{action.label}</span>
      </button>
    ))}
  </div>
)
