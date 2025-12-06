import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import "@testing-library/jest-dom/vitest"

import { CircularProgress, ProgressBar } from "./ProgressBar"

describe("ProgressBar", () => {
  it("renders basic progress bar without label (default props)", () => {
    const { container } = render(<ProgressBar value={50} />)

    // outer progress wrapper
    const progress = screen.getByRole("progressbar")
    expect(progress).toBeInTheDocument()
    expect(progress).toHaveClass("bg-neutral-200")
    expect(progress).toHaveClass("h-2") // default size = md -> h-2
    expect(progress).toHaveAttribute("aria-valuenow", "50")
    expect(progress).toHaveAttribute("aria-valuemin", "0")
    expect(progress).toHaveAttribute("aria-valuemax", "100")

    // inner bar width ~ 50%
    const inner = container.querySelector("div > div") as HTMLDivElement
    expect(inner).toBeInTheDocument()
    expect(inner.style.width).toBe("50%")
  })

  it("clamps percentage between 0 and 100 (negative value)", () => {
    const { container } = render(<ProgressBar value={-20} />)

    const progress = screen.getByRole("progressbar")
    expect(progress).toHaveAttribute("aria-valuenow", "-20")

    const inner = container.querySelector("div > div") as HTMLDivElement
    expect(inner.style.width).toBe("0%") // clamped to 0
  })

  it("clamps percentage between 0 and 100 (value > max)", () => {
    const { container } = render(<ProgressBar value={150} max={100} />)

    const progress = screen.getByRole("progressbar")
    expect(progress).toHaveAttribute("aria-valuenow", "150")
    expect(progress).toHaveAttribute("aria-valuemax", "100")

    const inner = container.querySelector("div > div") as HTMLDivElement
    expect(inner.style.width).toBe("100%") // clamped to 100
  })

  it("handles custom max correctly", () => {
    const { container } = render(<ProgressBar value={25} max={200} />)

    const progress = screen.getByRole("progressbar")
    expect(progress).toHaveAttribute("aria-valuenow", "25")
    expect(progress).toHaveAttribute("aria-valuemax", "200")

    const inner = container.querySelector("div > div") as HTMLDivElement
    // 25 / 200 = 12.5% -> rounded width string "12.5%"
    expect(inner.style.width).toBe("12.5%")
  })

  it("applies intent classes for different intents", () => {
    const { container: primaryContainer } = render(<ProgressBar value={10} intent="primary" />)
    const primaryInner = primaryContainer.querySelector("div > div") as HTMLDivElement
    expect(primaryInner.className).toContain("bg-[#0071e3]")

    const { container: successContainer } = render(<ProgressBar value={10} intent="success" />)
    const successInner = successContainer.querySelector("div > div") as HTMLDivElement
    expect(successInner.className).toContain("bg-[#34c759]")

    const { container: warningContainer } = render(<ProgressBar value={10} intent="warning" />)
    const warningInner = warningContainer.querySelector("div > div") as HTMLDivElement
    expect(warningInner.className).toContain("bg-[#ff9500]")

    const { container: dangerContainer } = render(<ProgressBar value={10} intent="danger" />)
    const dangerInner = dangerContainer.querySelector("div > div") as HTMLDivElement
    expect(dangerInner.className).toContain("bg-[#ff3b30]")

    const { container: infoContainer } = render(<ProgressBar value={10} intent="info" />)
    const infoInner = infoContainer.querySelector("div > div") as HTMLDivElement
    expect(infoInner.className).toContain("bg-[#007aff]")
  })

  it("applies size classes correctly", () => {
    const { rerender } = render(<ProgressBar value={10} size="sm" />)
    let progress = screen.getByRole("progressbar")
    expect(progress).toHaveClass("h-1")

    rerender(<ProgressBar value={10} size="md" />)
    progress = screen.getByRole("progressbar")
    expect(progress).toHaveClass("h-2")

    rerender(<ProgressBar value={10} size="lg" />)
    progress = screen.getByRole("progressbar")
    expect(progress).toHaveClass("h-3")
  })

  it("applies custom className to the progress bar wrapper", () => {
    const { container } = render(<ProgressBar value={10} className="custom-class" />)

    const progress = screen.getByRole("progressbar")
    expect(progress).toHaveClass("custom-class")

    const inner = container.querySelector("div > div") as HTMLDivElement
    expect(inner).toBeInTheDocument()
  })

  it("renders label at right by default when showLabel is true", () => {
    render(<ProgressBar value={50} showLabel />)

    const wrapper = screen.getByText("50%").parentElement as HTMLElement
    expect(wrapper).toHaveClass("flex", "items-center", "gap-3") // main wrapper

    const progress = screen.getByRole("progressbar")
    expect(progress).toBeInTheDocument()

    const label = screen.getByText("50%")
    expect(label).toHaveClass("min-w-[3rem]", "text-sm", "font-medium", "text-neutral-700")
  })

  it("renders label at left when labelPosition is left", () => {
    render(<ProgressBar value={25} showLabel labelPosition="left" />)

    const label = screen.getByText("25%")
    const wrapper = label.parentElement as HTMLElement

    expect(wrapper).toHaveClass("flex", "items-center", "gap-3")
    // label should be first child
    expect(wrapper.firstChild).toBe(label)
  })

  it("renders label on top when labelPosition is top", () => {
    render(<ProgressBar value={75} showLabel labelPosition="top" />)

    const label = screen.getByText("75%")
    const topWrapper = label.closest("div")?.parentElement as HTMLElement

    expect(topWrapper).toHaveClass("flex", "flex-col", "gap-2")

    const progress = screen.getByRole("progressbar")
    expect(progress).toBeInTheDocument()
  })

  it("uses custom formatLabel when provided", () => {
    const formatLabel = (value: number, max: number) => `${value} / ${max}`
    render(<ProgressBar value={30} max={60} showLabel formatLabel={formatLabel} />)

    expect(screen.getByText("30 / 60")).toBeInTheDocument()
  })

  it("has correct displayName", () => {
    expect(ProgressBar.displayName).toBe("ProgressBar")
  })
})

describe("CircularProgress", () => {
  it("renders circular progress with default props", () => {
    render(<CircularProgress value={50} />)

    const wrapper = screen.getByRole("progressbar").parentElement as HTMLElement
    expect(wrapper).toBeInTheDocument()
    expect(wrapper).toHaveClass("relative", "inline-flex", "items-center", "justify-center")

    const svg = screen.getByRole("progressbar")
    expect(svg).toHaveAttribute("width", "80")
    expect(svg).toHaveAttribute("height", "80")
    expect(svg).toHaveAttribute("aria-valuenow", "50")
    expect(svg).toHaveAttribute("aria-valuemin", "0")
    expect(svg).toHaveAttribute("aria-valuemax", "100")

    // two circles: background + progress
    const circles = svg.querySelectorAll("circle")
    expect(circles.length).toBe(2)

    // label shows 50%
    expect(screen.getByText("50%")).toBeInTheDocument()
  })

  it("clamps percentage between 0 and 100 (value < 0 and value > max)", () => {
    // value < 0 -> 0%
    const { rerender, container } = render(<CircularProgress value={-10} />)
    let label = screen.getByText("0%")
    expect(label).toBeInTheDocument()

    let svg = container.querySelector("svg") as SVGSVGElement
    let circles = svg.querySelectorAll("circle")
    const progressCircle = circles[1]
    const radius = (80 - 8) / 2
    const circumference = 2 * Math.PI * radius
    const offset = parseFloat(progressCircle.getAttribute("stroke-dashoffset") || "0")
    // for 0% offset ~ circumference
    expect(Math.round(offset)).toBe(Math.round(circumference))

    // value > max -> 100%
    rerender(<CircularProgress value={200} max={100} />)
    label = screen.getByText("100%")
    expect(label).toBeInTheDocument()

    svg = container.querySelector("svg") as SVGSVGElement
    circles = svg.querySelectorAll("circle")
    const progressCircle2 = circles[1]
    const offset2 = parseFloat(progressCircle2.getAttribute("stroke-dashoffset") || "0")
    // for 100% offset ~ 0
    expect(Math.round(offset2)).toBe(0)
  })

  it("respects custom size and strokeWidth and label font size", () => {
    const size = 120
    const strokeWidth = 12
    const { container } = render(<CircularProgress value={60} size={size} strokeWidth={strokeWidth} />)

    const svg = screen.getByRole("progressbar")
    expect(svg).toHaveAttribute("width", String(size))
    expect(svg).toHaveAttribute("height", String(size))

    const circles = svg.querySelectorAll("circle")
    const radius = (size - strokeWidth) / 2
    const expectedCircumference = 2 * Math.PI * radius
    const progressCircle = circles[1]
    const dashArray = parseFloat(progressCircle.getAttribute("stroke-dasharray") || "0")
    expect(Math.round(dashArray)).toBe(Math.round(expectedCircumference))

    const label = screen.getByText("60%")
    const labelElement = label as HTMLSpanElement
    expect(labelElement.style.fontSize).toBe(String(size / 5) + "px")
  })

  it("applies intent colors correctly", () => {
    const intents: Array<["primary" | "success" | "warning" | "danger" | "info", string]> = [
      ["primary", "#0071e3"],
      ["success", "#34c759"],
      ["warning", "#ff9500"],
      ["danger", "#ff3b30"],
      ["info", "#007aff"],
    ]

    intents.forEach(([intent, color]) => {
      const { container, unmount } = render(<CircularProgress value={40} intent={intent} />)
      const svg = container.querySelector("svg") as SVGSVGElement
      const circles = svg.querySelectorAll("circle")
      const progressCircle = circles[1]
      expect(progressCircle.getAttribute("stroke")).toBe(color)
      unmount()
    })
  })

  it("can hide label when showLabel is false", () => {
    const { container } = render(<CircularProgress value={30} showLabel={false} />)

    // progressbar is still there
    const svg = screen.getByRole("progressbar")
    expect(svg).toBeInTheDocument()

    // no percentage span
    const label = container.querySelector("span")
    expect(label).toBeNull()
  })

  it("applies custom className to wrapper", () => {
    render(<CircularProgress value={10} className="custom-circle" />)

    const wrapper = screen.getByRole("progressbar").parentElement as HTMLElement
    expect(wrapper).toHaveClass("custom-circle")
  })

  it("has correct displayName", () => {
    expect(CircularProgress.displayName).toBe("CircularProgress")
  })
})
