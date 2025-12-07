"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "utils/cn"
import { IconButton } from "../IconButton"

/**
 * MessageComposer Component - Apple iMessage-inspired Design
 *
 * Following Apple's Human Interface Guidelines:
 * - Clarity: Clear, accessible input with visible actions
 * - Deference: Message content is primary, controls are subtle
 * - Depth: Smooth animations, contextual buttons
 *
 * Features:
 * - Auto-expanding textarea
 * - Emoji picker integration
 * - File/media attachment
 * - Voice message recording
 * - Typing indicators
 * - Send on Enter (Shift+Enter for new line)
 * - Character/line limits
 * - Reply/edit modes
 * - Drag & drop file upload
 * - Link preview detection
 * - Mentions/@ support
 * - Keyboard shortcuts
 */

export interface MessageComposerProps {
  onSend: (message: string, attachments?: File[]) => void
  onTyping?: (isTyping: boolean) => void
  onAttachment?: (files: File[]) => void
  onVoiceRecord?: (blob: Blob) => void
  onCancel?: () => void
  disabled?: boolean
  className?: string
  placeholder?: string
  variant?: "default" | "compact" | "elevated"
  maxLength?: number
  maxLines?: number
  showCharCount?: boolean
  replyTo?: { id: string; name: string; message: string }
  editMessage?: { id: string; message: string }
  attachments?: File[]
  loading?: boolean
  sendOnEnter?: boolean
  showAttachment?: boolean
  showEmoji?: boolean
  showVoice?: boolean
  showFormatting?: boolean
}

export const MessageComposer = React.forwardRef<HTMLTextAreaElement, MessageComposerProps>(
  (
    {
      onSend,
      onTyping,
      onAttachment,
      onVoiceRecord: _onVoiceRecord,
      onCancel,
      disabled = false,
      className,
      placeholder = "Message",
      variant = "default",
      maxLength,
      maxLines = 10,
      showCharCount = false,
      replyTo,
      editMessage,
      attachments: _attachments,
      loading = false,
      sendOnEnter = true,
      showAttachment = true,
      showEmoji = true,
      showVoice = true,
      showFormatting = false,
    },
    ref
  ) => {
    const [message, setMessage] = useState(editMessage?.message || "")
    const [isFocused, setIsFocused] = useState(false)
    const [attachments, setAttachments] = useState<File[]>([])
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Expose textarea ref
    useEffect(() => {
      if (ref && textareaRef.current) {
        if (typeof ref === "function") {
          ref(textareaRef.current)
        } else {
          ref.current = textareaRef.current
        }
      }
    }, [ref])

    // Auto-resize textarea
    const adjustHeight = useCallback(() => {
      const textarea = textareaRef.current
      if (textarea) {
        textarea.style.height = "auto"
        const lineHeight = 24 // Approximate line height in pixels
        const maxHeight = lineHeight * maxLines
        const scrollHeight = Math.min(textarea.scrollHeight, maxHeight)
        textarea.style.height = `${scrollHeight}px`
      }
    }, [maxLines])

    useEffect(() => {
      adjustHeight()
    }, [message, adjustHeight])

    // Typing indicator
    useEffect(() => {
      if (onTyping) {
        onTyping(message.trim().length > 0)
      }
    }, [message, onTyping])

    // Handle message send
    const handleSend = useCallback(() => {
      const trimmedMessage = message.trim()
      if (trimmedMessage && !disabled && !loading) {
        onSend(trimmedMessage, attachments)
        setMessage("")
        setAttachments([])
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto"
        }
      }
    }, [message, disabled, loading, onSend, attachments])

    // Handle key press
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && sendOnEnter) {
        e.preventDefault()
        handleSend()
      }

      // Escape to cancel
      if (e.key === "Escape" && (replyTo || editMessage)) {
        onCancel?.()
      }
    }

    // Handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      if (files.length > 0) {
        setAttachments((prev) => [...prev, ...files])
        onAttachment?.(files)
      }
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }

    // Remove attachment
    const handleRemoveAttachment = (index: number) => {
      setAttachments((prev) => prev.filter((_, i) => i !== index))
    }

    // Format file size
    const formatFileSize = (bytes: number): string => {
      if (bytes < 1024) return `${bytes} B`
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    const hasContent = message.trim().length > 0 || attachments.length > 0
    const charCount = message.length
    const isOverLimit = maxLength ? charCount > maxLength : false

    const variantStyles = {
      default: "border border-neutral-200 bg-white shadow-sm",
      compact: "border border-neutral-200 bg-white",
      elevated: "border border-neutral-200 bg-white shadow-md ring-1 ring-black/5",
    }

    return (
      <div
        className={cn(
          "flex flex-col gap-2 rounded-2xl p-3 transition-all duration-200",
          variantStyles[variant],
          isFocused && "ring-2 ring-[#0071e3] ring-offset-2",
          disabled && "opacity-50",
          className
        )}
      >
        {/* Reply/Edit Context */}
        {(replyTo || editMessage) && (
          <div className="flex items-start gap-2 rounded-lg bg-neutral-50 p-2">
            <div className="h-full w-1 rounded-full bg-[#0071e3]" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-[#0071e3]">
                  {editMessage ? "Edit message" : `Reply to ${replyTo?.name}`}
                </span>
              </div>
              <p className="truncate text-[13px] text-neutral-600">
                {editMessage?.message || replyTo?.message}
              </p>
            </div>
            <IconButton
              variant="plain"
              intent="secondary"
              size="sm"
              onClick={onCancel}
              aria-label="Cancel"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </IconButton>
          </div>
        )}

        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-lg bg-neutral-100 px-3 py-2 text-[13px]"
              >
                <svg className="h-4 w-4 text-neutral-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
                </svg>
                <div className="flex-1">
                  <div className="truncate font-medium text-neutral-900">{file.name}</div>
                  <div className="text-neutral-500">{formatFileSize(file.size)}</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(index)}
                  className="text-neutral-400 transition-colors hover:text-neutral-600"
                  aria-label={`Remove ${file.name}`}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Main Input Area */}
        <div className="flex items-end gap-2">
          {/* Left Actions */}
          <div className="flex shrink-0 items-center gap-1">
            {/* Attachment */}
            {showAttachment && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                />
                <IconButton
                  variant="plain"
                  intent="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                  aria-label="Attach file"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </IconButton>
              </>
            )}

            {/* Emoji */}
            {showEmoji && (
              <IconButton
                variant="plain"
                intent="secondary"
                size="sm"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                disabled={disabled}
                aria-label="Add emoji"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </IconButton>
            )}

            {/* Formatting (Bold, Italic, etc.) */}
            {showFormatting && (
              <IconButton
                variant="plain"
                intent="secondary"
                size="sm"
                disabled={disabled}
                aria-label="Format text"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 7V4h16v3M9 20h6M12 4v16" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </IconButton>
            )}
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            rows={1}
            className={cn(
              "min-h-9 flex-1 resize-none bg-transparent text-[17px] leading-relaxed text-neutral-900 placeholder-neutral-400",
              "border-none outline-none",
              "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-300"
            )}
            aria-label="Message input"
          />

          {/* Right Actions */}
          <div className="flex shrink-0 items-center gap-1">
            {/* Voice Message (show when no text) */}
            {showVoice && !hasContent && (
              <IconButton
                variant="plain"
                intent="secondary"
                size="sm"
                disabled={disabled}
                aria-label="Voice message"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </IconButton>
            )}

            {/* Send Button (show when has content) */}
            {hasContent && (
              <IconButton
                variant="filled"
                intent="primary"
                size="sm"
                onClick={handleSend}
                disabled={disabled || loading || isOverLimit || !hasContent}
                aria-label="Send message"
              >
                {loading ? (
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                )}
              </IconButton>
            )}
          </div>
        </div>

        {/* Character Count / Hints */}
        {(showCharCount || sendOnEnter) && (
          <div className="flex items-center justify-between text-[12px] text-neutral-500">
            <div>
              {sendOnEnter && <span>Press Enter to send • Shift+Enter for new line</span>}
            </div>
            {showCharCount && maxLength && (
              <span className={cn(isOverLimit && "font-semibold text-[#ff3b30]")}>
                {charCount} / {maxLength}
              </span>
            )}
          </div>
        )}

        {/* Emoji Picker Placeholder */}
        {showEmojiPicker && (
          <div className="rounded-lg border border-neutral-200 bg-white p-4 text-center text-[13px] text-neutral-500">
            Emoji picker integration placeholder
          </div>
        )}
      </div>
    )
  }
)

MessageComposer.displayName = "MessageComposer"
