import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { ChatBubble } from "./ChatBubble"

describe("ChatBubble component", () => {
  beforeEach(() => {
    document.body.innerHTML = ""
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("renders message text", () => {
    render(<ChatBubble message="Hello" />)
    expect(screen.getByText("Hello")).toBeInTheDocument()
  })

  it("shows deleted message text when deleted prop is true", () => {
    render(<ChatBubble message="Secret" deleted={true} />)
    expect(screen.getByText("This message was deleted")).toBeInTheDocument()
    expect(screen.queryByText("Secret")).not.toBeInTheDocument()
  })

  it("renders typing indicator when isTyping is true", () => {
    const { container } = render(<ChatBubble message="ignored" isTyping={true} />)
    const dots = container.querySelectorAll(".animate-bounce")
    expect(dots.length).toBe(3)
  })

  it("renders avatar when showAvatar=true and not own and not grouped", () => {
    render(<ChatBubble message="Hi" avatar="/me.png" name="Alice" />)
    // Avatar component exposes an accessible name via aria-label on the wrapper
    expect(screen.getByLabelText("Alice")).toBeInTheDocument()
  })

  it("does not render avatar when showAvatar=false", () => {
    render(<ChatBubble message="Hi" avatar="/me.png" showAvatar={false} />)
    // Avatar would expose an aria-label of the alt/name (defaults to "User"); ensure it's absent
    expect(screen.queryByLabelText("User")).not.toBeInTheDocument()
  })

  it("renders name when showName is true", () => {
    render(<ChatBubble message="Hi" name="Bob" showName={true} />)
    expect(screen.getByText("Bob")).toBeInTheDocument()
  })

  it("renders replyTo block when provided", () => {
    render(<ChatBubble message="Reply" replyTo={{ name: "Jane", message: "Orig" }} />)
    expect(screen.getByText("Jane")).toBeInTheDocument()
    expect(screen.getByText("Orig")).toBeInTheDocument()
  })

  it("renders edited badge when edited=true", () => {
    render(<ChatBubble message="Hello" edited={true} />)
    expect(screen.getByText("(edited)")).toBeInTheDocument()
  })

  it("renders timestamp and delivery status for own messages", () => {
    const { container } = render(<ChatBubble message="Sent" isOwn={true} timestamp="12:00" deliveryStatus="sent" />)
    expect(screen.getByText("12:00")).toBeInTheDocument()
    // deliveryStatus icon should be in the document (svg present)
    expect(container.querySelector("svg")).toBeInTheDocument()
  })

  it("renders unread indicator for other users when unread=true", () => {
    render(<ChatBubble message="New" unread={true} />)
    const indicator = document.querySelector(".animate-ping")
    expect(indicator).toBeInTheDocument()
  })

  it("applies own bubble classes when isOwn=true and variant default", () => {
    const { container } = render(<ChatBubble message="Me" isOwn={true} />)
    const bubble = container.querySelector('[class*="rounded-[18px]"]')
    expect(bubble).toHaveClass("bg-[#0071e3]")
  })

  it("applies other bubble classes when isOwn=false and variant elevated", () => {
    const { container } = render(<ChatBubble message="Other" variant="elevated" />)
    const bubble = container.querySelector('[class*="rounded-[18px]"]')
    expect(bubble).toHaveClass("bg-neutral-100", "shadow-md")
  })

  it("renders media image when mediaUrl and mediaType=image", () => {
    render(<ChatBubble message="" mediaUrl="/img.jpg" mediaType="image" />)
    // Next/Image renders as an img tag in test environment; check for alt
    expect(screen.getByAltText("Shared media")).toBeInTheDocument()
  })

  it("renders link preview with onclick handler", () => {
    const link = { title: "Site", url: "https://example.com", description: "Desc" }
    const { container } = render(<ChatBubble message="" linkPreview={link} />)
    const anchor = screen.getByRole("link")
    expect(anchor).toHaveAttribute("href", "https://example.com")
    expect(anchor).toHaveAttribute("target", "_blank")
    // Component has an onClick that calls stopPropagation, just assert the node is clickable
    const anchorElement = container.querySelector("a")
    expect(anchorElement).toBeInTheDocument()
  })

  it("renders reactions and calls onReact when clicked", async () => {
    const onReact = vi.fn()
    const user = userEvent.setup()
    render(
      <ChatBubble
        message=""
        reactions={[
          { emoji: "👍", count: 2, userReacted: true },
          { emoji: "🔥", count: 1 },
        ]}
        onReact={onReact}
      />
    )
    const emojiNode = screen.getByText("👍")
    const btn = emojiNode.closest("button")
    await user.click(btn!)
    expect(onReact).toHaveBeenCalledWith("👍")
  })

  it("shows count only when > 1", () => {
    render(<ChatBubble message="" reactions={[{ emoji: "❤️", count: 1 }]} />)
    // Only emoji present, no numeric count
    expect(screen.getByText("❤️")).toBeInTheDocument()
    expect(screen.queryByText("1")).not.toBeInTheDocument()
  })

  it("forward ref works for div element", () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<ChatBubble message="RefTest" ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it("does not call onLongPress immediately on touchStart", () => {
    const onLongPress = vi.fn()
    const { container } = render(<ChatBubble message="" onLongPress={onLongPress} />)
    const wrapper = container.firstChild as HTMLElement
    fireEvent.touchStart(wrapper)
    // Should not be called synchronously
    expect(onLongPress).not.toHaveBeenCalled()
  })

  it("does not set up long press handler when onLongPress is not provided", () => {
    const { container } = render(<ChatBubble message="Test" />)
    const wrapper = container.firstChild as HTMLElement
    // Should not throw error when touching without handler
    expect(() => fireEvent.touchStart(wrapper)).not.toThrow()
  })

  it("displays displayName", () => {
    expect(ChatBubble.displayName).toBe("ChatBubble")
  })

  it("renders grouped messages with spacing (no avatar shown)", () => {
    const { container } = render(<ChatBubble message="Grouped" isGrouped={true} showAvatar={true} />)
    // Grouped + showAvatar should render a spacer div
    const spacer = container.querySelector(".w-8.shrink-0")
    expect(spacer).toBeInTheDocument()
  })

  it("renders different delivery status icons", () => {
    const { container: c1 } = render(<ChatBubble message="" isOwn={true} deliveryStatus="sending" />)
    const { container: c2 } = render(<ChatBubble message="" isOwn={true} deliveryStatus="failed" />)
    const { container: c3 } = render(<ChatBubble message="" isOwn={true} deliveryStatus="read" />)
    expect(c1.querySelector("svg")).toBeInTheDocument()
    expect(c2.querySelector("svg")).toBeInTheDocument()
    expect(c3.querySelector("svg")).toBeInTheDocument()
  })

  it("renders link preview with image", () => {
    const link = {
      title: "Article",
      url: "https://example.com",
      description: "Interesting article",
      image: "/preview.jpg",
    }
    render(<ChatBubble message="" linkPreview={link} />)
    expect(screen.getByAltText("Article")).toBeInTheDocument()
    expect(screen.getByText("Article")).toBeInTheDocument()
    expect(screen.getByText("Interesting article")).toBeInTheDocument()
  })

  it("renders multiple reactions with userReacted indicator", () => {
    render(
      <ChatBubble
        message=""
        reactions={[
          { emoji: "😀", count: 5, userReacted: true },
          { emoji: "❤️", count: 2, userReacted: false },
        ]}
      />
    )
    expect(screen.getByText("😀")).toBeInTheDocument()
    expect(screen.getByText("5")).toBeInTheDocument()
    expect(screen.getByText("❤️")).toBeInTheDocument()
    expect(screen.getByText("2")).toBeInTheDocument()
  })

  it("applies minimal variant styling for own bubbles", () => {
    const { container } = render(<ChatBubble message="Minimal" isOwn={true} variant="minimal" />)
    const bubble = container.querySelector('[class*="rounded-[18px]"]')
    expect(bubble).toHaveClass("bg-[#0071e3]")
  })

  it("applies elevated variant styling for other bubbles", () => {
    const { container } = render(<ChatBubble message="Elevated" variant="elevated" />)
    const bubble = container.querySelector('[class*="rounded-[18px]"]')
    expect(bubble).toHaveClass("shadow-md")
  })

  it("renders unread indicator with animation", () => {
    const { container } = render(<ChatBubble message="" unread={true} />)
    const animatedSpan = container.querySelector(".animate-ping")
    expect(animatedSpan).toBeInTheDocument()
  })

  it("does not render name for own messages even when showName is true", () => {
    render(<ChatBubble message="Hi" name="Me" showName={true} isOwn={true} />)
    // showName && !isOwn check means name won't show for own messages
    expect(screen.queryByText(/Me/)).not.toBeInTheDocument()
  })

  it("renders replyTo with border styling depending on isOwn", () => {
    const { container: c1 } = render(
      <ChatBubble message="Reply" replyTo={{ name: "Alice", message: "Original" }} isOwn={true} />
    )
    const { container: c2 } = render(
      <ChatBubble message="Reply" replyTo={{ name: "Bob", message: "Original" }} isOwn={false} />
    )
    // Both should render replyTo; checking for presence
    expect(c1.querySelector(".border-l-2")).toBeInTheDocument()
    expect(c2.querySelector(".border-l-2")).toBeInTheDocument()
  })

  it("applies grouped + isOwn corner radius", () => {
    const { container } = render(<ChatBubble message="" isGrouped={true} isOwn={true} />)
    const bubble = container.querySelector(".rounded-tr-md")
    expect(bubble).toBeInTheDocument()
  })

  it("applies grouped + not isOwn corner radius", () => {
    const { container } = render(<ChatBubble message="" isGrouped={true} isOwn={false} />)
    const bubble = container.querySelector(".rounded-tl-md")
    expect(bubble).toBeInTheDocument()
  })

  it("renders media for non-image types (e.g., mediaType video)", () => {
    // Component checks mediaType === "image"; other types won't render image
    const { container } = render(<ChatBubble message="" mediaUrl="/video.mp4" mediaType="video" />)
    // No image should render since mediaType is video and component only handles image
    expect(container.querySelector("img")).not.toBeInTheDocument()
  })

  it("does not render media when mediaUrl is missing", () => {
    const { container } = render(<ChatBubble message="No media" mediaType="image" />)
    expect(container.querySelector("img")).not.toBeInTheDocument()
  })

  it("renders bubble tail for non-minimal variant when not grouped", () => {
    const { container } = render(<ChatBubble message="" variant="default" isGrouped={false} />)
    const tail = container.querySelector("svg")
    expect(tail).toBeInTheDocument()
  })

  it("does not render bubble tail when variant is minimal", () => {
    const { container } = render(<ChatBubble message="" variant="minimal" />)
    // Tail is only rendered if variant !== "minimal" and !isGrouped
    const tail = container.querySelector('[viewBox="0 0 16 16"]')
    expect(tail).not.toBeInTheDocument()
  })

  it("does not render bubble tail when isGrouped is true", () => {
    const { container } = render(<ChatBubble message="" variant="default" isGrouped={true} />)
    const tail = container.querySelector('[viewBox="0 0 16 16"]')
    expect(tail).not.toBeInTheDocument()
  })
})
