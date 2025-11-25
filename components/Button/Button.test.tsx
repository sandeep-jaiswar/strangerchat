import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Button } from "./Button"

describe("Button", () => {
  it("renders with children", () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText("Click me")).toBeInTheDocument()
  })

  it("applies correct solid secondary intent classes", () => {
    const { container } = render(
      <Button variant="solid" intent="secondary">
        Secondary
      </Button>
    )
    const btn = container.querySelector("button")
    expect(btn).toHaveClass("bg-secondary")
    expect(btn).toHaveClass("text-secondary-foreground")
  })

  it("applies solid error intent", () => {
    const { container } = render(
      <Button variant="solid" intent="error">
        Error
      </Button>
    )
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

  it("applies outline variant classes", () => {
    const { container } = render(
      <Button variant="outline" intent="primary">
        Outline
      </Button>
    )
    const btn = container.querySelector("button")
    expect(btn).toHaveClass("border")
    expect(btn).toHaveClass("bg-transparent")
    expect(btn).toHaveClass("border-primary")
    expect(btn).toHaveClass("text-primary")
  })

  it("applies ghost variant classes", () => {
    const { container } = render(
      <Button variant="ghost" intent="primary">
        Ghost
      </Button>
    )
    const btn = container.querySelector("button")
    expect(btn).toHaveClass("bg-transparent")
    expect(btn).toHaveClass("text-primary")
  })

  it("renders left and right icons", () => {
    render(
      <Button leftIcon={<span data-testid="left-icon">L</span>} rightIcon={<span data-testid="right-icon">R</span>}>
        With Icons
      </Button>
    )
    expect(screen.getByTestId("left-icon")).toBeInTheDocument()
    expect(screen.getByTestId("right-icon")).toBeInTheDocument()
    expect(screen.getByText("With Icons")).toBeInTheDocument()
  })

  it("applies icon size classes", () => {
    const { container } = render(<Button size="icon">Icon</Button>)
    const btn = container.querySelector("button")
    expect(btn).toHaveClass("h-10")
    expect(btn).toHaveClass("w-10")
    expect(btn).toHaveClass("p-0")
  })
})
