import React from "react"
import { cn } from "utils/cn"

type ToastProps = {
  message: string
  type?: "success" | "error" | "info"
  onClose: () => void
  className?: string
}

export const Toast: React.FC<ToastProps> = ({ message, type = "info", onClose, className }) => (
  <div
    className={cn(
      "fixed right-6 bottom-6 flex items-center rounded-lg px-4 py-3 shadow-lg",
      type === "error"
        ? "bg-error text-error-foreground"
        : type === "success"
        ? "bg-success text-success-foreground"
        : "bg-neutral-800 text-white",
      className
    )}
  >
    <span>{message}</span>
    <button className="ml-4 text-white underline" onClick={onClose}>
      Close
    </button>
  </div>
)
