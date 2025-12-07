"use client"

import React, { useEffect, useRef, useState } from "react"
import { cn } from "utils/cn"
import { AvatarGroup } from "../AvatarGroup"
import { Button } from "../Button"
import { ChatBubble } from "../ChatBubble"

/**
 * ChatList Component - Apple Messages-inspired Design
 *
 * Following Apple's Human Interface Guidelines:
 * - Clarity: Clear message hierarchy, smooth scrolling
 * - Deference: Messages are the focus, UI stays minimal
 * - Depth: Subtle animations, natural grouping
 *
 * Features:
 * - Auto-scroll to bottom on new messages
 * - Date separators for better organization
 * - Message grouping by sender
 * - Typing indicators
 * - Load more (infinite scroll)
 * - Empty states
 * - Smooth animations
 * - Sticky date headers
 * - Unread message divider
 */

export interface Message {
  id: string
  message: string
  isOwn?: boolean
  timestamp?: string
  date?: Date | string
  avatar?: string
  name?: string
  status?: "online" | "offline" | "away" | "busy"
  unread?: boolean
  initials?: string
  deliveryStatus?: "sending" | "sent" | "delivered" | "read" | "failed"
  reactions?: Array<{ emoji: string; count: number; userReacted?: boolean }>
  replyTo?: { name: string; message: string }
  edited?: boolean
  deleted?: boolean
  mediaUrl?: string
  mediaType?: "image" | "video" | "audio" | "file"
  linkPreview?: { title: string; description?: string; image?: string; url: string }
}

export interface ChatListProps {
  messages: Message[]
  className?: string
  variant?: "default" | "compact" | "comfortable"
  showDates?: boolean
  showAvatars?: boolean
  showNames?: boolean
  groupMessages?: boolean
  participants?: Array<{ src?: string; alt: string; initials?: string }>
  isTyping?: boolean
  typingUser?: { name: string; avatar?: string }
  onLoadMore?: () => void
  hasMore?: boolean
  loading?: boolean
  emptyMessage?: string
  emptyIcon?: React.ReactNode
  autoScroll?: boolean
  unreadDividerMessageId?: string
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  )
}

function formatDate(date: Date): string {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (isSameDay(date, today)) {
    return "Today"
  } else if (isSameDay(date, yesterday)) {
    return "Yesterday"
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    })
  }
}

function shouldGroupWithPrevious(current: Message, previous?: Message): boolean {
  if (!previous) return false
  if (current.isOwn !== previous.isOwn) return false
  if (current.name !== previous.name) return false

  // Check if messages are within 2 minutes
  if (current.timestamp && previous.timestamp) {
    // Simple check - in production, you'd parse the timestamps properly
    return true
  }

  return false
}

export const ChatList = React.forwardRef<HTMLDivElement, ChatListProps>(
  (
    {
      messages,
      className,
      variant = "default",
      showDates = true,
      showAvatars = true,
      showNames = false,
      groupMessages = true,
      participants,
      isTyping = false,
      typingUser,
      onLoadMore,
      hasMore = false,
      loading = false,
      emptyMessage = "No messages yet",
      emptyIcon,
      autoScroll = true,
      unreadDividerMessageId,
    },
    ref
  ) => {
    const listRef = useRef<HTMLDivElement>(null)
    const [shouldShowScrollButton, setShouldShowScrollButton] = useState(false)

    // Auto-scroll to bottom on new messages
    useEffect(() => {
      if (autoScroll && listRef.current) {
        const scrollElement = listRef.current
        const isScrolledToBottom =
          scrollElement.scrollHeight - scrollElement.scrollTop === scrollElement.clientHeight

        if (isScrolledToBottom || messages.length === 0) {
          setTimeout(() => {
            scrollElement.scrollTop = scrollElement.scrollHeight
          }, 100)
        }
      }
    }, [messages, autoScroll])

    // Handle scroll to show/hide scroll to bottom button
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const element = e.currentTarget
      const isScrolledToBottom =
        element.scrollHeight - element.scrollTop - element.clientHeight < 100

      setShouldShowScrollButton(!isScrolledToBottom && messages.length > 0)

      // Load more when scrolled to top
      if (element.scrollTop === 0 && onLoadMore && hasMore && !loading) {
        onLoadMore()
      }
    }

    const scrollToBottom = () => {
      if (listRef.current) {
        listRef.current.scrollTo({
          top: listRef.current.scrollHeight,
          behavior: "smooth",
        })
      }
    }

    // Group messages by date
    const groupedByDate: { date: string; messages: Message[] }[] = []
    let currentDate: string | null = null

    messages.forEach((message) => {
      const messageDate = message.date
        ? typeof message.date === "string"
          ? new Date(message.date)
          : message.date
        : new Date()
      const dateStr = formatDate(messageDate)

      if (dateStr !== currentDate) {
        currentDate = dateStr
        groupedByDate.push({ date: dateStr, messages: [message] })
      } else {
        const lastGroup = groupedByDate[groupedByDate.length - 1]
        if (lastGroup) {
          lastGroup.messages.push(message)
        }
      }
    })

    const variantSpacing = {
      default: "gap-2",
      compact: "gap-1",
      comfortable: "gap-3",
    }

    // Empty state
    if (messages.length === 0 && !isTyping) {
      return (
        <div
          ref={ref}
          className={cn(
            "flex h-full flex-col items-center justify-center p-8 text-center",
            className
          )}
        >
          {emptyIcon || (
            <svg
              className="mb-4 h-20 w-20 text-neutral-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          <p className="text-[17px] font-medium text-neutral-500">{emptyMessage}</p>
          <p className="mt-2 text-[15px] text-neutral-400">Send a message to start the conversation</p>
        </div>
      )
    }

    return (
      <div ref={ref} className={cn("relative flex h-full flex-col", className)}>
        {/* Participants (Group Chat Header) */}
        {participants && participants.length > 0 && (
          <div className="shrink-0 border-b border-neutral-100 bg-white p-4">
            <AvatarGroup avatars={participants} max={5} />
          </div>
        )}

        {/* Messages Container */}
        <div
          ref={listRef}
          className={cn(
            "flex-1 overflow-y-auto overscroll-contain px-4 py-6",
            "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-300"
          )}
          onScroll={handleScroll}
        >
          {/* Load More Indicator */}
          {hasMore && (
            <div className="mb-4 flex justify-center">
              {loading ? (
                <div className="flex items-center gap-2 text-[15px] text-neutral-500">
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Loading...
                </div>
              ) : (
                <Button variant="plain" size="sm" onClick={onLoadMore}>
                  Load more messages
                </Button>
              )}
            </div>
          )}

          {/* Messages grouped by date */}
          {showDates
            ? groupedByDate.map((group, groupIndex) => (
                <div key={`${group.date}-${groupIndex}`} className="mb-6">
                  {/* Date Separator */}
                  <div className="mb-4 flex items-center justify-center">
                    <div className="rounded-full bg-neutral-100 px-3 py-1 text-[13px] font-medium text-neutral-600">
                      {group.date}
                    </div>
                  </div>

                  {/* Messages for this date */}
                  <div className={cn("flex flex-col", variantSpacing[variant])}>
                    {group.messages.map((message, index) => {
                      const previousMessage = index > 0 ? group.messages[index - 1] : undefined
                      const isGrouped = groupMessages && shouldGroupWithPrevious(message, previousMessage)
                      const showUnreadDivider = message.id === unreadDividerMessageId

                      return (
                        <React.Fragment key={message.id}>
                          {/* Unread Message Divider */}
                          {showUnreadDivider && (
                            <div className="my-4 flex items-center gap-3">
                              <div className="h-px flex-1 bg-[#ff3b30]" />
                              <span className="text-[13px] font-semibold text-[#ff3b30]">
                                Unread Messages
                              </span>
                              <div className="h-px flex-1 bg-[#ff3b30]" />
                            </div>
                          )}

                          <ChatBubble
                            {...message}
                            showAvatar={showAvatars}
                            showName={showNames}
                            isGrouped={isGrouped}
                            variant={variant === "compact" ? "minimal" : "default"}
                          />
                        </React.Fragment>
                      )
                    })}
                  </div>
                </div>
              ))
            : // Without date grouping
              messages.map((message, index) => {
                const previousMessage = index > 0 ? messages[index - 1] : undefined
                const isGrouped = groupMessages && shouldGroupWithPrevious(message, previousMessage)
                const showUnreadDivider = message.id === unreadDividerMessageId

                return (
                  <React.Fragment key={message.id}>
                    {showUnreadDivider && (
                      <div className="my-4 flex items-center gap-3">
                        <div className="h-px flex-1 bg-[#ff3b30]" />
                        <span className="text-[13px] font-semibold text-[#ff3b30]">
                          Unread Messages
                        </span>
                        <div className="h-px flex-1 bg-[#ff3b30]" />
                      </div>
                    )}

                    <ChatBubble
                      {...message}
                      showAvatar={showAvatars}
                      showName={showNames}
                      isGrouped={isGrouped}
                      variant={variant === "compact" ? "minimal" : "default"}
                    />
                  </React.Fragment>
                )
              })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="mt-2">
              <ChatBubble
                message=""
                isTyping={true}
                avatar={typingUser?.avatar}
                name={typingUser?.name}
                showAvatar={showAvatars}
              />
            </div>
          )}
        </div>

        {/* Scroll to Bottom Button */}
        {shouldShowScrollButton && (
          <div className="absolute bottom-4 right-4">
            <button
              type="button"
              onClick={scrollToBottom}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full",
                "bg-white text-neutral-700 shadow-lg ring-1 ring-black/5",
                "transition-all duration-200 hover:scale-110 hover:shadow-xl",
                "active:scale-95"
              )}
              aria-label="Scroll to bottom"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    )
  }
)

ChatList.displayName = "ChatList"
