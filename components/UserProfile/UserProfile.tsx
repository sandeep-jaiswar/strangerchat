import React from "react"
import { cn } from "utils/cn"
import { Avatar } from "../Avatar/Avatar"

export interface UserProfileProps {
  name: string
  email?: string
  avatarUrl?: string
  status?: "online" | "offline" | "away" | "busy"
  bio?: string
  size?: "sm" | "md" | "lg"
  onClick?: () => void
  className?: string
}

const sizes = {
  sm: {
    avatar: "md" as const,
    name: "text-sm",
    email: "text-xs",
  },
  md: {
    avatar: "lg" as const,
    name: "text-base",
    email: "text-sm",
  },
  lg: {
    avatar: "xl" as const,
    name: "text-lg",
    email: "text-base",
  },
}

export const UserProfile: React.FC<UserProfileProps> = ({
  name,
  email,
  avatarUrl,
  status,
  bio,
  size = "md",
  onClick,
  className,
}) => {
  const sizeConfig = sizes[size]
  const Component = onClick ? "button" : "div"

  return (
    <Component
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl p-3 transition-colors",
        onClick && "cursor-pointer hover:bg-neutral-50 active:bg-neutral-100",
        onClick && "focus:ring-2 focus:ring-[#0071e3]/20 focus:outline-none",
        className
      )}
    >
      <Avatar src={avatarUrl} alt={name} status={status} size={sizeConfig.avatar} />
      <div className="min-w-0 flex-1 text-left">
        <p className={cn("truncate font-semibold text-neutral-900", sizeConfig.name)}>{name}</p>
        {email && <p className={cn("truncate text-neutral-600", sizeConfig.email)}>{email}</p>}
        {bio && <p className={cn("line-clamp-2 text-neutral-500", sizeConfig.email)}>{bio}</p>}
      </div>
    </Component>
  )
}

UserProfile.displayName = "UserProfile"
