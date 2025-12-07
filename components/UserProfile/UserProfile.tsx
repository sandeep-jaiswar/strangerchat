"use client"

import React from "react"
import { cn } from "utils/cn"
import { Avatar } from "../Avatar/Avatar"
import { Badge } from "../Badge/Badge"
import { Button } from "../Button"
import { IconButton } from "../IconButton"

/**
 * UserProfile Component - Apple-inspired Design
 *
 * Following Apple's Human Interface Guidelines:
 * - Clarity: Clear visual hierarchy, legible typography
 * - Deference: Content-focused, UI doesn't compete
 * - Depth: Layered design with subtle shadows and animations
 *
 * Features:
 * - Multiple variants: card, inline, compact, detailed
 * - Status indicators with badges
 * - Action buttons integration
 * - Verified badge support
 * - Social stats (followers, following)
 * - Custom metadata fields
 * - Responsive sizing
 * - Interactive states with smooth animations
 */

export interface UserProfileProps {
  name: string
  email?: string
  username?: string
  avatarUrl?: string
  status?: "online" | "offline" | "away" | "busy"
  bio?: string
  location?: string
  website?: string
  verified?: boolean
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "card" | "inline" | "compact" | "detailed"
  onClick?: () => void
  onMessage?: () => void
  onCall?: () => void
  onMore?: () => void
  showActions?: boolean
  followers?: number
  following?: number
  posts?: number
  badges?: Array<{ label: string; intent?: "primary" | "secondary" | "success" | "warning" | "error" }>
  metadata?: Array<{ label: string; value: string; icon?: React.ReactNode }>
  className?: string
}

const sizes = {
  sm: {
    avatar: "sm" as const,
    name: "text-[15px]",
    username: "text-[13px]",
    email: "text-[13px]",
    bio: "text-[13px]",
    metadata: "text-[12px]",
  },
  md: {
    avatar: "md" as const,
    name: "text-[17px]",
    username: "text-[15px]",
    email: "text-[15px]",
    bio: "text-[15px]",
    metadata: "text-[13px]",
  },
  lg: {
    avatar: "lg" as const,
    name: "text-[20px]",
    username: "text-[17px]",
    email: "text-[17px]",
    bio: "text-[17px]",
    metadata: "text-[15px]",
  },
  xl: {
    avatar: "xl" as const,
    name: "text-[28px]",
    username: "text-[20px]",
    email: "text-[20px]",
    bio: "text-[20px]",
    metadata: "text-[17px]",
  },
}

const variantStyles = {
  card: "rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5",
  inline: "rounded-xl p-3",
  compact: "rounded-lg p-2",
  detailed: "rounded-2xl bg-white p-8 shadow-md ring-1 ring-black/5",
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M"
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K"
  }
  return num.toString()
}

export const UserProfile = React.forwardRef<HTMLDivElement, UserProfileProps>(
  (
    {
      name,
      email,
      username,
      avatarUrl,
      status,
      bio,
      location,
      website,
      verified = false,
      size = "md",
      variant = "inline",
      onClick,
      onMessage,
      onCall,
      onMore,
      showActions = false,
      followers,
      following,
      posts,
      badges,
      metadata,
      className,
    },
    ref
  ) => {
    const sizeConfig = sizes[size]
    const isClickable = !!onClick
    const isDetailed = variant === "detailed"
    const isCard = variant === "card"
    const isCompact = variant === "compact"
    const isInline = variant === "inline"

    // Determine avatar size based on variant
    const avatarSize = variant === "detailed" ? "xl" : variant === "card" ? "xl" : sizeConfig.avatar

    const Content = (
      <>
        {/* Avatar and Basic Info Section */}
        <div
          className={cn(
            "flex items-start gap-4",
            isDetailed && "flex-col items-center text-center",
            isCompact && "gap-2"
          )}
        >
          <Avatar
            src={avatarUrl}
            alt={name}
            status={status}
            size={avatarSize as "xs" | "sm" | "md" | "lg" | "xl"}
          />

          <div className={cn("min-w-0 flex-1", isDetailed && "w-full")}>
            {/* Name and Verified Badge */}
            <div className={cn("flex items-center gap-2", isDetailed && "justify-center")}>
              <h3
                className={cn(
                  "truncate font-semibold text-neutral-900",
                  sizeConfig.name,
                  isDetailed && "text-[34px]"
                )}
              >
                {name}
              </h3>
              {verified && (
                <svg
                  className={cn(
                    "shrink-0 text-[#007aff]",
                    size === "sm" && "h-4 w-4",
                    size === "md" && "h-5 w-5",
                    size === "lg" && "h-6 w-6",
                    size === "xl" && "h-7 w-7"
                  )}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  <circle cx="12" cy="12" r="11" fill="currentColor" opacity="0.1" />
                  <circle
                    cx="12"
                    cy="12"
                    r="11"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              )}
            </div>

            {/* Username */}
            {username && (
              <p
                className={cn(
                  "truncate text-neutral-500",
                  sizeConfig.username,
                  isDetailed && "text-[20px]"
                )}
              >
                @{username}
              </p>
            )}

            {/* Email */}
            {email && !isCompact && (
              <p className={cn("truncate text-neutral-600", sizeConfig.email)}>{email}</p>
            )}

            {/* Bio */}
            {bio && !isCompact && (
              <p
                className={cn(
                  "mt-2 text-neutral-700",
                  sizeConfig.bio,
                  isInline ? "line-clamp-2" : "line-clamp-3"
                )}
              >
                {bio}
              </p>
            )}

            {/* Metadata (Location, Website, etc.) */}
            {metadata && metadata.length > 0 && !isCompact && (
              <div className="mt-3 flex flex-wrap items-center gap-4">
                {metadata.map((item, index) => (
                  <div key={index} className="flex items-center gap-1.5 text-neutral-600">
                    {item.icon}
                    <span className={cn("truncate", sizeConfig.metadata)}>
                      {item.label}: {item.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Location and Website */}
            {(location || website) && !isCompact && !metadata && (
              <div className="mt-3 flex flex-wrap items-center gap-4">
                {location && (
                  <div className="flex items-center gap-1.5 text-neutral-600">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    <span className={sizeConfig.metadata}>{location}</span>
                  </div>
                )}
                {website && (
                  <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[#0071e3] transition-colors hover:text-[#005bb5]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
                    </svg>
                    <span className={sizeConfig.metadata}>{website}</span>
                  </a>
                )}
              </div>
            )}

            {/* Stats (Followers, Following, Posts) */}
            {(followers !== undefined || following !== undefined || posts !== undefined) &&
              !isCompact && (
                <div
                  className={cn(
                    "mt-4 flex gap-6",
                    isDetailed && "justify-center border-y border-neutral-100 py-4"
                  )}
                >
                  {posts !== undefined && (
                    <div className="text-center">
                      <div className={cn("font-semibold text-neutral-900", sizeConfig.name)}>
                        {formatNumber(posts)}
                      </div>
                      <div className={cn("text-neutral-500", sizeConfig.metadata)}>Posts</div>
                    </div>
                  )}
                  {followers !== undefined && (
                    <div className="text-center">
                      <div className={cn("font-semibold text-neutral-900", sizeConfig.name)}>
                        {formatNumber(followers)}
                      </div>
                      <div className={cn("text-neutral-500", sizeConfig.metadata)}>
                        Followers
                      </div>
                    </div>
                  )}
                  {following !== undefined && (
                    <div className="text-center">
                      <div className={cn("font-semibold text-neutral-900", sizeConfig.name)}>
                        {formatNumber(following)}
                      </div>
                      <div className={cn("text-neutral-500", sizeConfig.metadata)}>
                        Following
                      </div>
                    </div>
                  )}
                </div>
              )}

            {/* Badges */}
            {badges && badges.length > 0 && !isCompact && (
              <div className="mt-3 flex flex-wrap gap-2">
                {badges.map((badge, index) => (
                  <Badge
                    key={index}
                    variant="soft"
                    intent={badge.intent || "secondary"}
                    size="sm"
                  >
                    {badge.label}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* More Options Button (for inline/card variants) */}
          {onMore && !isDetailed && !showActions && (
            <IconButton
              variant="plain"
              intent="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onMore()
              }}
              aria-label="More options"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </IconButton>
          )}
        </div>

        {/* Action Buttons */}
        {showActions && (onMessage || onCall || onMore) && (
          <div
            className={cn(
              "mt-4 flex gap-2",
              isDetailed && "mt-6",
              isCard && "mt-4",
              isInline && "mt-3"
            )}
          >
            {onMessage && (
              <Button
                variant="filled"
                intent="primary"
                size={size === "xl" ? "lg" : size === "sm" ? "sm" : "md"}
                fullWidth
                onClick={(e) => {
                  e.stopPropagation()
                  onMessage()
                }}
                leftIcon={
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                  </svg>
                }
              >
                Message
              </Button>
            )}
            {onCall && (
              <IconButton
                variant="tinted"
                intent="success"
                size={size === "xl" ? "lg" : size === "sm" ? "sm" : "md"}
                onClick={(e) => {
                  e.stopPropagation()
                  onCall()
                }}
                aria-label="Call"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
                </svg>
              </IconButton>
            )}
            {onMore && (
              <IconButton
                variant="tinted"
                intent="secondary"
                size={size === "xl" ? "lg" : size === "sm" ? "sm" : "md"}
                onClick={(e) => {
                  e.stopPropagation()
                  onMore()
                }}
                aria-label="More options"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="12" cy="19" r="2" />
                </svg>
              </IconButton>
            )}
          </div>
        )}
      </>
    )

    if (isClickable) {
      return (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          onClick={onClick}
          className={cn(
            "w-full text-left transition-all duration-200",
            variantStyles[variant],
            "hover:bg-neutral-50 active:bg-neutral-100",
            "focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:ring-offset-2",
            isCard && "hover:shadow-md hover:scale-[1.02]",
            className
          )}
        >
          {Content}
        </button>
      )
    }

    return (
      <div ref={ref} className={cn(variantStyles[variant], className)}>
        {Content}
      </div>
    )
  }
)

UserProfile.displayName = "UserProfile"
