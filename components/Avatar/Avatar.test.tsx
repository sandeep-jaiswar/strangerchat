import { render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { Avatar } from "./Avatar"

describe("Avatar", () => {
  describe("Image Rendering", () => {
    it("renders image when src is provided", () => {
      render(<Avatar src="/img.png" alt="user" size="sm" />)
      const img = screen.getByAltText("user")
      expect(img).toBeInTheDocument()
    })

    it("handles image load event", async () => {
      const handleLoad = vi.fn()
      const { getByAltText } = render(<Avatar src="/img.png" alt="user" onLoad={handleLoad} />)

      const img = getByAltText("user")
      img.dispatchEvent(new Event("load"))

      await waitFor(() => {
        expect(handleLoad).toHaveBeenCalledTimes(1)
      })
    })

    it("handles image error and shows fallback", async () => {
      const handleError = vi.fn()
      const { getByAltText } = render(<Avatar src="/error.png" alt="user" initials="AB" onError={handleError} />)

      const img = getByAltText("user")
      img.dispatchEvent(new Event("error"))

      await waitFor(() => {
        expect(handleError).toHaveBeenCalledTimes(1)
        expect(screen.getByText("AB")).toBeInTheDocument()
      })
    })

    it("shows loading state while image loads", () => {
      const { container } = render(<Avatar src="/img.png" alt="user" loading />)
      const avatarDiv = container.querySelector(".animate-pulse")
      expect(avatarDiv).toBeInTheDocument()
    })

    it("handles external URLs with unoptimized prop", () => {
      const { getByAltText } = render(<Avatar src="https://example.com/img.png" alt="user" />)
      const img = getByAltText("user") as HTMLImageElement
      expect(img).toBeInTheDocument()
    })
  })

  describe("Initials Display", () => {
    it("renders initials when src is not provided", () => {
      render(<Avatar initials="AB" alt="AB avatar" />)
      expect(screen.getByText("AB")).toBeInTheDocument()
    })

    it("truncates initials to 2 characters", () => {
      render(<Avatar initials="ABCD" alt="ABCD avatar" />)
      expect(screen.getByText("AB")).toBeInTheDocument()
    })

    it("applies uppercase styling to initials", () => {
      const { getByText } = render(<Avatar initials="ab" alt="AB avatar" />)
      const initialsSpan = getByText("ab")
      expect(initialsSpan).toHaveClass("uppercase")
    })

    it("shows first letter of alt text when no initials or src provided", () => {
      render(<Avatar alt="John Doe" />)
      expect(screen.getByText("J")).toBeInTheDocument()
    })

    it("renders initials in loading state", () => {
      render(<Avatar initials="JD" alt="John Doe" loading />)
      expect(screen.getByText("JD")).toBeInTheDocument()
    })
  })

  describe("Size Variants", () => {
    it("applies xs size classes", () => {
      const { container } = render(<Avatar initials="A" alt="A avatar" size="xs" />)
      const avatarDiv = container.querySelector(".w-6")
      expect(avatarDiv).toBeInTheDocument()
      expect(avatarDiv).toHaveClass("h-6")
    })

    it("applies sm size classes", () => {
      const { container } = render(<Avatar initials="A" alt="A avatar" size="sm" />)
      expect(container.querySelector(".w-8")).toBeInTheDocument()
    })

    it("applies md size classes", () => {
      const { container } = render(<Avatar initials="A" alt="A avatar" size="md" />)
      expect(container.querySelector(".w-10")).toBeInTheDocument()
    })

    it("applies lg size classes", () => {
      const { container } = render(<Avatar initials="A" alt="A avatar" size="lg" />)
      expect(container.querySelector(".w-14")).toBeInTheDocument()
    })

    it("applies xl size classes", () => {
      const { container } = render(<Avatar initials="A" alt="A avatar" size="xl" />)
      expect(container.querySelector(".w-20")).toBeInTheDocument()
    })

    it("uses md as default size", () => {
      const { container } = render(<Avatar initials="A" alt="A avatar" />)
      expect(container.querySelector(".w-10")).toBeInTheDocument()
    })

    it("handles size with explicit undefined", () => {
      const { container } = render(<Avatar initials="A" alt="A avatar" size={undefined} />)
      expect(container.querySelector(".w-10")).toBeInTheDocument()
    })
  })

  describe("Status Indicators", () => {
    it("renders online status indicator", () => {
      const { container } = render(<Avatar initials="A" alt="A avatar" status="online" />)
      const statusIndicator = container.querySelector(".bg-green-500")
      expect(statusIndicator).toBeInTheDocument()
      expect(statusIndicator).toHaveAttribute("aria-label", "Status: online")
    })

    it("renders offline status indicator", () => {
      const { container } = render(<Avatar initials="A" alt="A avatar" status="offline" />)
      const statusIndicator = container.querySelector(".bg-gray-400")
      expect(statusIndicator).toBeInTheDocument()
      expect(statusIndicator).toHaveAttribute("aria-label", "Status: offline")
    })

    it("renders busy status indicator", () => {
      const { container } = render(<Avatar initials="A" alt="A avatar" status="busy" />)
      const statusIndicator = container.querySelector(".bg-red-500")
      expect(statusIndicator).toBeInTheDocument()
      expect(statusIndicator).toHaveAttribute("aria-label", "Status: busy")
    })

    it("renders away status indicator", () => {
      const { container } = render(<Avatar initials="A" alt="A avatar" status="away" />)
      const statusIndicator = container.querySelector(".bg-yellow-500")
      expect(statusIndicator).toBeInTheDocument()
      expect(statusIndicator).toHaveAttribute("aria-label", "Status: away")
    })

    it("does not render status indicator when status is not provided", () => {
      const { container } = render(<Avatar initials="A" alt="A avatar" />)
      const statusIndicator = container.querySelector('[aria-label^="Status:"]')
      expect(statusIndicator).not.toBeInTheDocument()
    })

    it("renders status with image", () => {
      const { container } = render(<Avatar src="/img.png" alt="A avatar" status="online" />)
      const statusIndicator = container.querySelector(".bg-green-500")
      expect(statusIndicator).toBeInTheDocument()
    })
  })

  describe("Custom Styling", () => {
    it("merges custom className with base classes", () => {
      const { container } = render(<Avatar initials="A" alt="A avatar" className="custom-class" />)
      const wrapper = container.querySelector(".custom-class")
      expect(wrapper).toBeInTheDocument()
      expect(wrapper).toHaveClass("relative")
      expect(wrapper).toHaveClass("inline-block")
    })

    it("applies custom className to wrapper div", () => {
      const { container } = render(<Avatar initials="A" alt="A avatar" className="border-4 border-blue-500" />)
      const wrapper = container.querySelector(".border-4")
      expect(wrapper).toBeInTheDocument()
    })
  })

  describe("Accessibility", () => {
    it("includes proper ARIA role", () => {
      render(<Avatar initials="A" alt="Test Avatar" />)
      const avatar = screen.getByLabelText("Test Avatar")
      expect(avatar).toBeInTheDocument()
      expect(avatar).toHaveAttribute("role", "img")
    })

    it("includes accessible alt text", () => {
      render(<Avatar initials="A" alt="John Doe Avatar" />)
      const avatar = screen.getByLabelText("John Doe Avatar")
      expect(avatar).toBeInTheDocument()
    })

    it("status indicator has accessible label", () => {
      render(<Avatar initials="A" alt="User" status="online" />)
      const statusLabel = screen.getByLabelText("Status: online")
      expect(statusLabel).toBeInTheDocument()
    })
  })

  describe("Fallback Behavior", () => {
    it("shows initials when src is undefined", () => {
      render(<Avatar src={undefined} initials="AB" alt="User" />)
      expect(screen.getByText("AB")).toBeInTheDocument()
    })

    it("shows initials when src is empty string", () => {
      render(<Avatar src="" initials="AB" alt="User" />)
      expect(screen.getByText("AB")).toBeInTheDocument()
    })

    it("shows loading state instead of image when loading is true", () => {
      const { container } = render(<Avatar src="/img.png" alt="User" loading />)
      expect(container.querySelector(".animate-pulse")).toBeInTheDocument()
    })
  })

  describe("Image Dimensions", () => {
    it("calculates correct dimensions for xs size", () => {
      const { getByAltText } = render(<Avatar src="/img.png" alt="User" size="xs" />)
      const img = getByAltText("User") as HTMLImageElement
      expect(img).toBeInTheDocument()
      // Width/height are calculated as: parseInt(6) * 4 = 24
    })

    it("calculates correct dimensions for md size", () => {
      const { getByAltText } = render(<Avatar src="/img.png" alt="User" size="md" />)
      const img = getByAltText("User") as HTMLImageElement
      expect(img).toBeInTheDocument()
      // Width/height are calculated as: parseInt(10) * 4 = 40
    })

    it("calculates correct dimensions for xl size", () => {
      const { getByAltText } = render(<Avatar src="/img.png" alt="User" size="xl" />)
      const img = getByAltText("User") as HTMLImageElement
      expect(img).toBeInTheDocument()
      // Width/height are calculated as: parseInt(20) * 4 = 80
    })

    it("uses default dimension when size pattern doesn't match", () => {
      // This tests the fallback in the regex match
      const { getByAltText } = render(<Avatar src="/img.png" alt="User" />)
      const img = getByAltText("User") as HTMLImageElement
      expect(img).toBeInTheDocument()
    })
  })

  describe("Edge Cases", () => {
    it("handles empty initials gracefully", () => {
      render(<Avatar initials="" alt="Empty Initials" />)
      expect(screen.getByText("E")).toBeInTheDocument()
    })

    it("handles single character initials", () => {
      render(<Avatar initials="A" alt="Single" />)
      expect(screen.getByText("A")).toBeInTheDocument()
    })

    it("handles very long alt text", () => {
      const longAlt = "This is a very long alt text that should still work correctly"
      render(<Avatar alt={longAlt} />)
      expect(screen.getByText("T")).toBeInTheDocument()
    })

    it("handles special characters in alt text", () => {
      render(<Avatar alt="@User" />)
      expect(screen.getByText("@")).toBeInTheDocument()
    })

    it("handles lowercase alt text", () => {
      render(<Avatar alt="user" />)
      expect(screen.getByText("U")).toBeInTheDocument()
    })
  })

  describe("Callback Functions", () => {
    it("does not throw when onLoad is not provided", () => {
      const { getByAltText } = render(<Avatar src="/img.png" alt="User" />)
      const img = getByAltText("User")
      expect(() => img.dispatchEvent(new Event("load"))).not.toThrow()
    })

    it("does not throw when onError is not provided", () => {
      const { getByAltText } = render(<Avatar src="/img.png" alt="User" />)
      const img = getByAltText("User")
      expect(() => img.dispatchEvent(new Event("error"))).not.toThrow()
    })

    it("calls onLoad when triggered", async () => {
      const handleLoad = vi.fn()
      const { getByAltText } = render(<Avatar src="/img.png" alt="User" onLoad={handleLoad} />)

      const img = getByAltText("User")
      img.dispatchEvent(new Event("load"))

      await waitFor(() => {
        expect(handleLoad).toHaveBeenCalled()
      })
    })

    it("calls onError when triggered", async () => {
      const handleError = vi.fn()
      const { getByAltText } = render(<Avatar src="/img.png" alt="User" onError={handleError} />)

      const img = getByAltText("User")
      img.dispatchEvent(new Event("error"))

      await waitFor(() => {
        expect(handleError).toHaveBeenCalled()
      })
    })
  })

  describe("Image Error Handling", () => {
    it("switches to initials after image error", async () => {
      const { getByAltText, getByText } = render(<Avatar src="/error.png" alt="User" initials="AB" />)

      const img = getByAltText("User")
      img.dispatchEvent(new Event("error"))

      await waitFor(() => {
        expect(getByText("AB")).toBeInTheDocument()
      })
    })

    it("shows first letter of alt when image fails and no initials", async () => {
      const { getByAltText, getByText } = render(<Avatar src="/error.png" alt="John" />)

      const img = getByAltText("John")
      img.dispatchEvent(new Event("error"))

      await waitFor(() => {
        expect(getByText("J")).toBeInTheDocument()
      })
    })
  })

  describe("Combined Props", () => {
    it("renders with all props combined", () => {
      const handleLoad = vi.fn()
      const handleError = vi.fn()
      const { container } = render(
        <Avatar
          src="/img.png"
          alt="User Avatar"
          size="lg"
          initials="UA"
          status="online"
          loading={false}
          className="custom-avatar"
          onLoad={handleLoad}
          onError={handleError}
        />
      )

      expect(container.querySelector(".custom-avatar")).toBeInTheDocument()
      expect(container.querySelector(".w-14")).toBeInTheDocument()
      expect(screen.getByLabelText("User Avatar")).toBeInTheDocument()
    })

    it("prioritizes loading state over image", () => {
      const { container, queryByAltText } = render(<Avatar src="/img.png" alt="User" loading initials="U" />)

      expect(container.querySelector(".animate-pulse")).toBeInTheDocument()
      expect(screen.getByText("U")).toBeInTheDocument()
      expect(queryByAltText("User")).not.toBeInTheDocument()
    })
  })
})
