"use client"

import React, { useState } from "react"
import { cn } from "utils/cn"
import { Avatar } from "../Avatar"
import { Badge } from "../Badge"
import { IconButton } from "../IconButton"

/**
 * FriendList Component - Apple Contacts/Messages-inspired Design
 *
 * Following Apple's Human Interface Guidelines:
 * - Clarity: Clean list with clear hierarchy and status indicators
 * - Deference: Content-focused with subtle interactive elements
 * - Depth: Smooth animations, layered information
 *
 * Features:
 * - Multiple variants (default/compact/card)
 * - Online status indicators
 * - Mutual friends count
 * - Last seen/activity time
 * - Action buttons (message, call, video)
 * - Selection states
 * - Search integration
 * - Alphabetical sections
 * - Empty states
 * - Loading skeleton
 * - Hover effects
 */

export interface Friend {
  id: string
  name: string
  avatar?: string
  username?: string
  status?: "online" | "offline" | "away" | "busy"
  lastSeen?: string
  mutualFriends?: number
  bio?: string
  isVerified?: boolean
  isFavorite?: boolean
}

export interface FriendListProps {
  friends: Friend[]
  onSelect?: (id: string) => void
  onMessage?: (id: string) => void
  onCall?: (id: string) => void
  onVideoCall?: (id: string) => void
  onRemove?: (id: string) => void
  selectedId?: string
  className?: string
  variant?: "default" | "compact" | "card"
  showActions?: boolean
  showStatus?: boolean
  showMutualFriends?: boolean
  showSections?: boolean
  loading?: boolean
  emptyMessage?: string
  searchQuery?: string
}

export const FriendList = React.forwardRef<HTMLDivElement, FriendListProps>(
  (
    {
      friends,
      onSelect,
      onMessage,
      onCall,
      onVideoCall,
      onRemove: _onRemove,
      selectedId,
      className,
      variant = "default",
      showActions = true,
      showStatus = true,
      showMutualFriends = true,
      showSections = false,
      loading = false,
      emptyMessage = "No friends yet",
      searchQuery = "",
    },
    ref
  ) => {
    const [hoveredId, setHoveredId] = useState<string | null>(null)

    // Filter friends by search query
    const filteredFriends = searchQuery
      ? friends.filter(
          (friend) =>
            friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            friend.username?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : friends

    // Group friends by first letter for sections
    const groupedFriends = showSections
      ? filteredFriends.reduce(
          (groups, friend) => {
            const firstLetter = friend.name[0]?.toUpperCase() || "#"
            if (!groups[firstLetter]) {
              groups[firstLetter] = []
            }
            groups[firstLetter].push(friend)
            return groups
          },
          {} as Record<string, Friend[]>
        )
      : {}

    const sections = showSections ? Object.keys(groupedFriends).sort() : []

    // Status indicator colors
    const getStatusColor = (status?: Friend["status"]) => {
      switch (status) {
        case "online":
          return "bg-[#34c759]" // Green
        case "away":
          return "bg-[#ff9500]" // Orange
        case "busy":
          return "bg-[#ff3b30]" // Red
        default:
          return "bg-neutral-400" // Gray
      }
    }

    // Format last seen
    const formatLastSeen = (lastSeen?: string) => {
      if (!lastSeen) return null
      // Simple formatting - could be enhanced with date-fns
      return lastSeen
    }

    // Render loading skeleton
    if (loading) {
      return (
        <div ref={ref} className={cn("space-y-2", className)}>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-3 rounded-xl p-3",
                variant === "card" && "border border-neutral-200 bg-white shadow-sm"
              )}
            >
              <div className="h-10 w-10 animate-pulse rounded-full bg-neutral-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-neutral-200" />
                <div className="h-3 w-24 animate-pulse rounded bg-neutral-200" />
              </div>
            </div>
          ))}
        </div>
      )
    }

    // Empty state
    if (filteredFriends.length === 0) {
      return (
        <div
          ref={ref}
          className={cn("flex flex-col items-center justify-center py-12 text-center", className)}
        >
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100">
            <svg className="h-10 w-10 text-neutral-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
          </div>
          <h3 className="mb-2 text-[17px] font-semibold text-neutral-900">
            {searchQuery ? "No results found" : emptyMessage}
          </h3>
          <p className="text-[15px] text-neutral-500">
            {searchQuery
              ? `No friends match "${searchQuery}"`
              : "Add friends to start connecting"}
          </p>
        </div>
      )
    }

    // Render friend item
    const renderFriend = (friend: Friend) => {
      const isSelected = selectedId === friend.id
      const isHovered = hoveredId === friend.id

      return (
        <li
          key={friend.id}
          onClick={() => onSelect?.(friend.id)}
          onMouseEnter={() => setHoveredId(friend.id)}
          onMouseLeave={() => setHoveredId(null)}
          className={cn(
            "group relative flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-all duration-200",
            variant === "default" && "hover:bg-neutral-100",
            variant === "compact" && "py-2 hover:bg-neutral-50",
            variant === "card" && "border border-neutral-200 bg-white shadow-sm hover:shadow-md",
            isSelected && "bg-[#0071e3] hover:bg-[#0071e3]"
          )}
        >
          {/* Avatar with status */}
          <div className="relative shrink-0">
            <Avatar
              src={friend.avatar}
              alt={friend.name}
              initials={friend.name.slice(0, 2).toUpperCase()}
              size={variant === "compact" ? "sm" : "md"}
            />
            {showStatus && friend.status && (
              <div
                className={cn(
                  "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white",
                  getStatusColor(friend.status)
                )}
              />
            )}
          </div>

          {/* Friend info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3
                className={cn(
                  "truncate text-[17px] font-semibold",
                  isSelected ? "text-white" : "text-neutral-900"
                )}
              >
                {friend.name}
              </h3>
              {friend.isVerified && (
                <svg
                  className={cn("h-4 w-4 shrink-0", isSelected ? "text-white" : "text-[#0071e3]")}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
                </svg>
              )}
              {friend.isFavorite && (
                <svg
                  className={cn("h-4 w-4 shrink-0", isSelected ? "text-white" : "text-[#ff3b30]")}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              )}
            </div>

            {variant !== "compact" && (
              <div className="mt-0.5 flex items-center gap-2">
                {friend.username && (
                  <span
                    className={cn(
                      "truncate text-[13px]",
                      isSelected ? "text-white/80" : "text-neutral-500"
                    )}
                  >
                    @{friend.username}
                  </span>
                )}
                {friend.status === "online" ? (
                  <span
                    className={cn(
                      "text-[13px] font-medium",
                      isSelected ? "text-white/90" : "text-[#34c759]"
                    )}
                  >
                    Active now
                  </span>
                ) : (
                  friend.lastSeen && (
                    <span
                      className={cn(
                        "truncate text-[13px]",
                        isSelected ? "text-white/70" : "text-neutral-400"
                      )}
                    >
                      {formatLastSeen(friend.lastSeen)}
                    </span>
                  )
                )}
              </div>
            )}

            {showMutualFriends && friend.mutualFriends && friend.mutualFriends > 0 && (
              <div className="mt-1 flex items-center gap-1">
                <svg
                  className={cn("h-3 w-3", isSelected ? "text-white/70" : "text-neutral-400")}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                </svg>
                <span
                  className={cn(
                    "text-[12px]",
                    isSelected ? "text-white/70" : "text-neutral-400"
                  )}
                >
                  {friend.mutualFriends} mutual
                </span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          {showActions && (isHovered || isSelected) && (
            <div className="flex shrink-0 items-center gap-1">
              {onMessage && (
                <IconButton
                  variant="plain"
                  intent={isSelected ? "secondary" : "secondary"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onMessage(friend.id)
                  }}
                  aria-label="Message"
                  className={isSelected ? "text-white hover:bg-white/20" : ""}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </IconButton>
              )}
              {onCall && (
                <IconButton
                  variant="plain"
                  intent={isSelected ? "secondary" : "secondary"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onCall(friend.id)
                  }}
                  aria-label="Call"
                  className={isSelected ? "text-white hover:bg-white/20" : ""}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </IconButton>
              )}
              {onVideoCall && (
                <IconButton
                  variant="plain"
                  intent={isSelected ? "secondary" : "secondary"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onVideoCall(friend.id)
                  }}
                  aria-label="Video call"
                  className={isSelected ? "text-white hover:bg-white/20" : ""}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 7l-7 5 7 5V7z" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </IconButton>
              )}
            </div>
          )}
        </li>
      )
    }

    return (
      <div ref={ref} className={className}>
        {showSections ? (
          // Sectioned list
          <div className="space-y-4">
            {sections.map((letter) => (
              <div key={letter}>
                <div className="sticky top-0 z-10 bg-white/80 py-1 backdrop-blur-sm">
                  <Badge variant="soft" size="sm">
                    {letter}
                  </Badge>
                </div>
                <ul className="mt-2 space-y-1">
                  {groupedFriends[letter]?.map(renderFriend)}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          // Simple list
          <ul className="space-y-1">{filteredFriends.map(renderFriend)}</ul>
        )}
      </div>
    )
  }
)

FriendList.displayName = "FriendList"
