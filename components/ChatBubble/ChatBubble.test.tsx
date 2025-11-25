import { render, screen } from "@testing-library/react"
import React from "react"
import { ChatBubble } from "./ChatBubble"

describe("ChatBubble", () => {
  it("renders message", () => {
    render(<ChatBubble message="Hello" />)
    expect(screen.getByText("Hello")).toBeInTheDocument()
  })

  it("renders timestamp", () => {
    render(<ChatBubble message="Hi" timestamp="10:00" />)
    expect(screen.getByText("10:00")).toBeInTheDocument()
  })

  it("applies own style", () => {
    const { container } = render(<ChatBubble message="Me" isOwn />)
    expect(container.firstChild).toHaveClass("justify-end")
    // The bubble itself is the last child
    const bubble = container.firstChild?.lastChild
    expect(bubble).toHaveClass("bg-primary")
  })

  it("renders avatar when not own", () => {
    render(<ChatBubble message="Hi" avatar="/avatar.png" />)
    expect(screen.getByAltText("avatar")).toBeInTheDocument()
  })

  it("renders initials when not own and no avatar", () => {
    render(<ChatBubble message="Hi" initials="AB" />)
    expect(screen.getByText("AB")).toBeInTheDocument()
  })

  it("applies unread style", () => {
    const { container } = render(<ChatBubble message="Hi" unread />)
    const bubble = container.firstChild?.lastChild
    expect(bubble).toHaveClass("border-primary")
  })

  it("applies custom className", () => {
    const { container } = render(<ChatBubble message="Hi" className="custom-chatbubble" />)
    const bubble = container.firstChild?.lastChild
    expect(bubble).toHaveClass("custom-chatbubble")
  })
})
