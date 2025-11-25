import { fireEvent, render, screen } from "@testing-library/react"
import React from "react"
import { DropdownMenu } from "./DropdownMenu"

const options = [
  { label: "Profile", value: "profile" },
  { label: "Logout", value: "logout" },
]

describe("DropdownMenu", () => {
  it("renders placeholder", () => {
    render(<DropdownMenu options={options} onSelect={() => {}} placeholder="Select" />)
    expect(screen.getByText("Select")).toBeInTheDocument()
  })

  it("shows options when clicked", () => {
    render(<DropdownMenu options={options} onSelect={() => {}} />)
    fireEvent.click(screen.getByText("Select"))
    expect(screen.getByText("Profile")).toBeInTheDocument()
    expect(screen.getByText("Logout")).toBeInTheDocument()
  })

  it("calls onSelect when option clicked", () => {
  const onSelect = vi.fn()
    render(<DropdownMenu options={options} onSelect={onSelect} />)
    fireEvent.click(screen.getByText("Select"))
    fireEvent.click(screen.getByText("Profile"))
    expect(onSelect).toHaveBeenCalledWith("profile")
  })

  it("shows single option when provided", () => {
    const { getByText } = render(<DropdownMenu options={[{ label: "A", value: "a" }]} onSelect={() => {}} />)
    fireEvent.click(getByText("Select"))
    expect(getByText("A")).toBeInTheDocument()
  })

  it("calls onSelect with correct value for single option", () => {
  const onSelect = vi.fn()
    const { getByText } = render(<DropdownMenu options={[{ label: "A", value: "a" }]} onSelect={onSelect} />)
    fireEvent.click(getByText("Select"))
    fireEvent.click(getByText("A"))
    expect(onSelect).toHaveBeenCalledWith("a")
  })
})
