import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { UserProfile } from "./UserProfile"

const baseProps = {
  name: "Alice",
  email: "alice@example.com",
}

describe("UserProfile", () => {
  it("renders name", () => {
    render(<UserProfile {...baseProps} />)
    expect(screen.getByText("Alice")).toBeInTheDocument()
  })

  it("renders avatar with alt text", () => {
    render(<UserProfile {...baseProps} avatar="/img.png" />)
    expect(screen.getByAltText("Alice's avatar")).toBeInTheDocument()
  })

  it("renders status if provided", () => {
    render(<UserProfile {...baseProps} status="Online" />)
    expect(screen.getByText("Online")).toBeInTheDocument()
  })

  it("renders phone if provided", () => {
    render(<UserProfile {...baseProps} phone="+1234567890" />)
    expect(screen.getByText("+1234567890")).toBeInTheDocument()
  })

  it("renders recentChats if provided", () => {
    const recentChats = [
      { name: "Bob", lastMessage: "Hey!", time: "10:00", avatar: "/bob.png", initials: "B" },
      { name: "Carol", lastMessage: "See you!", time: "11:00" },
    ]
    render(<UserProfile {...baseProps} recentChats={recentChats} />)
    expect(screen.getByText("Bob")).toBeInTheDocument()
    expect(screen.getByText("Hey!")).toBeInTheDocument()
    expect(screen.getByText("10:00")).toBeInTheDocument()
    expect(screen.getByText("Carol")).toBeInTheDocument()
    expect(screen.getByText("See you!")).toBeInTheDocument()
    expect(screen.getByText("11:00")).toBeInTheDocument()
  })

  it("applies custom className", () => {
    const { container } = render(<UserProfile {...baseProps} className="custom-class" />)
    expect(container.firstChild).toHaveClass("custom-class")
  })

  it("renders ProfileTabs", () => {
    render(<UserProfile {...baseProps} />)
    expect(screen.getByText("Chat")).toBeInTheDocument()
    expect(screen.getByText("Group")).toBeInTheDocument()
  })
})
