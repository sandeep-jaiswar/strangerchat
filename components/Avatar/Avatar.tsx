"use client"

import Image from "next/image"
import React, { useState } from "react"
import { cn } from "utils/cn"

export interface AvatarProps {
  src?: string
  alt: string
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  initials?: string
  className?: string
  loading?: boolean
  status?: "online" | "offline" | "away" | "busy"
  onLoad?: () => void
  onError?: () => void
}

const sizeClasses = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-14 w-14 text-lg",
  xl: "h-20 w-20 text-xl",
}

const statusColors = {
  online: "bg-green-500",
  offline: "bg-gray-400",
  away: "bg-yellow-500",
  busy: "bg-red-500",
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = "md",
  initials,
  className,
  loading = false,
  status,
  onLoad,
  onError,
}) => {
  const [imageError, setImageError] = useState(false)
  const [, setImageLoaded] = useState(false)

  const handleError = () => {
    setImageError(true)
    onError?.()
  }

  const handleLoad = () => {
    setImageLoaded(true)
    onLoad?.()
  }

  const showFallback = !src || imageError || loading

  return (
    <div className={cn("relative inline-block", className)} role="img" aria-label={alt}>
      <div
        className={cn(
          "flex items-center justify-center overflow-hidden rounded-full bg-neutral-200",
          sizeClasses[size],
          loading && "animate-pulse"
        )}
      >
        {showFallback ? (
          <span className="font-semibold text-neutral-600 uppercase">
            {initials?.slice(0, 2) || alt.charAt(0).toUpperCase()}
          </span>
        ) : (
          <Image
            src={src}
            alt={alt}
            width={parseInt(sizeClasses[size].match(/\d+/)?.[0] || "40") * 4}
            height={parseInt(sizeClasses[size].match(/\d+/)?.[0] || "40") * 4}
            className="h-full w-full object-cover"
            onError={handleError}
            onLoad={handleLoad}
            unoptimized={src?.startsWith("http")}
          />
        )}
      </div>
      {status && (
        <span
          className={cn("absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white", statusColors[status])}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  )
}
