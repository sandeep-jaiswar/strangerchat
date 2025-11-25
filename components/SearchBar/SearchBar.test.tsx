import { fireEvent, render, screen } from "@testing-library/react"
import React from "react"
import { SearchBar } from "./SearchBar"

describe("SearchBar", () => {
  it("renders with placeholder", () => {
    render(<SearchBar value="" onChange={() => {}} placeholder="Search..." />)
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument()
  })

  it("calls onChange when typing", () => {
  const onChange = vi.fn()
    render(<SearchBar value="" onChange={onChange} />)
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "abc" } })
    expect(onChange).toHaveBeenCalledWith("abc")
  })

  it("shows value", () => {
    render(<SearchBar value="hello" onChange={() => {}} />)
    expect(screen.getByDisplayValue("hello")).toBeInTheDocument()
  })

  it("renders with value", () => {
    const { getByPlaceholderText } = render(<SearchBar value="x" onChange={() => {}} />)
    expect(getByPlaceholderText("Search...")).toHaveValue("x")
  })

  it("calls onChange", () => {
  const onChange = vi.fn()
    const { getByPlaceholderText } = render(<SearchBar value="" onChange={onChange} />)
    fireEvent.change(getByPlaceholderText("Search..."), { target: { value: "a" } })
    expect(onChange).toHaveBeenCalledWith("a")
  })
})
