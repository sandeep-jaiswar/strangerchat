import { act, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import "@testing-library/jest-dom/vitest"

import { Toast, ToastContainer } from "./Toast"

describe("Toast", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it("renders message, description, default icon and progress bar by default", () => {
    const onClose = vi.fn()
    const { container } = render(<Toast message="Hello world" description="Details" onClose={onClose} />)

    const alert = screen.getByRole("alert")
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveTextContent("Hello world")
    expect(alert).toHaveTextContent("Details")
    expect(alert).toHaveAttribute("aria-live", "polite")

    // default icon is rendered (inside aria-hidden container)
    const iconContainer = alert.querySelector('[aria-hidden="true"]')
    expect(iconContainer).toBeInTheDocument()
    expect(iconContainer?.querySelector("svg")).toBeInTheDocument()

    // progress bar is rendered for duration > 0
    const progressInner = container.querySelector("[style]") as HTMLDivElement
    expect(progressInner).toBeInTheDocument()
    expect(progressInner.style.width).toBe("100%")
  })

  it("uses custom icon when provided", () => {
    const onClose = vi.fn()
    render(<Toast message="With custom icon" onClose={onClose} icon={<span data-testid="custom-icon">ICON</span>} />)

    expect(screen.getByTestId("custom-icon")).toBeInTheDocument()

    // still has close button icon, but display icon is our custom node
    const iconContainer = screen.getByRole("alert").querySelector('[aria-hidden="true"]')
    expect(iconContainer?.textContent).toContain("ICON")
  })

  it("does not render icon when icon is explicitly null", () => {
    const onClose = vi.fn()
    render(<Toast message="No icon" onClose={onClose} icon={null} />)

    const alert = screen.getByRole("alert")
    expect(alert.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument()
  })

  it("does not render description when not provided", () => {
    const onClose = vi.fn()
    render(<Toast message="Only message" onClose={onClose} />)

    expect(screen.getByText("Only message")).toBeInTheDocument()
    // no second paragraph
    const paragraphs = screen.getAllByText(/Only message/)
    expect(paragraphs.length).toBeGreaterThanOrEqual(1)
    expect(screen.queryByText("Details")).not.toBeInTheDocument()
  })

  it("does not render close button when showCloseButton is false", () => {
    const onClose = vi.fn()
    render(<Toast message="No close button" onClose={onClose} showCloseButton={false} />)

    expect(screen.queryByRole("button", { name: /close notification/i })).not.toBeInTheDocument()
  })

  it("applies exit animation and calls onClose after duration (auto-dismiss)", () => {
    const onClose = vi.fn()
    const duration = 1000

    render(<Toast message="Auto" onClose={onClose} duration={duration} />)

    const alert = screen.getByRole("alert")
    expect(alert.className).toContain("translate-x-0")
    expect(onClose).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(duration)
    })

    // isExiting should now be true -> exit classes applied
    expect(alert.className).toContain("translate-x-full")
    expect(alert.className).toContain("opacity-0")

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("updates progress bar over time and clamps at 0%", () => {
    const onClose = vi.fn()
    const duration = 100
    const { container } = render(<Toast message="Progress" onClose={onClose} duration={duration} />)

    const progressInner = container.querySelector("[style]") as HTMLDivElement
    expect(progressInner).toBeInTheDocument()
    expect(progressInner.style.width).toBe("100%")

    // after 50ms, progress should be reduced
    act(() => {
      vi.advanceTimersByTime(50)
    })
    expect(progressInner.style.width).not.toBe("100%")

    // advance enough so that internal progress would go below 0
    act(() => {
      vi.advanceTimersByTime(500)
    })
    // clamped to 0%
    expect(progressInner.style.width).toBe("0%")
  })

  it("does not render progress bar when duration is 0", () => {
    const onClose = vi.fn()
    const { container } = render(<Toast message="Persistent" onClose={onClose} duration={0} />)

    const progressInner = container.querySelector("[style]")
    expect(progressInner).toBeNull()
  })

  it("manual close via close button triggers exit and onClose", () => {
    const onClose = vi.fn()
    render(<Toast message="Close me" onClose={onClose} duration={0} />)

    const alert = screen.getByRole("alert")
    const button = screen.getByRole("button", { name: /close notification/i })

    fireEvent.click(button)

    // exit animation applied
    expect(alert.className).toContain("translate-x-full")

    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("clicking toast closes it when no auto-hide and no close button", () => {
    const onClose = vi.fn()
    render(<Toast message="Tap to close" onClose={onClose} duration={0} showCloseButton={false} />)

    const alert = screen.getByRole("alert")
    expect(alert).toHaveClass("cursor-pointer")

    fireEvent.click(alert)

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("clicking toast does not immediately close when duration > 0 even if showCloseButton is false", () => {
    const onClose = vi.fn()
    render(
      <Toast message="Should auto-dismiss, not on click" onClose={onClose} duration={1000} showCloseButton={false} />
    )

    const alert = screen.getByRole("alert")
    expect(alert).not.toHaveClass("cursor-pointer")

    fireEvent.click(alert)

    act(() => {
      vi.advanceTimersByTime(100)
    })

    // not closed yet from click
    expect(onClose).not.toHaveBeenCalled()
  })

  it("cleans up timers on unmount so onClose is not called", () => {
    const onClose = vi.fn()
    const { unmount } = render(<Toast message="Will unmount" onClose={onClose} duration={1000} />)

    unmount()

    act(() => {
      vi.runAllTimers()
    })

    expect(onClose).not.toHaveBeenCalled()
  })

  it("has correct displayName", () => {
    expect(Toast.displayName).toBe("Toast")
  })
})

describe("ToastContainer", () => {
  it("renders children and default position with a11y attributes", () => {
    render(
      <ToastContainer>
        <div data-testid="child">Child</div>
      </ToastContainer>
    )

    const container = screen.getByTestId("child").parentElement as HTMLElement
    expect(container).toBeInTheDocument()
    expect(container).toHaveAttribute("aria-live", "polite")
    expect(container).toHaveAttribute("aria-atomic", "true")
    expect(container).toHaveClass("fixed")
    // default is top-right
    expect(container).toHaveClass("top-4", "right-4")
  })

  it.each([
    ["top-left", "top-4", "left-4"],
    ["top-right", "top-4", "right-4"],
    ["top-center", "top-4", "left-1/2"],
    ["bottom-left", "bottom-4", "left-4"],
    ["bottom-right", "bottom-4", "right-4"],
    ["bottom-center", "bottom-4", "left-1/2"],
  ] as const)("applies correct classes for position %s", (position, verticalClass, horizontalClass) => {
    render(
      <ToastContainer position={position}>
        <div data-testid={`child-${position}`}>Child</div>
      </ToastContainer>
    )

    const container = screen.getByTestId(`child-${position}`).parentElement as HTMLElement
    expect(container).toHaveClass(verticalClass)
    expect(container).toHaveClass(horizontalClass)
  })

  it("has correct displayName", () => {
    expect(ToastContainer.displayName).toBe("ToastContainer")
  })
})
