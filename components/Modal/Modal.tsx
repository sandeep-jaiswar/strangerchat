import React from "react"
import { cn } from "utils/cn"

type ModalProps = {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  className?: string
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, children, title, className }) =>
  !open ? null : (
    <div className={cn("z-modal bg-opacity-50 fixed inset-0 flex items-center justify-center bg-black", className)}>
      <div className="min-w-[300px] rounded-lg bg-white p-6 shadow-lg">
        {title && <h2 className="mb-4 text-lg font-semibold">{title}</h2>}
        {children}
        <button className="text-primary mt-4" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
