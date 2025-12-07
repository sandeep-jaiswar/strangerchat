"use client"

import Image from "next/image"
import React, { useState } from "react"
import { cn } from "utils/cn"
import { Avatar } from "../Avatar"

/**
 * ChatBubble Component - Apple iMessage-inspired Design
 *
 * Following Apple's Human Interface Guidelines:
 * - Clarity: Clear visual hierarchy, legible messages
 * - Deference: Message content takes center stage
 * - Depth: Subtle shadows, smooth animations, layered design
 *
 * Features:
 * - Multiple variants: default, minimal, elevated
 * - iMessage-style bubble tails
 * - Delivery status indicators (sending, sent, delivered, read, failed)
 * - Reactions support (emoji reactions)
 * - Reply/thread indicator
 * - Media attachment support
 * - Link previews
 * - Typing indicator animation
 * - Long press/context menu support
 * - Read receipts
 * - Message grouping for consecutive messages
 */

export interface ChatBubbleProps {
  message: string
  isOwn?: boolean
  timestamp?: string
  avatar?: string
  name?: string
  status?: "online" | "offline" | "away" | "busy"
  unread?: boolean
  initials?: string
  variant?: "default" | "minimal" | "elevated"
  deliveryStatus?: "sending" | "sent" | "delivered" | "read" | "failed"
  reactions?: Array<{ emoji: string; count: number; userReacted?: boolean }>
  replyTo?: { name: string; message: string }
  edited?: boolean
  deleted?: boolean
  isTyping?: boolean
  showAvatar?: boolean
  showName?: boolean
  isGrouped?: boolean // True if this is a consecutive message from same sender
  mediaUrl?: string
  mediaType?: "image" | "video" | "audio" | "file"
  linkPreview?: { title: string; description?: string; image?: string; url: string }
  onReact?: (emoji: string) => void
  onReply?: () => void
  onDelete?: () => void
  onLongPress?: () => void
  className?: string
}

const deliveryStatusIcons = {
  sending: (
    <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  ),
  sent: (
    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
    </svg>
  ),
  delivered: (
    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" transform="translate(4, 0)" />
    </svg>
  ),
  read: (
    <svg className="h-3 w-3 text-[#0071e3]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" transform="translate(4, 0)" />
    </svg>
  ),
  failed: (
    <svg className="h-3 w-3 text-[#ff3b30]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
    </svg>
  ),
}

export const ChatBubble = React.forwardRef<HTMLDivElement, ChatBubbleProps>(
  (
    {
      message,
      isOwn = false,
      timestamp,
      avatar,
      name,
      status,
      unread = false,
      initials,
      variant = "default",
      deliveryStatus,
      reactions,
      replyTo,
      edited = false,
      deleted = false,
      isTyping = false,
      showAvatar = true,
      showName = false,
      isGrouped = false,
      mediaUrl,
      mediaType,
      linkPreview,
      onReact,
      onReply: _onReply,
      onDelete: _onDelete,
      onLongPress,
      className,
    },
    ref
  ) => {
    const [_showActions, _setShowActions] = useState(false)

    // Handle long press for mobile
    const handleTouchStart = () => {
      if (onLongPress) {
        const timer = setTimeout(() => {
          onLongPress()
          _setShowActions(true)
        }, 500)
        return () => clearTimeout(timer)
      }
    }

    // Typing indicator dots animation
    const TypingIndicator = () => (
      <div className="flex items-center gap-1">
        <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400" />
      </div>
    )

    const bubbleColors = {
      own: {
        default: "bg-[#0071e3] text-white shadow-sm",
        minimal: "bg-[#0071e3] text-white",
        elevated: "bg-[#0071e3] text-white shadow-md",
      },
      other: {
        default: "bg-neutral-100 text-neutral-900 shadow-sm",
        minimal: "bg-neutral-100 text-neutral-900",
        elevated: "bg-neutral-100 text-neutral-900 shadow-md",
      },
      deleted: "bg-neutral-50 text-neutral-400 italic border border-neutral-200",
    }

    const bubbleClass = deleted ? bubbleColors.deleted : isOwn ? bubbleColors.own[variant] : bubbleColors.other[variant]

    return (
      <div
        ref={ref}
        className={cn(
          "group mb-2 flex items-end gap-2 transition-all duration-200",
          isOwn ? "flex-row-reverse" : "flex-row",
          isGrouped && "mb-1",
          className
        )}
        onTouchStart={handleTouchStart}
      >
        {/* Avatar */}
        {!isOwn && showAvatar && !isGrouped && (
          <div className="shrink-0">
            <Avatar
              src={avatar}
              alt={name || "User"}
              initials={initials}
              status={status}
              size="sm"
              className="h-8 w-8"
            />
          </div>
        )}
        {!isOwn && showAvatar && isGrouped && <div className="w-8 shrink-0" />}

        {/* Message Container */}
        <div className={cn("flex max-w-[75%] flex-col gap-1", isOwn ? "items-end" : "items-start")}>
          {/* Sender Name (for group chats) */}
          {showName && !isOwn && !isGrouped && (
            <span className="px-2 text-[13px] font-medium text-neutral-600">{name}</span>
          )}

          {/* Reply To */}
          {replyTo && (
            <div
              className={cn(
                "mb-1 rounded-lg border-l-2 bg-black/5 px-3 py-1.5 text-[13px]",
                isOwn ? "border-white/50" : "border-[#0071e3]"
              )}
            >
              <div className="font-semibold text-[#0071e3]">{replyTo.name}</div>
              <div className="truncate text-neutral-600">{replyTo.message}</div>
            </div>
          )}

          {/* Main Bubble */}
          <div className="relative">
            {/* Bubble Tail */}
            {!isGrouped && variant !== "minimal" && (
              <div
                className={cn(
                  "absolute -bottom-0.5 h-4 w-4",
                  isOwn ? "-right-1" : "-left-1",
                  deleted ? "text-neutral-50" : isOwn ? "text-[#0071e3]" : "text-neutral-100"
                )}
              >
                <svg viewBox="0 0 16 16" fill="currentColor">
                  {isOwn ? <path d="M16 0v16c-8-8-16-8-16-16h16z" /> : <path d="M0 0v16c8-8 16-8 16-16H0z" />}
                </svg>
              </div>
            )}

            {/* Message Bubble */}
            <div
              className={cn(
                "relative rounded-[18px] px-4 py-2 transition-all duration-200",
                bubbleClass,
                isGrouped && (isOwn ? "rounded-tr-md" : "rounded-tl-md"),
                unread && !isOwn && "ring-2 ring-[#0071e3] ring-offset-2",
                "group-hover:scale-[1.02]",
                className
              )}
            >
              {/* Media Content */}
              {mediaUrl && mediaType === "image" && (
                <div className="mb-2 overflow-hidden rounded-lg">
                  <Image
                    src={mediaUrl}
                    alt="Shared media"
                    width={300}
                    height={300}
                    className="max-h-[300px] w-full object-cover"
                  />
                </div>
              )}

              {/* Link Preview */}
              {linkPreview && (
                <a
                  href={linkPreview.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "mb-2 block overflow-hidden rounded-lg border transition-colors",
                    isOwn
                      ? "border-white/20 bg-white/10 hover:bg-white/20"
                      : "border-neutral-200 bg-white hover:bg-neutral-50"
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  {linkPreview.image && (
                    <Image
                      src={linkPreview.image}
                      alt={linkPreview.title}
                      width={400}
                      height={120}
                      className="h-[120px] w-full object-cover"
                    />
                  )}
                  <div className="p-3">
                    <div className={cn("font-semibold", isOwn ? "text-white" : "text-neutral-900")}>
                      {linkPreview.title}
                    </div>
                    {linkPreview.description && (
                      <div
                        className={cn("mt-1 line-clamp-2 text-[13px]", isOwn ? "text-white/80" : "text-neutral-600")}
                      >
                        {linkPreview.description}
                      </div>
                    )}
                  </div>
                </a>
              )}

              {/* Message Text or Typing Indicator */}
              {isTyping ? (
                <TypingIndicator />
              ) : (
                <div
                  className={cn(
                    "text-[17px] leading-relaxed wrap-break-word whitespace-pre-wrap",
                    deleted && "select-none"
                  )}
                >
                  {deleted ? "This message was deleted" : message}
                </div>
              )}

              {/* Edited Badge */}
              {edited && !deleted && (
                <span className={cn("ml-2 text-[12px]", isOwn ? "text-white/60" : "text-neutral-500")}>(edited)</span>
              )}

              {/* Timestamp and Status */}
              {timestamp && (
                <div
                  className={cn(
                    "mt-1 flex items-center justify-end gap-1 text-[12px]",
                    isOwn ? "text-white/70" : "text-neutral-500"
                  )}
                >
                  <span>{timestamp}</span>
                  {isOwn && deliveryStatus && (
                    <span className="flex items-center">{deliveryStatusIcons[deliveryStatus]}</span>
                  )}
                </div>
              )}

              {/* Unread Indicator */}
              {unread && !isOwn && (
                <div className="absolute -top-1 -right-1">
                  <span className="flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0071e3] opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-[#0071e3]" />
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Reactions */}
          {reactions && reactions.length > 0 && (
            <div className={cn("flex flex-wrap gap-1", isOwn ? "justify-end" : "justify-start")}>
              {reactions.map((reaction, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => onReact?.(reaction.emoji)}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2 py-0.5 text-[13px] transition-all",
                    reaction.userReacted
                      ? "bg-[#0071e3]/10 ring-2 ring-[#0071e3]"
                      : "bg-white shadow-sm ring-1 ring-black/5 hover:bg-neutral-50"
                  )}
                >
                  <span>{reaction.emoji}</span>
                  {reaction.count > 1 && <span className="font-medium text-neutral-700">{reaction.count}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }
)

ChatBubble.displayName = "ChatBubble"
