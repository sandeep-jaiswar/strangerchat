import { render, screen } from "@testing-library/react"
import React from "react"
import { ChatList } from "./ChatList"

const messages = [
  { id: "1", message: "Hello!", isOwn: true, timestamp: "10:00" },
  { id: "2", message: "Hi!", timestamp: "10:01" },
]

describe("ChatList", () => {
  it("renders messages", () => {
    render(<ChatList messages={messages} />)
    expect(screen.getByText("Hello!")).toBeInTheDocument()
    expect(screen.getByText("Hi!")).toBeInTheDocument()
    expect(screen.getByText("10:00")).toBeInTheDocument()
    expect(screen.getByText("10:01")).toBeInTheDocument()
  })
  it("renders all messages", () => {
    const { getByText } = render(<ChatList messages={messages} />)
    expect(getByText("Hello!")).toBeInTheDocument()
    expect(getByText("Hi!")).toBeInTheDocument()
  })
})
