import { fireEvent, render } from "@testing-library/react"
import React from "react"
import { Input } from "./Input"

describe("Input", () => {
  it("renders with label and value", () => {
    const { getByLabelText } = render(<Input label="Test" value="abc" onChange={() => {}} />)
    expect(getByLabelText("Test")).toHaveValue("abc")
  })

  it("calls onChange", () => {
  const handleChange = vi.fn()
    const { getByPlaceholderText } = render(<Input value="" onChange={handleChange} placeholder="Type" />)
    fireEvent.change(getByPlaceholderText("Type"), { target: { value: "x" } })
    expect(handleChange).toHaveBeenCalled()
  })

  it("shows error", () => {
    const { getByText } = render(<Input value="" onChange={() => {}} error="Err" />)
    expect(getByText("Err")).toBeInTheDocument()
  })

  it("disables input", () => {
    const { getByRole } = render(<Input value="" onChange={() => {}} disabled />)
    expect(getByRole("textbox")).toBeDisabled()
  })
})
