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
    expect(container.firstChild).toHaveStyle("background: #daf1da")
  })
})
