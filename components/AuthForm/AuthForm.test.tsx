import { fireEvent, render } from "@testing-library/react"
import React from "react"
import { AuthForm } from "./AuthForm"

describe("AuthForm", () => {
  it("renders login button", () => {
    const { getByText } = render(<AuthForm type="login" onSubmit={() => {}} />)
    expect(getByText("Login")).toBeInTheDocument()
  })

  it("renders register button", () => {
    const { getByText } = render(<AuthForm type="register" onSubmit={() => {}} />)
    expect(getByText("Register")).toBeInTheDocument()
  })

  it("shows error", () => {
    const { getByText } = render(<AuthForm type="login" onSubmit={() => {}} error="Err" />)
    expect(getByText("Err")).toBeInTheDocument()
  })

  it("calls onSubmit", () => {
    const onSubmit = jest.fn()
    const { getByLabelText, getByText } = render(<AuthForm type="login" onSubmit={onSubmit} />)
    fireEvent.change(getByLabelText("Email"), { target: { value: "a@b.com" } })
    fireEvent.change(getByLabelText("Password"), { target: { value: "123" } })
    fireEvent.click(getByText("Login"))
    expect(onSubmit).toHaveBeenCalledWith({ email: "a@b.com", password: "123" })
  })
})
