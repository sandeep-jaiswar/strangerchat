import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Button } from "./Button"

describe("Button", () => {
  it("renders with children", () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText("Click me")).toBeInTheDocument()
  })

  it("applies correct intent classes", () => {
    const { container } = render(<Button intent="secondary">Secondary</Button>)
    const btn = container.querySelector("button")
    expect(btn).toHaveClass("bg-secondary")
    expect(btn).toHaveClass("text-secondary-foreground")
  })

  it("applies error intent", () => {
    const { container } = render(<Button intent="error">Error</Button>)
    const btn = container.querySelector("button")
    expect(btn).toHaveClass("bg-error")
    expect(btn).toHaveClass("text-error-foreground")
  })

  it("applies correct size classes", () => {
    const { container } = render(<Button size="sm">Small</Button>)
    const btn = container.querySelector("button")
    expect(btn).toHaveClass("h-8")
    expect(btn).toHaveClass("text-sm")
  })

  it("applies rounded classes", () => {
    const { container } = render(<Button rounded="full">Round</Button>)
    const btn = container.querySelector("button")
    expect(btn).toHaveClass("rounded-full")
  })

  it("applies custom className", () => {
    const { container } = render(<Button className="custom-btn">Custom</Button>)
    const btn = container.querySelector("button")
    expect(btn).toHaveClass("custom-btn")
  })

  it("renders disabled state", () => {
    const { container } = render(<Button disabled>Disabled</Button>)
    const btn = container.querySelector("button")
    expect(btn).toBeDisabled()
    expect(btn).toHaveClass("disabled:opacity-50")
  })
})
