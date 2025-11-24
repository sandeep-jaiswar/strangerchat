import React from "react"
import { cn } from "utils/cn"
import { Avatar } from "../Avatar"

type Friend = {
  id: string
  name: string
  avatar?: string
}

type FriendListProps = {
  friends: Friend[]
  onSelect?: (id: string) => void
  className?: string
}

export const FriendList: React.FC<FriendListProps> = ({ friends, onSelect, className }) => (
  <ul className={cn("space-y-2", className)}>
    {friends.map((f) => (
      <li
        key={f.id}
        onClick={() => onSelect?.(f.id)}
        className="flex cursor-pointer items-center rounded-md px-2 py-1 hover:bg-neutral-100"
      >
        <Avatar alt="avatar" src={f.avatar} initials={f.name[0]} size={32} />
        <span className="ml-3 text-neutral-800">{f.name}</span>
      </li>
    ))}
  </ul>
)
