import type { Meta, StoryObj } from "@storybook/react"
import React from "react"
import { MessageComposer } from "./MessageComposer"

const meta: Meta<typeof MessageComposer> = {
  title: "Components/MessageComposer",
  component: MessageComposer,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "compact", "elevated"],
    },
    onSend: { action: "message sent" },
    onTyping: { action: "typing status changed" },
    onAttachment: { action: "attachment added" },
    onVoiceRecord: { action: "voice recorded" },
    onCancel: { action: "cancelled" },
  },
}

export default meta
type Story = StoryObj<typeof MessageComposer>

/**
 * Default message composer with all features enabled.
 */
export const Default: Story = {
  args: {
    placeholder: "Message",
    variant: "default",
    showAttachment: true,
    showEmoji: true,
    showVoice: true,
    sendOnEnter: true,
  },
}

/**
 * Compact variant for smaller spaces.
 */
export const Compact: Story = {
  args: {
    ...Default.args,
    variant: "compact",
  },
}

/**
 * Elevated variant with shadow.
 */
export const Elevated: Story = {
  args: {
    ...Default.args,
    variant: "elevated",
  },
}

/**
 * Disabled state prevents interaction.
 */
export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
}

/**
 * Loading state shows spinner in send button.
 */
export const Loading: Story = {
  args: {
    ...Default.args,
    loading: true,
  },
}

/**
 * Reply mode shows context of message being replied to.
 */
export const ReplyMode: Story = {
  args: {
    ...Default.args,
    replyTo: {
      id: "1",
      name: "Sarah Wilson",
      message: "Hey! Are we still on for lunch tomorrow?",
    },
  },
}

/**
 * Edit mode shows message being edited.
 */
export const EditMode: Story = {
  args: {
    ...Default.args,
    editMessage: {
      id: "1",
      message: "I'll be there at 12:30pm!",
    },
  },
}

/**
 * With character counter and limit.
 */
export const WithCharacterLimit: Story = {
  args: {
    ...Default.args,
    maxLength: 280,
    showCharCount: true,
  },
}

/**
 * With line limit for textarea.
 */
export const WithLineLimit: Story = {
  args: {
    ...Default.args,
    maxLines: 5,
  },
}

/**
 * With attachments preview.
 */
export const WithAttachments: Story = {
  args: {
    ...Default.args,
    attachments: [
      new File([""], "photo.jpg", { type: "image/jpeg" }),
      new File([""], "document.pdf", { type: "application/pdf" }),
    ],
  },
}

/**
 * Without attachment button.
 */
export const NoAttachment: Story = {
  args: {
    ...Default.args,
    showAttachment: false,
  },
}

/**
 * Without emoji button.
 */
export const NoEmoji: Story = {
  args: {
    ...Default.args,
    showEmoji: false,
  },
}

/**
 * Without voice button.
 */
export const NoVoice: Story = {
  args: {
    ...Default.args,
    showVoice: false,
  },
}

/**
 * With formatting toolbar.
 */
export const WithFormatting: Story = {
  args: {
    ...Default.args,
    showFormatting: true,
  },
}

/**
 * Minimal composer with only send functionality.
 */
export const Minimal: Story = {
  args: {
    ...Default.args,
    showAttachment: false,
    showEmoji: false,
    showVoice: false,
    showCharCount: false,
  },
}

/**
 * Custom placeholder text.
 */
export const CustomPlaceholder: Story = {
  args: {
    ...Default.args,
    placeholder: "Type your message here...",
  },
}

/**
 * Send on Shift+Enter instead of Enter.
 */
export const ShiftEnterToSend: Story = {
  args: {
    ...Default.args,
    sendOnEnter: false,
  },
}

/**
 * All features enabled - reply, attachments, formatting.
 */
export const FullyLoaded: Story = {
  args: {
    ...Default.args,
    replyTo: {
      id: "1",
      name: "Alex Chen",
      message: "Can you send me those files?",
    },
    attachments: [
      new File([""], "report_Q4.pdf", { type: "application/pdf" }),
      new File([""], "presentation.pptx", { type: "application/vnd.ms-powerpoint" }),
    ],
    maxLength: 500,
    showCharCount: true,
    showFormatting: true,
  },
}

/**
 * Interactive demo with state management.
 */
export const Interactive: Story = {
  render: () => {
    const [messages, setMessages] = React.useState<string[]>([])
    const [isTyping, setIsTyping] = React.useState(false)

    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <h3 className="mb-2 text-sm font-semibold">Messages:</h3>
          {messages.length === 0 ? (
            <p className="text-sm text-neutral-500">No messages yet</p>
          ) : (
            <ul className="space-y-2">
              {messages.map((msg, i) => (
                <li key={i} className="rounded-lg bg-[#0071e3] px-3 py-2 text-sm text-white">
                  {msg}
                </li>
              ))}
            </ul>
          )}
          {isTyping && <p className="mt-2 text-xs italic text-neutral-500">Typing...</p>}
        </div>
        <MessageComposer
          onSend={(msg) => setMessages([...messages, msg])}
          onTyping={setIsTyping}
          placeholder="Message"
        />
      </div>
    )
  },
}

/**
 * Dark theme variant.
 */
export const DarkTheme: Story = {
  args: {
    ...Default.args,
  },
  decorators: [
    (Story) => (
      <div className="rounded-xl bg-neutral-900 p-6">
        <Story />
      </div>
    ),
  ],
}

/**
 * Mobile view (smaller width).
 */
export const Mobile: Story = {
  args: {
    ...Default.args,
    variant: "compact",
  },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-sm">
        <Story />
      </div>
    ),
  ],
}
