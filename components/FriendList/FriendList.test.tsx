import { fireEvent, render, screen } from "@testing-library/react"
import React from "react"
import { FriendList } from "./FriendList"

const friends = [
  { id: "1", name: "Alice", avatar: "" },
  { id: "2", name: "Bob", avatar: "" },
]

describe("FriendList", () => {
  it("renders friends", () => {
    render(<FriendList friends={friends} />)
    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("Bob")).toBeInTheDocument()
  })

  it("calls onSelect when friend clicked", () => {
    const onSelect = jest.fn()
    render(<FriendList friends={friends} onSelect={onSelect} />)
    fireEvent.click(screen.getByText("Alice"))
    expect(onSelect).toHaveBeenCalledWith("1")
  })

  it("renders avatar initials", () => {
    render(<FriendList friends={friends} />)
    expect(screen.getByText("A")).toBeInTheDocument()
    expect(screen.getByText("B")).toBeInTheDocument()
  })
})
