import React from "react"
import { cn } from "utils/cn"
import { Avatar } from "../Avatar"
import { Button } from "../Button"

type FriendRequestProps = {
  name: string
  avatar?: string
  onAccept: () => void
  onDecline: () => void
  className?: string
}

export const FriendRequest: React.FC<FriendRequestProps> = ({ name, avatar, onAccept, onDecline, className }) => (
  <div className={cn("flex items-center gap-3", className)}>
    <Avatar alt="avatar" src={avatar} initials={name[0]} size={32} />
    <span className="text-neutral-800">{name}</span>
    <Button intent="primary" size="sm" onClick={onAccept}>
      Accept
    </Button>
    <Button intent="secondary" size="sm" onClick={onDecline}>
      Decline
    </Button>
  </div>
)
