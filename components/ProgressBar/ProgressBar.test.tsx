import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ProgressBar } from "./ProgressBar"

describe("ProgressBar", () => {
  it("renders progress bar", () => {
    const { container } = render(<ProgressBar value={50} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it("displays correct percentage width", () => {
    const { container } = render(<ProgressBar value={50} max={100} />)
    const indicator = container.querySelector("[class*='bg-primary']")
    expect(indicator).toHaveStyle({ width: "50%" })
  })

  it("shows label when showLabel is true", () => {
    render(<ProgressBar value={50} max={100} showLabel labelPosition="left" />)
    expect(screen.getByText("50/100")).toBeInTheDocument()
  })

  it("shows 'in total' text when labelPosition is right", () => {
    render(<ProgressBar value={50} max={100} showLabel labelPosition="right" />)
    expect(screen.getByText("in total")).toBeInTheDocument()
  })

  it("clamps percentage to 0-100 range", () => {
    const { container } = render(<ProgressBar value={150} max={100} />)
    const indicator = container.querySelector("[class*='bg-primary']")
    expect(indicator).toHaveStyle({ width: "100%" })
  })

  it("handles negative values", () => {
    const { container } = render(<ProgressBar value={-10} max={100} />)
    const indicator = container.querySelector("[class*='bg-primary']")
    expect(indicator).toHaveStyle({ width: "0%" })
  })

  it("applies intent classes", () => {
    const { container } = render(<ProgressBar value={50} intent="success" />)
    const indicator = container.querySelector("[class*='bg-success']")
    expect(indicator).toBeInTheDocument()
  })

  it("applies custom className", () => {
    const { container } = render(<ProgressBar value={50} className="custom-class" />)
    expect(container.firstChild).toHaveClass("custom-class")
  })
})
