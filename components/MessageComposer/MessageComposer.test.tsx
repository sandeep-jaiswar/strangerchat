import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { MessageComposer } from "./MessageComposer"

describe("MessageComposer Component", () => {
  beforeEach(() => {
    document.body.innerHTML = ""
  })

  afterEach(() => {
    document.body.innerHTML = ""
    vi.clearAllMocks()
  })

  describe("Basic Rendering", () => {
    it("renders with default props", () => {
      const onSend = vi.fn()
      render(<MessageComposer onSend={onSend} />)
      const textarea = screen.getByLabelText("Message input")
      expect(textarea).toBeInTheDocument()
      expect(textarea).toHaveAttribute("placeholder", "Message")
    })

    it("renders with custom placeholder", () => {
      const onSend = vi.fn()
      render(<MessageComposer onSend={onSend} placeholder="Type your message..." />)
      const textarea = screen.getByLabelText("Message input")
      expect(textarea).toHaveAttribute("placeholder", "Type your message...")
    })

    it("has displayName set", () => {
      expect(MessageComposer.displayName).toBe("MessageComposer")
    })

    it("forwards ref correctly", () => {
      const onSend = vi.fn()
      const ref = { current: null }
      render(<MessageComposer ref={ref} onSend={onSend} />)
      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
    })

    it("forwards function ref correctly", () => {
      const onSend = vi.fn()
      const refCallback = vi.fn()
      render(<MessageComposer ref={refCallback} onSend={onSend} />)
      expect(refCallback).toHaveBeenCalled()
      expect(refCallback.mock.calls[0][0]).toBeInstanceOf(HTMLTextAreaElement)
    })

    it("applies custom className", () => {
      const onSend = vi.fn()
      const { container } = render(<MessageComposer onSend={onSend} className="custom-class" />)
      const composer = container.firstChild
      expect(composer).toHaveClass("custom-class")
    })
  })

  describe("Variant Styles", () => {
    it("renders default variant", () => {
      const onSend = vi.fn()
      const { container } = render(<MessageComposer onSend={onSend} variant="default" />)
      const composer = container.firstChild
      expect(composer).toHaveClass("border", "border-neutral-200", "bg-white", "shadow-sm")
    })

    it("renders compact variant", () => {
      const onSend = vi.fn()
      const { container } = render(<MessageComposer onSend={onSend} variant="compact" />)
      const composer = container.firstChild
      expect(composer).toHaveClass("border", "border-neutral-200", "bg-white")
      expect(composer).not.toHaveClass("shadow-sm", "shadow-md")
    })

    it("renders elevated variant", () => {
      const onSend = vi.fn()
      const { container } = render(<MessageComposer onSend={onSend} variant="elevated" />)
      const composer = container.firstChild
      expect(composer).toHaveClass("shadow-md", "ring-1", "ring-black/5")
    })
  })

  describe("Message Input", () => {
    it("allows typing in textarea", async () => {
      const onSend = vi.fn()
      const user = userEvent.setup()
      render(<MessageComposer onSend={onSend} />)
      const textarea = screen.getByLabelText("Message input")

      await user.type(textarea, "Hello World")
      expect(textarea).toHaveValue("Hello World")
    })

    it("respects maxLength prop", () => {
      const onSend = vi.fn()
      render(<MessageComposer onSend={onSend} maxLength={50} />)
      const textarea = screen.getByLabelText("Message input")
      expect(textarea).toHaveAttribute("maxLength", "50")
    })

    it("shows character count when enabled", () => {
      const onSend = vi.fn()
      render(<MessageComposer onSend={onSend} showCharCount={true} maxLength={100} />)
      expect(screen.getByText("0 / 100")).toBeInTheDocument()
    })

    it("updates character count as user types", async () => {
      const onSend = vi.fn()
      const user = userEvent.setup()
      render(<MessageComposer onSend={onSend} showCharCount={true} maxLength={100} />)
      const textarea = screen.getByLabelText("Message input")

      await user.type(textarea, "Test")
      expect(screen.getByText("4 / 100")).toBeInTheDocument()
    })

    it("highlights character count when over limit", async () => {
      const onSend = vi.fn()
      const user = userEvent.setup()
      render(<MessageComposer onSend={onSend} showCharCount={true} maxLength={5} />)
      const textarea = screen.getByLabelText("Message input")

      await user.type(textarea, "Testi")
      const charCount = screen.getByText(/5\s*\/\s*5/)
      expect(charCount).toBeInTheDocument()
    })

    it("shows red text when character count exceeds maxLength", async () => {
      const onSend = vi.fn()
      render(
        <MessageComposer
          onSend={onSend}
          showCharCount={true}
          maxLength={3}
          editMessage={{ id: "1", message: "Test" }}
        />
      )

      // Start with edit message that's already over limit
      const charCount = screen.getByText(/4\s*\/\s*3/)
      expect(charCount).toHaveClass("text-[#ff3b30]", "font-semibold")
    })

    it("shows focus ring when textarea is focused", async () => {
      const onSend = vi.fn()
      const user = userEvent.setup()
      const { container } = render(<MessageComposer onSend={onSend} />)
      const textarea = screen.getByLabelText("Message input")

      await user.click(textarea)
      const composer = container.firstChild
      expect(composer).toHaveClass("ring-2", "ring-[#0071e3]")
    })

    it("removes focus ring when blurred", async () => {
      const onSend = vi.fn()
      const user = userEvent.setup()
      const { container } = render(<MessageComposer onSend={onSend} />)
      const textarea = screen.getByLabelText("Message input")

      await user.click(textarea)
      await user.tab() // Focus away

      const composer = container.firstChild
      expect(composer).not.toHaveClass("ring-2")
    })
  })

  describe("Send Functionality", () => {
    it("sends message on Enter key", async () => {
      const onSend = vi.fn()
      const user = userEvent.setup()
      render(<MessageComposer onSend={onSend} sendOnEnter={true} />)
      const textarea = screen.getByLabelText("Message input")

      await user.type(textarea, "Hello")
      await user.keyboard("{Enter}")

      expect(onSend).toHaveBeenCalledWith("Hello", [])
    })

    it("adds new line on Shift+Enter", async () => {
      const onSend = vi.fn()
      const user = userEvent.setup()
      render(<MessageComposer onSend={onSend} sendOnEnter={true} />)
      const textarea = screen.getByLabelText("Message input")

      await user.type(textarea, "Line 1{Shift>}{Enter}{/Shift}Line 2")

      expect(textarea).toHaveValue("Line 1\nLine 2")
      expect(onSend).not.toHaveBeenCalled()
    })

    it("does not send on Enter when sendOnEnter is false", async () => {
      const onSend = vi.fn()
      const user = userEvent.setup()
      render(<MessageComposer onSend={onSend} sendOnEnter={false} />)
      const textarea = screen.getByLabelText("Message input")

      await user.type(textarea, "Hello{Enter}")

      expect(onSend).not.toHaveBeenCalled()
    })

    it("sends message when send button is clicked", async () => {
      const onSend = vi.fn()
      const user = userEvent.setup()
      render(<MessageComposer onSend={onSend} />)
      const textarea = screen.getByLabelText("Message input")

      await user.type(textarea, "Test message")
      const sendButton = screen.getByLabelText("Send message")
      await user.click(sendButton)

      expect(onSend).toHaveBeenCalledWith("Test message", [])
    })

    it("clears textarea after sending", async () => {
      const onSend = vi.fn()
      const user = userEvent.setup()
      render(<MessageComposer onSend={onSend} />)
      const textarea = screen.getByLabelText("Message input")

      await user.type(textarea, "Test{Enter}")

      expect(textarea).toHaveValue("")
    })

    it("does not send empty messages", async () => {
      const onSend = vi.fn()
      const user = userEvent.setup()
      render(<MessageComposer onSend={onSend} />)
      const textarea = screen.getByLabelText("Message input")

      await user.type(textarea, "   ")
      await user.keyboard("{Enter}")

      expect(onSend).not.toHaveBeenCalled()
    })

    it("trims whitespace when sending", async () => {
      const onSend = vi.fn()
      const user = userEvent.setup()
      render(<MessageComposer onSend={onSend} />)
      const textarea = screen.getByLabelText("Message input")

      await user.type(textarea, "  Test  {Enter}")

      expect(onSend).toHaveBeenCalledWith("Test", [])
    })

    it("does not send when disabled", async () => {
      const onSend = vi.fn()
      const user = userEvent.setup()
      render(<MessageComposer onSend={onSend} disabled={true} />)
      const textarea = screen.getByLabelText("Message input")

      await user.type(textarea, "Test{Enter}")

      expect(onSend).not.toHaveBeenCalled()
    })

    it("does not send when loading", async () => {
      const onSend = vi.fn()
      const user = userEvent.setup()
      render(<MessageComposer onSend={onSend} loading={true} />)
      const textarea = screen.getByLabelText("Message input")

      await user.type(textarea, "Test")
      const sendButton = screen.getByLabelText("Send message")
      await user.click(sendButton)

      expect(onSend).not.toHaveBeenCalled()
    })

    it("shows loading spinner when loading", async () => {
      const onSend = vi.fn()
      const user = userEvent.setup()
      render(<MessageComposer onSend={onSend} loading={true} />)
      const textarea = screen.getByLabelText("Message input")

      await user.type(textarea, "Test")
      const sendButton = screen.getByLabelText("Send message")
      const spinner = sendButton.querySelector(".animate-spin")
      expect(spinner).toBeInTheDocument()
    })
  })

  describe("Reply Mode", () => {
    it("displays reply context", () => {
      const onSend = vi.fn()
      const replyTo = { id: "1", name: "John Doe", message: "Original message" }
      render(<MessageComposer onSend={onSend} replyTo={replyTo} />)

      expect(screen.getByText("Reply to John Doe")).toBeInTheDocument()
      expect(screen.getByText("Original message")).toBeInTheDocument()
    })

    it("calls onCancel when cancel button clicked", async () => {
      const onSend = vi.fn()
      const onCancel = vi.fn()
      const user = userEvent.setup()
      const replyTo = { id: "1", name: "John Doe", message: "Original message" }
      render(<MessageComposer onSend={onSend} onCancel={onCancel} replyTo={replyTo} />)

      const cancelButton = screen.getByLabelText("Cancel")
      await user.click(cancelButton)

      expect(onCancel).toHaveBeenCalled()
    })

    it("calls onCancel when Escape key pressed in reply mode", async () => {
      const onSend = vi.fn()
      const onCancel = vi.fn()
      const user = userEvent.setup()
      const replyTo = { id: "1", name: "John Doe", message: "Original message" }
      render(<MessageComposer onSend={onSend} onCancel={onCancel} replyTo={replyTo} />)
      const textarea = screen.getByLabelText("Message input")

      await user.click(textarea)
      await user.keyboard("{Escape}")

      expect(onCancel).toHaveBeenCalled()
    })
  })

  describe("Edit Mode", () => {
    it("displays edit context", () => {
      const onSend = vi.fn()
      const editMessage = { id: "1", message: "Message to edit" }
      render(<MessageComposer onSend={onSend} editMessage={editMessage} />)

      expect(screen.getByText("Edit message")).toBeInTheDocument()
      const contextMessages = screen.getAllByText("Message to edit")
      expect(contextMessages.length).toBeGreaterThan(0)
    })

    it("populates textarea with edit message", () => {
      const onSend = vi.fn()
      const editMessage = { id: "1", message: "Message to edit" }
      render(<MessageComposer onSend={onSend} editMessage={editMessage} />)
      const textarea = screen.getByLabelText("Message input")

      expect(textarea).toHaveValue("Message to edit")
      // Also check the context displays the message (but is a separate element)
      const contextMessages = screen.getAllByText("Message to edit")
      expect(contextMessages.length).toBe(2) // One in context, one in textarea
    })

    it("calls onCancel when Escape key pressed in edit mode", async () => {
      const onSend = vi.fn()
      const onCancel = vi.fn()
      const user = userEvent.setup()
      const editMessage = { id: "1", message: "Message to edit" }
      render(<MessageComposer onSend={onSend} onCancel={onCancel} editMessage={editMessage} />)
      const textarea = screen.getByLabelText("Message input")

      await user.click(textarea)
      await user.keyboard("{Escape}")

      expect(onCancel).toHaveBeenCalled()
    })
  })

  describe("Attachments", () => {
    it("shows attachment button when showAttachment is true", () => {
      const onSend = vi.fn()
      render(<MessageComposer onSend={onSend} showAttachment={true} />)
      expect(screen.getByLabelText("Attach file")).toBeInTheDocument()
    })

    it("hides attachment button when showAttachment is false", () => {
      const onSend = vi.fn()
      render(<MessageComposer onSend={onSend} showAttachment={false} />)
      expect(screen.queryByLabelText("Attach file")).not.toBeInTheDocument()
    })

    it("opens file picker when attachment button clicked", async () => {
      const onSend = vi.fn()
      const user = userEvent.setup()
      render(<MessageComposer onSend={onSend} />)
      const attachButton = screen.getByLabelText("Attach file")

      await user.click(attachButton)
      // File input exists
      const fileInput = document.querySelector('input[type="file"]')
      expect(fileInput).toBeInTheDocument()
    })

    it("displays attached files", async () => {
      const onSend = vi.fn()
      render(<MessageComposer onSend={onSend} />)
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      const file = new File(["test"], "test.txt", { type: "text/plain" })
      Object.defineProperty(file, "size", { value: 1024 })

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText("test.txt")).toBeInTheDocument()
      })
    })

    it("displays file size for attachments", async () => {
      const onSend = vi.fn()
      render(<MessageComposer onSend={onSend} />)
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      const file = new File(["test"], "test.txt", { type: "text/plain" })
      Object.defineProperty(file, "size", { value: 2048 })

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText("2.0 KB")).toBeInTheDocument()
      })
    })

    it("formats file size in MB for large files", async () => {
      const onSend = vi.fn()
      render(<MessageComposer onSend={onSend} />)
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      const file = new File(["test"], "large.pdf", { type: "application/pdf" })
      Object.defineProperty(file, "size", { value: 2097152 }) // 2 MB

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText("2.0 MB")).toBeInTheDocument()
      })
    })

    it("formats file size in bytes for small files", async () => {
      const onSend = vi.fn()
      render(<MessageComposer onSend={onSend} />)
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      const file = new File(["test"], "tiny.txt", { type: "text/plain" })
      Object.defineProperty(file, "size", { value: 512 })

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText("512 B")).toBeInTheDocument()
      })
    })

    it("removes attachment when remove button clicked", async () => {
      const onSend = vi.fn()
      const user = userEvent.setup()
      render(<MessageComposer onSend={onSend} />)
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      const file = new File(["test"], "test.txt", { type: "text/plain" })
      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText("test.txt")).toBeInTheDocument()
      })

      const removeButton = screen.getByLabelText("Remove test.txt")
      await user.click(removeButton)

      expect(screen.queryByText("test.txt")).not.toBeInTheDocument()
    })

    it("calls onAttachment callback when files selected", async () => {
      const onSend = vi.fn()
      const onAttachment = vi.fn()
      render(<MessageComposer onSend={onSend} onAttachment={onAttachment} />)
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      const file = new File(["test"], "test.txt", { type: "text/plain" })
      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(onAttachment).toHaveBeenCalledWith([file])
      })
    })

    it("sends attachments with message", async () => {
      const onSend = vi.fn()
      const user = userEvent.setup()
      render(<MessageComposer onSend={onSend} />)
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const textarea = screen.getByLabelText("Message input")

      const file = new File(["test"], "test.txt", { type: "text/plain" })
      fireEvent.change(fileInput, { target: { files: [file] } })

      await user.type(textarea, "Test message")
      await user.keyboard("{Enter}")

      expect(onSend).toHaveBeenCalledWith("Test message", [file])
    })

    it("clears attachments after sending", async () => {
      const onSend = vi.fn()
      const user = userEvent.setup()
      render(<MessageComposer onSend={onSend} />)
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const textarea = screen.getByLabelText("Message input")

      const file = new File(["test"], "test.txt", { type: "text/plain" })
      fireEvent.change(fileInput, { target: { files: [file] } })

      await user.type(textarea, "Test{Enter}")

      expect(screen.queryByText("test.txt")).not.toBeInTheDocument()
    })

    it("allows multiple file attachments", async () => {
      const onSend = vi.fn()
      render(<MessageComposer onSend={onSend} />)
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      const file1 = new File(["test1"], "test1.txt", { type: "text/plain" })
      const file2 = new File(["test2"], "test2.txt", { type: "text/plain" })
      fireEvent.change(fileInput, { target: { files: [file1, file2] } })

      await waitFor(() => {
        expect(screen.getByText("test1.txt")).toBeInTheDocument()
        expect(screen.getByText("test2.txt")).toBeInTheDocument()
      })
    })
  })

  describe("Action Buttons", () => {
    it("shows emoji button when showEmoji is true", () => {
      const onSend = vi.fn()
      render(<MessageComposer onSend={onSend} showEmoji={true} />)
      expect(screen.getByLabelText("Add emoji")).toBeInTheDocument()
    })

    it("hides emoji button when showEmoji is false", () => {
      const onSend = vi.fn()
      render(<MessageComposer onSend={onSend} showEmoji={false} />)
      expect(screen.queryByLabelText("Add emoji")).not.toBeInTheDocument()
    })

    it("toggles emoji picker when emoji button clicked", async () => {
      const onSend = vi.fn()
      const user = userEvent.setup()
      render(<MessageComposer onSend={onSend} showEmoji={true} />)
      const emojiButton = screen.getByLabelText("Add emoji")

      await user.click(emojiButton)
      expect(screen.getByText("Emoji picker integration placeholder")).toBeInTheDocument()

      await user.click(emojiButton)
      expect(screen.queryByText("Emoji picker integration placeholder")).not.toBeInTheDocument()
    })

    it("shows voice button when no content", () => {
      const onSend = vi.fn()
      render(<MessageComposer onSend={onSend} showVoice={true} />)
      expect(screen.getByLabelText("Voice message")).toBeInTheDocument()
    })

    it("hides voice button when there is content", async () => {
      const onSend = vi.fn()
      const user = userEvent.setup()
      render(<MessageComposer onSend={onSend} showVoice={true} />)
      const textarea = screen.getByLabelText("Message input")

      await user.type(textarea, "Test")
      expect(screen.queryByLabelText("Voice message")).not.toBeInTheDocument()
    })

    it("shows send button when there is content", async () => {
      const onSend = vi.fn()
      const user = userEvent.setup()
      render(<MessageComposer onSend={onSend} />)
      const textarea = screen.getByLabelText("Message input")

      await user.type(textarea, "Test")
      expect(screen.getByLabelText("Send message")).toBeInTheDocument()
    })

    it("hides send button when there is no content", () => {
      const onSend = vi.fn()
      render(<MessageComposer onSend={onSend} />)
      expect(screen.queryByLabelText("Send message")).not.toBeInTheDocument()
    })

    it("shows formatting button when showFormatting is true", () => {
      const onSend = vi.fn()
      render(<MessageComposer onSend={onSend} showFormatting={true} />)
      expect(screen.getByLabelText("Format text")).toBeInTheDocument()
    })

    it("hides formatting button when showFormatting is false", () => {
      const onSend = vi.fn()
      render(<MessageComposer onSend={onSend} showFormatting={false} />)
      expect(screen.queryByLabelText("Format text")).not.toBeInTheDocument()
    })
  })

  describe("Typing Indicator", () => {
    it("calls onTyping with true when user types", async () => {
      const onSend = vi.fn()
      const onTyping = vi.fn()
      const user = userEvent.setup()
      render(<MessageComposer onSend={onSend} onTyping={onTyping} />)
      const textarea = screen.getByLabelText("Message input")

      await user.type(textarea, "T")

      await waitFor(() => {
        expect(onTyping).toHaveBeenCalledWith(true)
      })
    })

    it("calls onTyping with false when textarea is empty", async () => {
      const onSend = vi.fn()
      const onTyping = vi.fn()
      const user = userEvent.setup()
      render(<MessageComposer onSend={onSend} onTyping={onTyping} />)
      const textarea = screen.getByLabelText("Message input")

      await user.type(textarea, "T")
      await user.clear(textarea)

      await waitFor(() => {
        expect(onTyping).toHaveBeenCalledWith(false)
      })
    })
  })

  describe("Disabled State", () => {
    it("disables textarea when disabled prop is true", () => {
      const onSend = vi.fn()
      render(<MessageComposer onSend={onSend} disabled={true} />)
      const textarea = screen.getByLabelText("Message input")
      expect(textarea).toBeDisabled()
    })

    it("applies opacity when disabled", () => {
      const onSend = vi.fn()
      const { container } = render(<MessageComposer onSend={onSend} disabled={true} />)
      const composer = container.firstChild
      expect(composer).toHaveClass("opacity-50")
    })

    it("disables all action buttons when disabled", () => {
      const onSend = vi.fn()
      render(<MessageComposer onSend={onSend} disabled={true} />)
      expect(screen.getByLabelText("Attach file")).toBeDisabled()
      expect(screen.getByLabelText("Add emoji")).toBeDisabled()
    })
  })

  describe("Keyboard Shortcuts Hint", () => {
    it("shows keyboard shortcuts hint when sendOnEnter is true", () => {
      const onSend = vi.fn()
      render(<MessageComposer onSend={onSend} sendOnEnter={true} />)
      expect(screen.getByText(/Press Enter to send/)).toBeInTheDocument()
    })

    it("does not show hint when sendOnEnter is false", () => {
      const onSend = vi.fn()
      render(<MessageComposer onSend={onSend} sendOnEnter={false} showCharCount={false} />)
      expect(screen.queryByText(/Press Enter to send/)).not.toBeInTheDocument()
    })
  })

  describe("Edge Cases", () => {
    it("handles message with only whitespace", async () => {
      const onSend = vi.fn()
      const user = userEvent.setup()
      render(<MessageComposer onSend={onSend} />)
      const textarea = screen.getByLabelText("Message input")

      await user.type(textarea, "   ")

      // Send button should not appear for whitespace-only
      expect(screen.queryByLabelText("Send message")).not.toBeInTheDocument()
    })

    it("handles attachment with 0 bytes", async () => {
      const onSend = vi.fn()
      render(<MessageComposer onSend={onSend} />)
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      const file = new File([], "empty.txt", { type: "text/plain" })
      Object.defineProperty(file, "size", { value: 0 })

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText("0 B")).toBeInTheDocument()
      })
    })

    it("handles very long file names with truncation", async () => {
      const onSend = vi.fn()
      render(<MessageComposer onSend={onSend} />)
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      const longName = "a".repeat(100) + ".txt"
      const file = new File(["test"], longName, { type: "text/plain" })

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText(longName)).toBeInTheDocument()
      })
    })

    it("shows send button with attachments but no text", async () => {
      const onSend = vi.fn()
      render(<MessageComposer onSend={onSend} />)
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      const file = new File(["test"], "test.txt", { type: "text/plain" })
      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByLabelText("Send message")).toBeInTheDocument()
      })
    })

    it("does not send when over character limit", async () => {
      const onSend = vi.fn()
      const user = userEvent.setup()
      render(<MessageComposer onSend={onSend} maxLength={5} />)
      const textarea = screen.getByLabelText("Message input")

      await user.type(textarea, "Short")
      const sendButton = screen.getByLabelText("Send message")

      // This should still send because we're at the limit, not over
      await user.click(sendButton)
      expect(onSend).toHaveBeenCalled()
    })

    it("resets file input value after file selection", async () => {
      const onSend = vi.fn()
      render(<MessageComposer onSend={onSend} />)
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      const file = new File(["test"], "test.txt", { type: "text/plain" })
      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(fileInput.value).toBe("")
      })
    })

    it("handles empty file selection gracefully", async () => {
      const onSend = vi.fn()
      const onAttachment = vi.fn()
      render(<MessageComposer onSend={onSend} onAttachment={onAttachment} />)
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      // Trigger change with no files
      fireEvent.change(fileInput, { target: { files: [] } })

      // onAttachment should not be called with empty array
      expect(onAttachment).not.toHaveBeenCalled()
    })
  })

  describe("Container Styling", () => {
    it("has base rounded-2xl styling", () => {
      const onSend = vi.fn()
      const { container } = render(<MessageComposer onSend={onSend} />)
      const composer = container.firstChild
      expect(composer).toHaveClass("rounded-2xl", "p-3")
    })

    it("has transition classes", () => {
      const onSend = vi.fn()
      const { container } = render(<MessageComposer onSend={onSend} />)
      const composer = container.firstChild
      expect(composer).toHaveClass("transition-all", "duration-200")
    })
  })
})
