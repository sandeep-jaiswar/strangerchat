import React from "react"
import { cn } from "utils/cn"

export const Loader: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("border-t-primary h-8 w-8 animate-spin rounded-full border-4 border-neutral-200", className)} />
)
