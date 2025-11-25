import React from "react"
import { cn } from "utils/cn"
import { Avatar } from "../Avatar"

export interface AvatarGroupProps {
  avatars: Array<{ src?: string; alt: string; initials?: string }>
  max?: number
  className?: string
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({ avatars, max = 5, className }) => {
  const displayAvatars = avatars.slice(0, max)
  const extra = avatars.length - max
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {displayAvatars.map((a, i) => (
        <Avatar key={i} src={a.src} alt={a.alt} initials={a.initials} size="md" />
      ))}
      {extra > 0 && (
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-300 text-xs font-semibold text-neutral-700">
          +{extra}
        </span>
      )}
    </div>
  )
}
