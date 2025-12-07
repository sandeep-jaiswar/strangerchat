import { render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { DotsLoader, Loader } from "./Loader"

describe("Loader Component", () => {
  beforeEach(() => {
    document.body.innerHTML = ""
  })

  afterEach(() => {
    document.body.innerHTML = ""
  })

  describe("Basic Rendering", () => {
    it("renders with default props", () => {
      render(<Loader />)
      const loader = screen.getByRole("status")
      expect(loader).toBeInTheDocument()
      expect(screen.getByText("Loading...")).toBeInTheDocument()
    })

    it("renders with custom label", () => {
      render(<Loader label="Please wait..." />)
      const visibleLabel = screen.getByText("Please wait...", { selector: "span:not(.sr-only)" })
      expect(visibleLabel).toBeInTheDocument()
      expect(visibleLabel).toHaveClass("text-sm")
    })

    it("renders without label", () => {
      render(<Loader />)
      const visibleLabel = screen.queryByText("Loading...", { selector: "span:not(.sr-only)" })
      expect(visibleLabel).not.toBeInTheDocument()
      // But sr-only text should be present
      expect(screen.getByText("Loading...")).toHaveClass("sr-only")
    })

    it("has correct accessibility attributes", () => {
      render(<Loader />)
      const loader = screen.getByRole("status")
      expect(loader).toHaveAttribute("aria-live", "polite")
    })

    it("forwards ref correctly", () => {
      const ref = { current: null }
      render(<Loader ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it("has displayName set", () => {
      expect(Loader.displayName).toBe("Loader")
    })
  })

  describe("Size Variants", () => {
    it("renders xs size", () => {
      const { container } = render(<Loader size="xs" />)
      const spinner = container.querySelector(".animate-spin")
      expect(spinner).toHaveClass("w-3", "h-3")
    })

    it("renders sm size", () => {
      const { container } = render(<Loader size="sm" />)
      const spinner = container.querySelector(".animate-spin")
      expect(spinner).toHaveClass("w-4", "h-4")
    })

    it("renders md size (default)", () => {
      const { container } = render(<Loader size="md" />)
      const spinner = container.querySelector(".animate-spin")
      expect(spinner).toHaveClass("w-6", "h-6")
    })

    it("renders lg size", () => {
      const { container } = render(<Loader size="lg" />)
      const spinner = container.querySelector(".animate-spin")
      expect(spinner).toHaveClass("w-8", "h-8")
    })

    it("renders xl size", () => {
      const { container } = render(<Loader size="xl" />)
      const spinner = container.querySelector(".animate-spin")
      expect(spinner).toHaveClass("w-12", "h-12")
    })

    it("uses md size by default", () => {
      const { container } = render(<Loader />)
      const spinner = container.querySelector(".animate-spin")
      expect(spinner).toHaveClass("w-6", "h-6")
    })
  })

  describe("Intent Colors", () => {
    it("renders primary intent (default)", () => {
      const { container } = render(<Loader intent="primary" />)
      const spinner = container.querySelector(".animate-spin")
      expect(spinner).toHaveClass("border-[#0071e3]", "border-t-transparent")
    })

    it("renders secondary intent", () => {
      const { container } = render(<Loader intent="secondary" />)
      const spinner = container.querySelector(".animate-spin")
      expect(spinner).toHaveClass("border-gray-400", "border-t-transparent")
    })

    it("renders success intent", () => {
      const { container } = render(<Loader intent="success" />)
      const spinner = container.querySelector(".animate-spin")
      expect(spinner).toHaveClass("border-[#34c759]", "border-t-transparent")
    })

    it("renders warning intent", () => {
      const { container } = render(<Loader intent="warning" />)
      const spinner = container.querySelector(".animate-spin")
      expect(spinner).toHaveClass("border-[#ff9500]", "border-t-transparent")
    })

    it("renders danger intent", () => {
      const { container } = render(<Loader intent="danger" />)
      const spinner = container.querySelector(".animate-spin")
      expect(spinner).toHaveClass("border-[#ff3b30]", "border-t-transparent")
    })

    it("renders white intent", () => {
      const { container } = render(<Loader intent="white" />)
      const spinner = container.querySelector(".animate-spin")
      expect(spinner).toHaveClass("border-white", "border-t-transparent")
    })

    it("uses primary intent by default", () => {
      const { container } = render(<Loader />)
      const spinner = container.querySelector(".animate-spin")
      expect(spinner).toHaveClass("border-[#0071e3]")
    })
  })

  describe("Overlay Mode", () => {
    it("renders as overlay when overlay prop is true", () => {
      const { container } = render(<Loader overlay={true} />)
      const overlay = container.querySelector(".fixed.inset-0")
      expect(overlay).toBeInTheDocument()
      expect(overlay).toHaveClass("z-[200]", "bg-white/80", "backdrop-blur-sm")
    })

    it("does not render as overlay by default", () => {
      const { container } = render(<Loader />)
      const overlay = container.querySelector(".fixed.inset-0")
      expect(overlay).not.toBeInTheDocument()
    })

    it("renders inline when overlay is false", () => {
      const { container } = render(<Loader overlay={false} />)
      const overlay = container.querySelector(".fixed.inset-0")
      expect(overlay).not.toBeInTheDocument()
    })

    it("applies className to overlay wrapper when in overlay mode", () => {
      const { container } = render(<Loader overlay={true} className="custom-overlay" />)
      const overlay = container.querySelector(".fixed.inset-0")
      expect(overlay).toHaveClass("custom-overlay")
    })

    it("applies className to content wrapper when not in overlay mode", () => {
      render(<Loader overlay={false} className="custom-class" />)
      const loader = screen.getByRole("status")
      expect(loader).toHaveClass("custom-class")
    })

    it("has dark mode styles in overlay mode", () => {
      const { container } = render(<Loader overlay={true} />)
      const overlay = container.querySelector(".fixed.inset-0")
      expect(overlay).toHaveClass("dark:bg-gray-900/80")
    })
  })

  describe("Label Styling", () => {
    it("applies correct label classes", () => {
      render(<Loader label="Loading content..." />)
      const visibleLabel = screen.getByText("Loading content...", { selector: "span:not(.sr-only)" })
      expect(visibleLabel).toHaveClass("text-sm", "font-medium", "text-gray-700")
    })

    it("has dark mode styles for label", () => {
      render(<Loader label="Loading..." />)
      const visibleLabel = screen.getByText("Loading...", { selector: "span:not(.sr-only)" })
      expect(visibleLabel).toHaveClass("dark:text-gray-300")
    })

    it("shows sr-only text when label is provided", () => {
      render(<Loader label="Custom loading" />)
      const srOnlyText = screen.getAllByText("Custom loading").find((el) => el.classList.contains("sr-only"))
      expect(srOnlyText).toBeInTheDocument()
    })

    it("shows default sr-only text when no label provided", () => {
      render(<Loader />)
      const srOnlyText = screen.getByText("Loading...", { selector: ".sr-only" })
      expect(srOnlyText).toBeInTheDocument()
    })
  })

  describe("Container Styling", () => {
    it("has flex layout classes", () => {
      render(<Loader />)
      const loader = screen.getByRole("status")
      expect(loader).toHaveClass("flex", "flex-col", "items-center", "justify-center", "gap-3")
    })

    it("spinner has correct base classes", () => {
      const { container } = render(<Loader />)
      const spinner = container.querySelector(".animate-spin")
      expect(spinner).toHaveClass("inline-block", "rounded-full", "border-2", "border-solid")
    })
  })

  describe("Custom Props", () => {
    it("passes through additional props", () => {
      render(<Loader data-testid="custom-loader" />)
      const loader = screen.getByRole("status")
      expect(loader).toHaveAttribute("data-testid", "custom-loader")
    })

    it("merges custom className with defaults", () => {
      render(<Loader className="my-custom-class" />)
      const loader = screen.getByRole("status")
      expect(loader).toHaveClass("my-custom-class", "flex", "items-center")
    })
  })

  describe("Combined Props", () => {
    it("combines size and intent correctly", () => {
      const { container } = render(<Loader size="xl" intent="success" />)
      const spinner = container.querySelector(".animate-spin")
      expect(spinner).toHaveClass("w-12", "h-12", "border-[#34c759]")
    })

    it("combines overlay with label", () => {
      const { container } = render(<Loader overlay={true} label="Processing..." />)
      expect(container.querySelector(".fixed.inset-0")).toBeInTheDocument()
      expect(screen.getByText("Processing...", { selector: "span:not(.sr-only)" })).toBeInTheDocument()
    })

    it("combines all props together", () => {
      const { container } = render(
        <Loader overlay={true} size="lg" intent="danger" label="Error loading" className="custom" />
      )
      const overlay = container.querySelector(".fixed.inset-0")
      const spinner = container.querySelector(".animate-spin")
      expect(overlay).toHaveClass("custom")
      expect(spinner).toHaveClass("w-8", "h-8", "border-[#ff3b30]")
      expect(screen.getByText("Error loading", { selector: "span:not(.sr-only)" })).toBeInTheDocument()
    })
  })
})

describe("DotsLoader Component", () => {
  beforeEach(() => {
    document.body.innerHTML = ""
  })

  afterEach(() => {
    document.body.innerHTML = ""
  })

  describe("Basic Rendering", () => {
    it("renders with default props", () => {
      render(<DotsLoader />)
      const loader = screen.getByRole("status")
      expect(loader).toBeInTheDocument()
    })

    it("renders three dots", () => {
      const { container } = render(<DotsLoader />)
      const dots = container.querySelectorAll(".animate-bounce")
      expect(dots).toHaveLength(3)
    })

    it("has accessibility attributes", () => {
      render(<DotsLoader />)
      const loader = screen.getByRole("status")
      expect(loader).toHaveAttribute("aria-live", "polite")
    })

    it("has sr-only loading text", () => {
      render(<DotsLoader />)
      expect(screen.getByText("Loading...")).toHaveClass("sr-only")
    })
  })

  describe("Size Variants", () => {
    it("renders xs size", () => {
      const { container } = render(<DotsLoader size="xs" />)
      const dots = container.querySelectorAll(".animate-bounce")
      dots.forEach((dot) => {
        expect(dot).toHaveClass("w-1", "h-1")
      })
    })

    it("renders sm size", () => {
      const { container } = render(<DotsLoader size="sm" />)
      const dots = container.querySelectorAll(".animate-bounce")
      dots.forEach((dot) => {
        expect(dot).toHaveClass("w-1.5", "h-1.5")
      })
    })

    it("renders md size (default)", () => {
      const { container } = render(<DotsLoader size="md" />)
      const dots = container.querySelectorAll(".animate-bounce")
      dots.forEach((dot) => {
        expect(dot).toHaveClass("w-2", "h-2")
      })
    })

    it("renders lg size", () => {
      const { container } = render(<DotsLoader size="lg" />)
      const dots = container.querySelectorAll(".animate-bounce")
      dots.forEach((dot) => {
        expect(dot).toHaveClass("w-2.5", "h-2.5")
      })
    })

    it("renders xl size", () => {
      const { container } = render(<DotsLoader size="xl" />)
      const dots = container.querySelectorAll(".animate-bounce")
      dots.forEach((dot) => {
        expect(dot).toHaveClass("w-3", "h-3")
      })
    })

    it("uses md size by default", () => {
      const { container } = render(<DotsLoader />)
      const dots = container.querySelectorAll(".animate-bounce")
      dots.forEach((dot) => {
        expect(dot).toHaveClass("w-2", "h-2")
      })
    })
  })

  describe("Intent Colors", () => {
    it("renders primary intent (default)", () => {
      const { container } = render(<DotsLoader intent="primary" />)
      const dots = container.querySelectorAll(".animate-bounce")
      dots.forEach((dot) => {
        expect(dot).toHaveClass("bg-[#0071e3]")
      })
    })

    it("renders secondary intent", () => {
      const { container } = render(<DotsLoader intent="secondary" />)
      const dots = container.querySelectorAll(".animate-bounce")
      dots.forEach((dot) => {
        expect(dot).toHaveClass("bg-gray-400")
      })
    })

    it("renders success intent", () => {
      const { container } = render(<DotsLoader intent="success" />)
      const dots = container.querySelectorAll(".animate-bounce")
      dots.forEach((dot) => {
        expect(dot).toHaveClass("bg-[#34c759]")
      })
    })

    it("renders warning intent", () => {
      const { container } = render(<DotsLoader intent="warning" />)
      const dots = container.querySelectorAll(".animate-bounce")
      dots.forEach((dot) => {
        expect(dot).toHaveClass("bg-[#ff9500]")
      })
    })

    it("renders danger intent", () => {
      const { container } = render(<DotsLoader intent="danger" />)
      const dots = container.querySelectorAll(".animate-bounce")
      dots.forEach((dot) => {
        expect(dot).toHaveClass("bg-[#ff3b30]")
      })
    })

    it("renders white intent", () => {
      const { container } = render(<DotsLoader intent="white" />)
      const dots = container.querySelectorAll(".animate-bounce")
      dots.forEach((dot) => {
        expect(dot).toHaveClass("bg-white")
      })
    })

    it("uses primary intent by default", () => {
      const { container } = render(<DotsLoader />)
      const dots = container.querySelectorAll(".animate-bounce")
      dots.forEach((dot) => {
        expect(dot).toHaveClass("bg-[#0071e3]")
      })
    })
  })

  describe("Animation Delays", () => {
    it("applies staggered animation delays to dots", () => {
      const { container } = render(<DotsLoader />)
      const dots = container.querySelectorAll(".animate-bounce")
      expect(dots[0]).toHaveStyle({ animationDelay: "0ms" })
      expect(dots[1]).toHaveStyle({ animationDelay: "150ms" })
      expect(dots[2]).toHaveStyle({ animationDelay: "300ms" })
    })
  })

  describe("Container Styling", () => {
    it("has correct container classes", () => {
      render(<DotsLoader />)
      const loader = screen.getByRole("status")
      expect(loader).toHaveClass("inline-flex", "items-center", "gap-1")
    })

    it("each dot has rounded-full class", () => {
      const { container } = render(<DotsLoader />)
      const dots = container.querySelectorAll(".animate-bounce")
      dots.forEach((dot) => {
        expect(dot).toHaveClass("rounded-full")
      })
    })
  })

  describe("Custom Props", () => {
    it("applies custom className", () => {
      render(<DotsLoader className="custom-dots" />)
      const loader = screen.getByRole("status")
      expect(loader).toHaveClass("custom-dots")
    })

    it("merges custom className with defaults", () => {
      render(<DotsLoader className="my-custom-class" />)
      const loader = screen.getByRole("status")
      expect(loader).toHaveClass("my-custom-class", "inline-flex", "items-center")
    })
  })

  describe("Combined Props", () => {
    it("combines size and intent correctly", () => {
      const { container } = render(<DotsLoader size="xl" intent="success" />)
      const dots = container.querySelectorAll(".animate-bounce")
      dots.forEach((dot) => {
        expect(dot).toHaveClass("w-3", "h-3", "bg-[#34c759]")
      })
    })

    it("combines all props together", () => {
      const { container } = render(<DotsLoader size="lg" intent="danger" className="custom" />)
      const loader = screen.getByRole("status")
      const dots = container.querySelectorAll(".animate-bounce")
      expect(loader).toHaveClass("custom")
      dots.forEach((dot) => {
        expect(dot).toHaveClass("w-2.5", "h-2.5", "bg-[#ff3b30]")
      })
    })
  })
})
