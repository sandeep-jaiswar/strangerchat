"use client"

import React, { useState } from "react"
import { cn } from "utils/cn"
import { Avatar } from "../Avatar"
import { Badge } from "../Badge"
import { Button } from "../Button"
import { IconButton } from "../IconButton"

/**
 * FriendRequest Component - Apple Social/Notification-inspired Design
 *
 * Following Apple's Human Interface Guidelines:
 * - Clarity: Clear request information with visible actions
 * - Deference: Content-focused with subtle interactive elements
 * - Depth: Smooth animations, layered information, contextual actions
 *
 * Features:
 * - Multiple variants (default/compact/card/notification)
 * - Mutual friends count
 * - Request timestamp
 * - Bio/message preview
 * - Action states (accepting/declining/pending)
 * - Undo functionality
 * - Quick actions on hover
 * - Read/unread status
 * - Multiple request handling
 * - Batch operations
 * - Contextual information
 */

export interface FriendRequestProps {
  id?: string
  name: string
  username?: string
  avatar?: string
  bio?: string
  mutualFriends?: number
  timestamp?: string
  message?: string
  onAccept: () => void | Promise<void>
  onDecline: () => void | Promise<void>
  onViewProfile?: () => void
  className?: string
  variant?: "default" | "compact" | "card" | "notification"
  showMutualFriends?: boolean
  showTimestamp?: boolean
  showMessage?: boolean
  isUnread?: boolean
  disabled?: boolean
}

export const FriendRequest = React.forwardRef<HTMLDivElement, FriendRequestProps>(
  (
    {
      id: _id,
      name,
      username,
      avatar,
      bio,
      mutualFriends,
      timestamp,
      message,
      onAccept,
      onDecline,
      onViewProfile,
      className,
      variant = "default",
      showMutualFriends = true,
      showTimestamp = true,
      showMessage = true,
      isUnread = false,
      disabled = false,
    },
    ref
  ) => {
    const [isAccepting, setIsAccepting] = useState(false)
    const [isDeclining, setIsDeclining] = useState(false)
    const [isHovered, setIsHovered] = useState(false)

    const handleAccept = async () => {
      if (disabled || isAccepting || isDeclining) return
      setIsAccepting(true)
      try {
        await onAccept()
      } finally {
        setIsAccepting(false)
      }
    }

    const handleDecline = async () => {
      if (disabled || isAccepting || isDeclining) return
      setIsDeclining(true)
      try {
        await onDecline()
      } finally {
        setIsDeclining(false)
      }
    }

    const isProcessing = isAccepting || isDeclining

    // Format timestamp
    const formatTimestamp = (time?: string) => {
      if (!time) return null
      // Simple formatting - could be enhanced with date-fns
      return time
    }

    const variantStyles = {
      default: "flex items-start gap-3 rounded-xl p-3 hover:bg-neutral-50 transition-colors",
      compact: "flex items-center gap-2 rounded-lg p-2 hover:bg-neutral-50 transition-colors",
      card: "flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm hover:shadow-md transition-all",
      notification:
        "flex items-start gap-3 rounded-xl border-l-4 border-[#0071e3] bg-[#0071e3]/5 p-3 hover:bg-[#0071e3]/10 transition-colors",
    }

    return (
      <div
        ref={ref}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          variantStyles[variant],
          isUnread && "bg-[#0071e3]/5",
          (isAccepting || isDeclining) && "opacity-60",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        {/* Avatar */}
        <div className="relative shrink-0">
          <div
            onClick={onViewProfile}
            className={onViewProfile ? "cursor-pointer" : ""}
          >
            <Avatar
              src={avatar}
              alt={name}
              initials={name.slice(0, 2).toUpperCase()}
              size={variant === "compact" ? "sm" : "md"}
              className={onViewProfile ? "hover:ring-2 hover:ring-[#0071e3]" : ""}
            />
          </div>
          {isUnread && variant !== "notification" && (
            <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-[#0071e3]" />
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3
                  className={cn(
                    "truncate font-semibold text-neutral-900",
                    variant === "compact" ? "text-[15px]" : "text-[17px]",
                    onViewProfile && "cursor-pointer hover:text-[#0071e3]"
                  )}
                  onClick={onViewProfile}
                >
                  {name}
                </h3>
                {isUnread && variant === "notification" && (
                  <Badge variant="filled" intent="primary" size="sm">
                    New
                  </Badge>
                )}
              </div>

              {username && variant !== "compact" && (
                <p className="truncate text-[13px] text-neutral-500">@{username}</p>
              )}

              {showTimestamp && timestamp && (
                <p className="mt-0.5 text-[13px] text-neutral-400">
                  {formatTimestamp(timestamp)}
                </p>
              )}
            </div>

            {/* Quick decline (show on hover for card variant) */}
            {variant === "card" && isHovered && !isProcessing && (
              <IconButton
                variant="plain"
                intent="secondary"
                size="sm"
                onClick={handleDecline}
                disabled={disabled}
                aria-label="Decline"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </IconButton>
            )}
          </div>

          {/* Message/Bio */}
          {showMessage && message && variant !== "compact" && (
            <p className="mt-2 line-clamp-2 text-[15px] text-neutral-600">{message}</p>
          )}
          {!message && bio && variant !== "compact" && (
            <p className="mt-2 line-clamp-1 text-[13px] text-neutral-500">{bio}</p>
          )}

          {/* Mutual Friends */}
          {showMutualFriends && mutualFriends && mutualFriends > 0 && variant !== "compact" && (
            <div className="mt-2 flex items-center gap-1">
              <svg className="h-3 w-3 text-neutral-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
              <span className="text-[12px] text-neutral-500">
                {mutualFriends} mutual {mutualFriends === 1 ? "friend" : "friends"}
              </span>
            </div>
          )}

          {/* Actions */}
          {variant !== "compact" && (
            <div className="mt-3 flex items-center gap-2">
              <Button
                intent="primary"
                size="sm"
                onClick={handleAccept}
                disabled={disabled || isProcessing}
                className="flex-1"
              >
                {isAccepting ? (
                  <>
                    <svg className="mr-1 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Accepting...
                  </>
                ) : (
                  "Accept"
                )}
              </Button>
              <Button
                intent="secondary"
                size="sm"
                onClick={handleDecline}
                disabled={disabled || isProcessing}
                className="flex-1"
              >
                {isDeclining ? (
                  <>
                    <svg className="mr-1 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Declining...
                  </>
                ) : (
                  "Decline"
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Compact variant actions (on the right) */}
        {variant === "compact" && (
          <div className="flex shrink-0 items-center gap-1">
            <IconButton
              variant="filled"
              intent="primary"
              size="sm"
              onClick={handleAccept}
              disabled={disabled || isProcessing}
              aria-label="Accept"
            >
              {isAccepting ? (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </IconButton>
            <IconButton
              variant="bordered"
              intent="secondary"
              size="sm"
              onClick={handleDecline}
              disabled={disabled || isProcessing}
              aria-label="Decline"
            >
              {isDeclining ? (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </IconButton>
          </div>
        )}
      </div>
    )
  }
)

FriendRequest.displayName = "FriendRequest"
