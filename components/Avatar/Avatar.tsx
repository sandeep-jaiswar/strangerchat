import Image from "next/image"
import React from "react"
import { cn } from "utils/cn"

type AvatarProps = {
  src?: string
  alt: string
  size?: number
  initials?: string
  className?: string
  width?: number
  height?: number
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt, size = 40, initials, className, width, height }) => (
  <div
    className={cn("flex items-center justify-center overflow-hidden rounded-full bg-neutral-200", className)}
    style={{ width: size, height: size }}
  >
    {src ? (
      <Image
        src={src}
        alt={alt}
        width={width || size}
        height={height || size}
        style={{ width: "100%", height: "100%" }}
      />
    ) : (
      <span className="font-semibold text-neutral-600">{initials}</span>
    )}
  </div>
)
