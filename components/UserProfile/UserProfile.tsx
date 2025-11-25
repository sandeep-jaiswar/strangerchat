import React from "react"
import { cn } from "utils/cn"
import { Avatar } from "../Avatar"

type UserProfileProps = {
  name: string
  email: string
  avatar?: string
  phone?: string
  status?: string
  recentChats?: Array<{ name: string; lastMessage: string; time: string; avatar?: string; initials?: string }>
  className?: string
}

import { ProfileTabs } from "../ProfileTabs"

export const UserProfile: React.FC<UserProfileProps> = ({
  name,
  avatar,
  phone,
  status,
  recentChats,
  className,
}) => (
  <div className={cn("p-4", className)}>
    <div className="mb-4 flex items-center gap-4">
      <Avatar
        src={avatar}
        alt={name + "'s avatar"}
        initials={name[0]}
        size="xl"
      />
      <div>
        <div className="text-lg font-bold text-neutral-900">{name}</div>
        {status && <div className="text-xs text-neutral-500">{status}</div>}
        {phone && <div className="mt-1 text-xs text-neutral-500">{phone}</div>}
      </div>
    </div>
    <ProfileTabs tabs={[{ label: "Chat", active: true }, { label: "Group" }]} />
    <div className="mt-4">
      {recentChats &&
        recentChats.map((chat, i) => (
          <div key={i} className="flex items-center gap-3 border-b py-2 last:border-b-0">
            <Avatar src={chat.avatar} alt={chat.name + " avatar"} initials={chat.initials || chat.name[0]} size="md" />
            <div className="flex-1">
              <div className="font-medium text-neutral-900">{chat.name}</div>
              <div className="truncate text-xs text-neutral-500">{chat.lastMessage}</div>
            </div>
            <div className="text-xs text-neutral-400">{chat.time}</div>
          </div>
        ))}
    </div>
  </div>
)
