import { fireEvent, render, screen } from "@testing-library/react"
import React from "react"
import { MessageComposer } from "./MessageComposer"

describe("MessageComposer", () => {
  it("renders input and button", () => {
    render(<MessageComposer onSend={() => {}} />)
    expect(screen.getByPlaceholderText("Type a message...")).toBeInTheDocument()
    expect(screen.getByText("Send")).toBeInTheDocument()
  })

  it("calls onSend with message", () => {
    const onSend = jest.fn()
    render(<MessageComposer onSend={onSend} />)
    fireEvent.change(screen.getByPlaceholderText("Type a message..."), { target: { value: "hi" } })
    fireEvent.click(screen.getByText("Send"))
    expect(onSend).toHaveBeenCalledWith("hi")
  })

  it("disables button when input is empty", () => {
    render(<MessageComposer onSend={() => {}} />)
    expect(screen.getByText("Send")).toBeDisabled()
  })

  it("disables input and button when disabled", () => {
    render(<MessageComposer onSend={() => {}} disabled />)
    expect(screen.getByPlaceholderText("Type a message...")).toBeDisabled()
    expect(screen.getByText("Send")).toBeDisabled()
  })

  it("calls onSend", () => {
    const onSend = jest.fn()
    const { getByPlaceholderText, getByText } = render(<MessageComposer onSend={onSend} />)
    fireEvent.change(getByPlaceholderText("Type a message..."), { target: { value: "hi" } })
    fireEvent.click(getByText("Send"))
    expect(onSend).toHaveBeenCalledWith("hi")
  })

  it("disables send button", () => {
    const { getByText } = render(<MessageComposer onSend={() => {}} disabled />)
    expect(getByText("Send")).toBeDisabled()
  })
})
