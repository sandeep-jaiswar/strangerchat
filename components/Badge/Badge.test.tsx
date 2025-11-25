import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Badge } from "./Badge"

describe("Badge", () => {
  it("renders with children", () => {
    render(<Badge>Label</Badge>)
    expect(screen.getByText("Label")).toBeInTheDocument()
  })

  it("applies solid primary intent by default", () => {
    const { container } = render(<Badge>Primary</Badge>)
    const badge = container.querySelector("span")
    expect(badge).toHaveClass("bg-primary")
    expect(badge).toHaveClass("text-primary-foreground")
  })

  it("applies outline variant", () => {
    const { container } = render(
      <Badge variant="outline" intent="primary">
        Outline
      </Badge>
    )
    const badge = container.querySelector("span")
    expect(badge).toHaveClass("border")
    expect(badge).toHaveClass("bg-transparent")
    expect(badge).toHaveClass("border-primary")
  })

  it("applies soft variant", () => {
    const { container } = render(
      <Badge variant="soft" intent="success">
        Soft
      </Badge>
    )
    const badge = container.querySelector("span")
    expect(badge).toHaveClass("text-success")
  })

  it("renders left and right icons", () => {
    render(
      <Badge leftIcon={<span data-testid="left-icon">L</span>} rightIcon={<span data-testid="right-icon">R</span>}>
        With Icons
      </Badge>
    )
    expect(screen.getByTestId("left-icon")).toBeInTheDocument()
    expect(screen.getByTestId("right-icon")).toBeInTheDocument()
    expect(screen.getByText("With Icons")).toBeInTheDocument()
  })

  it("applies size classes", () => {
    const { container } = render(<Badge size="sm">Small</Badge>)
    const badge = container.querySelector("span")
    expect(badge).toHaveClass("h-6")
    expect(badge).toHaveClass("text-xs")
  })

  it("applies custom className", () => {
    const { container } = render(<Badge className="custom-class">Custom</Badge>)
    const badge = container.querySelector("span")
    expect(badge).toHaveClass("custom-class")
  })
})
