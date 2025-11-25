import React from "react"
import { cn } from "utils/cn"
import { Avatar } from "../Avatar"

export interface Contact {
  name: string
  status?: string
  avatar?: string
  initials?: string
}

export interface ContactListProps {
  contacts: Contact[]
  onSelect?: (contact: Contact) => void
  className?: string
}

export const ContactList: React.FC<ContactListProps> = ({ contacts, onSelect, className }) => (
  <div className={cn("flex flex-col", className)}>
    {contacts.map((c, i) => (
      <button
        key={i}
        className="flex items-center gap-3 rounded px-4 py-2 hover:bg-neutral-100"
        onClick={() => onSelect?.(c)}
      >
        <Avatar src={c.avatar} alt={c.name + " avatar"} initials={c.initials || c.name[0]} size="md" />
        <div className="flex-1">
          <div className="font-medium text-neutral-900">{c.name}</div>
          <div className="text-xs text-neutral-500">{c.status || "Offline"}</div>
        </div>
      </button>
    ))}
  </div>
)
