import { render, screen } from "@testing-library/react"
import React from "react"
import { describe, expect, it } from "vitest"
import "@testing-library/jest-dom/vitest"

import { DotsLoader, Loader } from "./Loader"

describe("Loader", () => {
  it("renders default loader without overlay and without label", () => {
    const { container } = render(<Loader />)

    const status = screen.getByRole("status")
    expect(status).toBeInTheDocument()
    expect(status).toHaveClass("flex", "flex-col", "items-center", "justify-center", "gap-3")

    // Spinner element (first child)
    const spinner = container.querySelector("div > div") as HTMLDivElement
    expect(spinner).toBeInTheDocument()
    // default intent = primary, default size = md
    expect(spinner.className).toContain("border-[#0071e3]")
    expect(spinner.className).toContain("border-t-transparent")
    expect(spinner.className).toContain("w-6")
    expect(spinner.className).toContain("h-6")
    expect(spinner.className).toContain("animate-spin")

    // No visible label
    const visibleLabels = container.querySelectorAll("span:not(.sr-only)")
    expect(visibleLabels.length).toBe(0)

    // sr-only fallback text
    const srOnly = container.querySelector("span.sr-only") as HTMLSpanElement
    expect(srOnly).toBeInTheDocument()
    expect(srOnly).toHaveTextContent("Loading...")
  })

  it("renders label and uses it in sr-only text", () => {
    const label = "Loading data"
    const { container } = render(<Loader label={label} />)

    // visible label
    const labelEl = screen.getByText(label)
    expect(labelEl).toBeInTheDocument()
    expect(labelEl).toHaveClass("text-sm", "font-medium", "text-gray-700")

    // sr-only uses the same label
    const srOnly = container.querySelector("span.sr-only") as HTMLSpanElement
    expect(srOnly).toBeInTheDocument()
    expect(srOnly).toHaveTextContent(label)
  })

  it("applies intent and size variants correctly", () => {
    const intents: Array<["primary" | "secondary" | "success" | "warning" | "danger" | "white", string]> = [
      ["primary", "border-[#0071e3]"],
      ["secondary", "border-gray-400"],
      ["success", "border-[#34c759]"],
      ["warning", "border-[#ff9500]"],
      ["danger", "border-[#ff3b30]"],
      ["white", "border-white"],
    ]

    const sizes: Array<["xs" | "sm" | "md" | "lg" | "xl", string, string]> = [
      ["xs", "w-3", "h-3"],
      ["sm", "w-4", "h-4"],
      ["md", "w-6", "h-6"],
      ["lg", "w-8", "h-8"],
      ["xl", "w-12", "h-12"],
    ]

    intents.forEach(([intent, className]) => {
      const { container, unmount } = render(<Loader intent={intent} />)
      const spinner = container.querySelector("div > div") as HTMLDivElement
      expect(spinner.className).toContain(className)
      expect(spinner.className).toContain("border-t-transparent")
      unmount()
    })

    sizes.forEach(([size, wClass, hClass]) => {
      const { container, unmount } = render(<Loader size={size} />)
      const spinner = container.querySelector("div > div") as HTMLDivElement
      expect(spinner.className).toContain(wClass)
      expect(spinner.className).toContain(hClass)
      unmount()
    })
  })

  it("applies custom className to root content when not overlay", () => {
    render(<Loader className="custom-loader" />)

    const status = screen.getByRole("status")
    expect(status).toHaveClass("custom-loader")
    // non-overlay should NOT have overlay fixed classes
    expect(status.className).not.toContain("fixed")
    expect(status.className).not.toContain("inset-0")
  })

  it("renders as overlay when overlay is true", () => {
    render(<Loader overlay label="Overlay loading" className="overlay-extra" />)

    // Overlay wrapper
    const overlayWrapper = screen.getByText("Overlay loading").parentElement!.parentElement as HTMLElement
    expect(overlayWrapper).toBeInTheDocument()
    expect(overlayWrapper).toHaveClass(
      "fixed",
      "inset-0",
      "z-[200]",
      "flex",
      "items-center",
      "justify-center",
      "bg-white/80",
      "backdrop-blur-sm"
    )
    expect(overlayWrapper).toHaveClass("overlay-extra")

    // Inner content (the forwarded ref target) is role="status"
    const status = screen.getByRole("status")
    expect(status).toBeInTheDocument()
    // For overlay, content should NOT have the custom className
    expect(status.className).not.toContain("overlay-extra")
  })

  it("forwards ref to the content container", () => {
    const ref = React.createRef<HTMLDivElement>()
    const { rerender } = render(<Loader ref={ref} />)

    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    // In non-overlay mode, ref is the same as the role=status element
    expect(ref.current).toBe(screen.getByRole("status"))

    // In overlay mode, ref still points to the content div inside overlay wrapper
    const ref2 = React.createRef<HTMLDivElement>()
    rerender(<Loader ref={ref2} overlay />)
    expect(ref2.current).toBeInstanceOf(HTMLDivElement)
    expect(ref2.current).toBe(screen.getByRole("status"))
  })

  it("has correct displayName", () => {
    expect(Loader.displayName).toBe("Loader")
  })
})

describe("DotsLoader", () => {
  it("renders default dots loader with three dots and sr-only text", () => {
    const { container } = render(<DotsLoader />)

    const status = screen.getByRole("status")
    expect(status).toBeInTheDocument()
    expect(status).toHaveClass("inline-flex", "items-center", "gap-1")

    const dots = container.querySelectorAll("div > div")
    expect(dots.length).toBe(3)

    // default intent = primary, default size = md
    dots.forEach((dotEl) => {
      const dotClass = (dotEl as HTMLDivElement).className
      expect(dotClass).toContain("bg-[#0071e3]")
      expect(dotClass).toContain("w-2")
      expect(dotClass).toContain("h-2")
      expect(dotClass).toContain("animate-bounce")
    })

    const srOnly = container.querySelector("span.sr-only") as HTMLSpanElement
    expect(srOnly).toBeInTheDocument()
    expect(srOnly).toHaveTextContent("Loading...")
  })

  it("applies animation delays to each dot", () => {
    const { container } = render(<DotsLoader />)
    const dots = container.querySelectorAll("div > div")

    expect((dots[0] as HTMLDivElement).style.animationDelay).toBe("0ms")
    expect((dots[1] as HTMLDivElement).style.animationDelay).toBe("150ms")
    expect((dots[2] as HTMLDivElement).style.animationDelay).toBe("300ms")
  })

  it("applies intent and size variants correctly", () => {
    const intents: Array<["primary" | "secondary" | "success" | "warning" | "danger" | "white", string]> = [
      ["primary", "bg-[#0071e3]"],
      ["secondary", "bg-gray-400"],
      ["success", "bg-[#34c759]"],
      ["warning", "bg-[#ff9500]"],
      ["danger", "bg-[#ff3b30]"],
      ["white", "bg-white"],
    ]

    const sizes: Array<["xs" | "sm" | "md" | "lg" | "xl", string, string]> = [
      ["xs", "w-1", "h-1"],
      ["sm", "w-1.5", "h-1.5"],
      ["md", "w-2", "h-2"],
      ["lg", "w-2.5", "h-2.5"],
      ["xl", "w-3", "h-3"],
    ]

    intents.forEach(([intent, bg]) => {
      const { container, unmount } = render(<DotsLoader intent={intent} />)
      const firstDot = container.querySelector("div > div") as HTMLDivElement
      expect(firstDot.className).toContain(bg)
      unmount()
    })

    sizes.forEach(([size, wClass, hClass]) => {
      const { container, unmount } = render(<DotsLoader size={size} />)
      const firstDot = container.querySelector("div > div") as HTMLDivElement
      expect(firstDot.className).toContain(wClass)
      expect(firstDot.className).toContain(hClass)
      unmount()
    })
  })

  it("applies custom className to outer wrapper", () => {
    render(<DotsLoader className="custom-dots" />)

    const status = screen.getByRole("status")
    expect(status).toHaveClass("custom-dots")
  })
})
