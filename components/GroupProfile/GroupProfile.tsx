import React from "react"
import { cn } from "utils/cn"
import { Avatar } from "../Avatar"
import { AvatarGroup } from "../AvatarGroup"

export interface GroupProfileProps {
  name: string
  description?: string
  avatar?: string
  members: Array<{ src?: string; alt: string; initials?: string }>
  onInvite?: () => void
  className?: string
}

export const GroupProfile: React.FC<GroupProfileProps> = ({
  name,
  description,
  avatar,
  members,
  onInvite,
  className,
}) => (
  <div className={cn("p-4", className)}>
    <div className="mb-4 flex items-center gap-4">
      <Avatar src={avatar} alt={name + " group avatar"} size={56} />
      <div>
        <div className="text-lg font-bold text-neutral-900">{name}</div>
        {description && <div className="text-xs text-neutral-500">{description}</div>}
      </div>
      <button className="bg-primary ml-auto rounded px-3 py-1 text-white" onClick={onInvite}>
        Invite
      </button>
    </div>
    <AvatarGroup avatars={members} max={7} />
    {/* Add recent media/messages section here as needed */}
  </div>
)
