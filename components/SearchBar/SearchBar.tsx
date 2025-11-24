import React from "react"
import { cn } from "utils/cn"
import { Input } from "../Input"

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder = "Search...", className }) => (
  <Input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className={cn("w-full", className)}
    size="md"
  />
)
