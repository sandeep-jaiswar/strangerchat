import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Select } from "./Select"

const options = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
]

describe("Select", () => {
  it("renders with placeholder", () => {
    render(<Select options={options} placeholder="Select language" />)
    expect(screen.getByText("Select language")).toBeInTheDocument()
  })

  it("renders with label", () => {
    render(<Select options={options} label="Language" />)
    expect(screen.getByText("Language")).toBeInTheDocument()
  })

  it("renders disabled state", () => {
    render(<Select options={options} disabled />)
    const trigger = screen.getByRole("combobox")
    expect(trigger).toBeDisabled()
  })

  it("renders with default value", () => {
    render(<Select options={options} defaultValue="es" />)
    expect(screen.getByText("Spanish")).toBeInTheDocument()
  })

  it("applies custom className to trigger", () => {
    const { container } = render(<Select options={options} className="custom-class" />)
    const trigger = container.querySelector("[role='combobox']")
    expect(trigger).toHaveClass("custom-class")
  })
})
