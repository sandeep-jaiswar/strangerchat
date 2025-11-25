import { fireEvent, render, screen } from "@testing-library/react"
import React from "react"
import { FriendRequest } from "./FriendRequest"

describe("FriendRequest", () => {
  it("renders name and buttons", () => {
    render(<FriendRequest name="Charlie" onAccept={() => {}} onDecline={() => {}} />)
    expect(screen.getByText("Charlie")).toBeInTheDocument()
    expect(screen.getByText("Accept")).toBeInTheDocument()
    expect(screen.getByText("Decline")).toBeInTheDocument()
  })

  it("calls onAccept and onDecline", () => {
  const onAccept = vi.fn()
  const onDecline = vi.fn()
    render(<FriendRequest name="Charlie" onAccept={onAccept} onDecline={onDecline} />)
    fireEvent.click(screen.getByText("Accept"))
    expect(onAccept).toHaveBeenCalled()
    fireEvent.click(screen.getByText("Decline"))
    expect(onDecline).toHaveBeenCalled()
  })

  it("renders avatar initials", () => {
    render(<FriendRequest name="Charlie" onAccept={() => {}} onDecline={() => {}} />)
    expect(screen.getByText("C")).toBeInTheDocument()
  })

  it("renders name", () => {
    const { getByText } = render(<FriendRequest name="Bob" onAccept={() => {}} onDecline={() => {}} />)
    expect(getByText("Bob")).toBeInTheDocument()
  })

  it("calls onAccept", () => {
  const onAccept = vi.fn()
    const { getByText } = render(<FriendRequest name="Bob" onAccept={onAccept} onDecline={() => {}} />)
    fireEvent.click(getByText("Accept"))
    expect(onAccept).toHaveBeenCalled()
  })

  it("calls onDecline", () => {
  const onDecline = vi.fn()
    const { getByText } = render(<FriendRequest name="Bob" onAccept={() => {}} onDecline={onDecline} />)
    fireEvent.click(getByText("Decline"))
    expect(onDecline).toHaveBeenCalled()
  })
})
