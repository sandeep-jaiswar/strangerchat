import { cva, type VariantProps } from "class-variance-authority"
import Image from "next/image"
import React from "react"
import { cn } from "utils/cn"

const avatar = cva(
  ["flex", "items-center", "justify-center", "overflow-hidden", "rounded-full", "bg-neutral-200", "shrink-0"],
  {
    variants: {
      size: {
        xs: ["w-6", "h-6", "text-xs"],
        sm: ["w-8", "h-8", "text-xs"],
        md: ["w-10", "h-10", "text-sm"],
        lg: ["w-12", "h-12", "text-base"],
        xl: ["w-16", "h-16", "text-lg"],
        "2xl": ["w-20", "h-20", "text-xl"],
      },
      status: {
        online: [],
        offline: [],
        busy: [],
        away: [],
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

const sizeMap = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
  "2xl": 80,
}

export interface AvatarProps extends VariantProps<typeof avatar> {
  src?: string
  alt: string
  initials?: string
  className?: string
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt, size = "md", status, initials, className }) => {
  const numericSize = size ? sizeMap[size] : sizeMap.md

  return (
    <div className="relative inline-flex">
      <div className={cn(avatar({ size, status, className }))}>
        {src ? (
          <Image
            src={src}
            alt={alt}
            width={numericSize}
            height={numericSize}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="font-semibold text-neutral-600">{initials}</span>
        )}
      </div>
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block rounded-full ring-2 ring-white",
            size === "xs" && "h-1.5 w-1.5",
            size === "sm" && "h-2 w-2",
            size === "md" && "h-2.5 w-2.5",
            size === "lg" && "h-3 w-3",
            size === "xl" && "h-3.5 w-3.5",
            size === "2xl" && "h-4 w-4",
            status === "online" && "bg-success",
            status === "offline" && "bg-neutral-400",
            status === "busy" && "bg-error",
            status === "away" && "bg-warning"
          )}
        />
      )}
    </div>
  )
}
