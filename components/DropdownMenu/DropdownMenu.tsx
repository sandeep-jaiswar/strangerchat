import React, { useState } from "react"
import { cn } from "utils/cn"

type DropdownMenuProps = {
  options: { label: string; value: string }[]
  onSelect: (value: string) => void
  placeholder?: string
  className?: string
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ options, onSelect, placeholder = "Select", className }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className={cn("relative", className)}>
      <button className="rounded-md bg-neutral-100 px-3 py-2 text-neutral-800" onClick={() => setOpen(!open)}>
        {placeholder}
      </button>
      {open && (
        <ul className="z-dropdown absolute top-full left-0 mt-1 min-w-[120px] rounded-md border border-neutral-200 bg-white shadow-lg">
          {options.map((opt) => (
            <li
              key={opt.value}
              className="cursor-pointer px-4 py-2 hover:bg-neutral-100"
              onClick={() => {
                onSelect(opt.value)
                setOpen(false)
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
