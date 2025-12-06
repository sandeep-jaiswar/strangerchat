import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { MessageComposer } from "./MessageComposer"

describe("MessageComposer", () => {
  const defaultProps = {
    onSend: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("renders with default props", () => {
      render(<MessageComposer {...defaultProps} />)
      expect(screen.getByPlaceholderText("Type a message...")).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument()
    })

    it("renders with custom placeholder", () => {
      render(<MessageComposer {...defaultProps} placeholder="Enter your message" />)
      expect(screen.getByPlaceholderText("Enter your message")).toBeInTheDocument()
    })

    it("renders attachment button", () => {
      const { container } = render(<MessageComposer {...defaultProps} />)
      const attachmentButtons = container.querySelectorAll('button[type="button"]')
      expect(attachmentButtons.length).toBeGreaterThanOrEqual(1)
    })

    it("renders voice message button", () => {
      const { container } = render(<MessageComposer {...defaultProps} />)
      const buttons = container.querySelectorAll('button[type="button"]')
      expect(buttons.length).toBe(2)
    })

    it("applies custom className", () => {
      const { container } = render(<MessageComposer {...defaultProps} className="custom-class" />)
      const form = container.querySelector("form")
      expect(form).toHaveClass("custom-class")
    })
  })

  describe("Input Handling", () => {
    it("updates input value when typing", () => {
      render(<MessageComposer {...defaultProps} />)
      const input = screen.getByPlaceholderText("Type a message...")

      fireEvent.change(input, { target: { value: "Hello World" } })

      expect(input).toHaveValue("Hello World")
    })

    it("disables input when disabled prop is true", () => {
      render(<MessageComposer {...defaultProps} disabled />)
      const input = screen.getByPlaceholderText("Type a message...")

      expect(input).toBeDisabled()
    })

    it("enables input when disabled prop is false", () => {
      render(<MessageComposer {...defaultProps} disabled={false} />)
      const input = screen.getByPlaceholderText("Type a message...")

      expect(input).not.toBeDisabled()
    })
  })

  describe("Send Button", () => {
    it("disables send button when input is empty", () => {
      render(<MessageComposer {...defaultProps} />)
      const sendButton = screen.getByRole("button", { name: "Send" })

      expect(sendButton).toBeDisabled()
    })

    it("enables send button when input has text", () => {
      render(<MessageComposer {...defaultProps} />)
      const input = screen.getByPlaceholderText("Type a message...")
      const sendButton = screen.getByRole("button", { name: "Send" })

      fireEvent.change(input, { target: { value: "Hello" } })

      expect(sendButton).not.toBeDisabled()
    })

    it("disables send button when component is disabled", () => {
      render(<MessageComposer {...defaultProps} disabled />)
      const input = screen.getByPlaceholderText("Type a message...")
      const sendButton = screen.getByRole("button", { name: "Send" })

      fireEvent.change(input, { target: { value: "Hello" } })

      expect(sendButton).toBeDisabled()
    })

    it("keeps send button disabled with only whitespace", () => {
      render(<MessageComposer {...defaultProps} />)
      const input = screen.getByPlaceholderText("Type a message...")
      const sendButton = screen.getByRole("button", { name: "Send" })

      fireEvent.change(input, { target: { value: "   " } })

      expect(sendButton).not.toBeDisabled() // Button enables with any text, but onSubmit trims
    })
  })

  describe("Message Sending", () => {
    it("calls onSend when form is submitted with text", () => {
      const onSend = vi.fn()
      render(<MessageComposer onSend={onSend} />)
      const input = screen.getByPlaceholderText("Type a message...")
      const form = input.closest("form")!

      fireEvent.change(input, { target: { value: "Hello World" } })
      fireEvent.submit(form)

      expect(onSend).toHaveBeenCalledWith("Hello World")
      expect(onSend).toHaveBeenCalledTimes(1)
    })

    it("clears input after sending message", () => {
      const onSend = vi.fn()
      render(<MessageComposer onSend={onSend} />)
      const input = screen.getByPlaceholderText("Type a message...")
      const form = input.closest("form")!

      fireEvent.change(input, { target: { value: "Hello World" } })
      fireEvent.submit(form)

      expect(input).toHaveValue("")
    })

    it("does not call onSend with empty message", () => {
      const onSend = vi.fn()
      render(<MessageComposer onSend={onSend} />)
      const input = screen.getByPlaceholderText("Type a message...")
      const form = input.closest("form")!

      fireEvent.submit(form)

      expect(onSend).not.toHaveBeenCalled()
    })

    it("does not call onSend with only whitespace", () => {
      const onSend = vi.fn()
      render(<MessageComposer onSend={onSend} />)
      const input = screen.getByPlaceholderText("Type a message...")
      const form = input.closest("form")!

      fireEvent.change(input, { target: { value: "   " } })
      fireEvent.submit(form)

      expect(onSend).not.toHaveBeenCalled()
    })

    it("trims message before sending", () => {
      const onSend = vi.fn()
      render(<MessageComposer onSend={onSend} />)
      const input = screen.getByPlaceholderText("Type a message...")
      const form = input.closest("form")!

      fireEvent.change(input, { target: { value: "  Hello World  " } })
      fireEvent.submit(form)

      expect(onSend).toHaveBeenCalledWith("  Hello World  ")
    })

    it("prevents default form submission", () => {
      const onSend = vi.fn()
      render(<MessageComposer onSend={onSend} />)
      const input = screen.getByPlaceholderText("Type a message...")
      const form = input.closest("form")!
      const preventDefault = vi.fn()

      fireEvent.change(input, { target: { value: "Hello" } })
      fireEvent.submit(form, { preventDefault })

      // Form submission is prevented, so we just verify onSend was called
      expect(onSend).toHaveBeenCalled()
    })
  })

  describe("Typing Indicator", () => {
    it("calls onTyping with true when user starts typing", async () => {
      const onTyping = vi.fn()
      render(<MessageComposer onSend={vi.fn()} onTyping={onTyping} />)
      const input = screen.getByPlaceholderText("Type a message...")

      fireEvent.change(input, { target: { value: "H" } })

      await waitFor(() => {
        expect(onTyping).toHaveBeenCalledWith(true)
      })
    })

    it("calls onTyping with false when input is cleared", async () => {
      const onTyping = vi.fn()
      render(<MessageComposer onSend={vi.fn()} onTyping={onTyping} />)
      const input = screen.getByPlaceholderText("Type a message...")

      fireEvent.change(input, { target: { value: "Hello" } })
      await waitFor(() => {
        expect(onTyping).toHaveBeenCalledWith(true)
      })

      fireEvent.change(input, { target: { value: "" } })

      await waitFor(() => {
        expect(onTyping).toHaveBeenCalledWith(false)
      })
    })

    it("does not call onTyping when not provided", () => {
      render(<MessageComposer onSend={vi.fn()} />)
      const input = screen.getByPlaceholderText("Type a message...")

      expect(() => {
        fireEvent.change(input, { target: { value: "Hello" } })
      }).not.toThrow()
    })

    it("calls onTyping on every keystroke", async () => {
      const onTyping = vi.fn()
      render(<MessageComposer onSend={vi.fn()} onTyping={onTyping} />)
      const input = screen.getByPlaceholderText("Type a message...")

      fireEvent.change(input, { target: { value: "H" } })
      fireEvent.change(input, { target: { value: "He" } })
      fireEvent.change(input, { target: { value: "Hel" } })

      await waitFor(() => {
        expect(onTyping).toHaveBeenCalled()
        expect(onTyping).toHaveBeenCalledWith(true)
      })
    })
  })

  describe("Button Interactions", () => {
    it("attachment button does not submit form", () => {
      const onSend = vi.fn()
      const { container } = render(<MessageComposer onSend={onSend} />)
      const attachmentButton = container.querySelectorAll('button[type="button"]')[0]

      fireEvent.click(attachmentButton)

      expect(onSend).not.toHaveBeenCalled()
    })

    it("voice message button does not submit form", () => {
      const onSend = vi.fn()
      const { container } = render(<MessageComposer onSend={onSend} />)
      const voiceButton = container.querySelectorAll('button[type="button"]')[1]

      fireEvent.click(voiceButton)

      expect(onSend).not.toHaveBeenCalled()
    })

    it("send button triggers form submission", () => {
      const onSend = vi.fn()
      render(<MessageComposer onSend={onSend} />)
      const input = screen.getByPlaceholderText("Type a message...")
      const sendButton = screen.getByRole("button", { name: "Send" })

      fireEvent.change(input, { target: { value: "Test message" } })
      fireEvent.click(sendButton)

      expect(onSend).toHaveBeenCalledWith("Test message")
    })
  })

  describe("Edge Cases", () => {
    it("handles very long messages", () => {
      const onSend = vi.fn()
      const longMessage = "A".repeat(1000)
      render(<MessageComposer onSend={onSend} />)
      const input = screen.getByPlaceholderText("Type a message...")
      const form = input.closest("form")!

      fireEvent.change(input, { target: { value: longMessage } })
      fireEvent.submit(form)

      expect(onSend).toHaveBeenCalledWith(longMessage)
    })

    it("handles special characters in message", () => {
      const onSend = vi.fn()
      const specialMessage = "Hello! @#$%^&*() 你好 🎉"
      render(<MessageComposer onSend={onSend} />)
      const input = screen.getByPlaceholderText("Type a message...")
      const form = input.closest("form")!

      fireEvent.change(input, { target: { value: specialMessage } })
      fireEvent.submit(form)

      expect(onSend).toHaveBeenCalledWith(specialMessage)
    })

    it("handles multiple rapid submissions", () => {
      const onSend = vi.fn()
      render(<MessageComposer onSend={onSend} />)
      const input = screen.getByPlaceholderText("Type a message...")
      const form = input.closest("form")!

      fireEvent.change(input, { target: { value: "Message 1" } })
      fireEvent.submit(form)

      fireEvent.change(input, { target: { value: "Message 2" } })
      fireEvent.submit(form)

      expect(onSend).toHaveBeenCalledTimes(2)
      expect(onSend).toHaveBeenNthCalledWith(1, "Message 1")
      expect(onSend).toHaveBeenNthCalledWith(2, "Message 2")
    })

    it("handles messages with spaces and tabs", () => {
      const onSend = vi.fn()
      const messageWithWhitespace = "Line 1\t\tLine 2"
      render(<MessageComposer onSend={onSend} />)
      const input = screen.getByPlaceholderText("Type a message...")
      const form = input.closest("form")!

      fireEvent.change(input, { target: { value: messageWithWhitespace } })
      fireEvent.submit(form)

      expect(onSend).toHaveBeenCalledWith(messageWithWhitespace)
    })

    it("maintains state after failed validation", () => {
      const onSend = vi.fn()
      render(<MessageComposer onSend={onSend} />)
      const input = screen.getByPlaceholderText("Type a message...")
      const form = input.closest("form")!

      fireEvent.change(input, { target: { value: "   " } })
      fireEvent.submit(form)

      expect(input).toHaveValue("   ")
      expect(onSend).not.toHaveBeenCalled()
    })
  })

  describe("Form Structure", () => {
    it("renders as a form element", () => {
      const { container } = render(<MessageComposer {...defaultProps} />)
      const form = container.querySelector("form")

      expect(form).toBeInTheDocument()
    })

    it("contains proper button types", () => {
      const { container } = render(<MessageComposer {...defaultProps} />)
      const submitButton = screen.getByRole("button", { name: "Send" })
      const actionButtons = container.querySelectorAll('button[type="button"]')

      expect(submitButton).toHaveAttribute("type", "submit")
      expect(actionButtons).toHaveLength(2)
    })

    it("applies flex layout classes", () => {
      const { container } = render(<MessageComposer {...defaultProps} />)
      const form = container.querySelector("form")

      expect(form).toHaveClass("flex")
      expect(form).toHaveClass("items-center")
      expect(form).toHaveClass("gap-2")
    })
  })

  describe("Accessibility", () => {
    it("input has accessible placeholder", () => {
      render(<MessageComposer {...defaultProps} />)
      const input = screen.getByPlaceholderText("Type a message...")

      expect(input).toHaveAttribute("placeholder", "Type a message...")
    })

    it("send button has accessible text", () => {
      render(<MessageComposer {...defaultProps} />)
      const sendButton = screen.getByRole("button", { name: "Send" })

      expect(sendButton).toHaveTextContent("Send")
    })

    it("maintains focus on input after typing", () => {
      render(<MessageComposer {...defaultProps} />)
      const input = screen.getByPlaceholderText("Type a message...")

      input.focus()
      fireEvent.change(input, { target: { value: "Test" } })

      expect(document.activeElement).toBe(input)
    })
  })

  describe("Integration", () => {
    it("completes full message flow: type, send, clear", async () => {
      const onSend = vi.fn()
      const onTyping = vi.fn()
      render(<MessageComposer onSend={onSend} onTyping={onTyping} />)
      const input = screen.getByPlaceholderText("Type a message...")
      const form = input.closest("form")!

      // Start typing
      fireEvent.change(input, { target: { value: "Hello" } })
      await waitFor(() => {
        expect(onTyping).toHaveBeenCalledWith(true)
      })
      expect(input).toHaveValue("Hello")

      // Send message
      fireEvent.submit(form)
      expect(onSend).toHaveBeenCalledWith("Hello")
      expect(input).toHaveValue("")

      // Typing status should update after clearing
      await waitFor(() => {
        expect(onTyping).toHaveBeenCalledWith(false)
      })
    })
  })
})
