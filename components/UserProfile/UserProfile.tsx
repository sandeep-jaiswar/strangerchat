import React from "react"
import { cn } from "utils/cn"
import { Avatar } from "../Avatar"

type UserProfileProps = {
  name: string
  email: string
  avatar?: string
  className?: string
}

export const UserProfile: React.FC<UserProfileProps> = ({ name, email, avatar, className }) => (
  <div className={cn("flex items-center gap-4", className)}>
    <Avatar src={avatar} alt={name + "'s avatar"} initials={name[0]} size={48} />
    <div>
      <div className="font-semibold text-neutral-900">{name}</div>
      <div className="text-xs text-neutral-500">{email}</div>
    </div>
  </div>
)
