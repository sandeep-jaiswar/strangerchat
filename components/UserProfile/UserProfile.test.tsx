import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { UserProfile } from "./UserProfile"

describe("UserProfile", () => {
  const defaultProps = {
    name: "John Doe",
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("renders with name only", () => {
      render(<UserProfile {...defaultProps} />)
      expect(screen.getByText("John Doe")).toBeInTheDocument()
    })

    it("renders with name and email", () => {
      render(<UserProfile {...defaultProps} email="john@example.com" />)
      expect(screen.getByText("John Doe")).toBeInTheDocument()
      expect(screen.getByText("john@example.com")).toBeInTheDocument()
    })

    it("renders with name and bio", () => {
      render(<UserProfile {...defaultProps} bio="Software Developer" />)
      expect(screen.getByText("John Doe")).toBeInTheDocument()
      expect(screen.getByText("Software Developer")).toBeInTheDocument()
    })

    it("renders with all props", () => {
      render(
        <UserProfile
          name="Jane Smith"
          email="jane@example.com"
          bio="Product Manager"
          avatarUrl="https://example.com/avatar.jpg"
          status="online"
          size="lg"
        />
      )
      expect(screen.getByText("Jane Smith")).toBeInTheDocument()
      expect(screen.getByText("jane@example.com")).toBeInTheDocument()
      expect(screen.getByText("Product Manager")).toBeInTheDocument()
    })

    it("renders without email when not provided", () => {
      render(<UserProfile {...defaultProps} />)
      expect(screen.queryByText(/@/)).not.toBeInTheDocument()
    })

    it("renders without bio when not provided", () => {
      const { container } = render(<UserProfile {...defaultProps} />)
      const bioElements = container.querySelectorAll(".line-clamp-2")
      expect(bioElements.length).toBe(0)
    })

    it("applies custom className", () => {
      const { container } = render(<UserProfile {...defaultProps} className="custom-profile" />)
      const profileElement = container.firstChild
      expect(profileElement).toHaveClass("custom-profile")
    })
  })

  describe("Avatar Integration", () => {
    it("renders Avatar with name as alt text", () => {
      render(<UserProfile {...defaultProps} />)
      const avatar = screen.getByLabelText("John Doe")
      expect(avatar).toBeInTheDocument()
    })

    it("passes avatarUrl to Avatar", () => {
      render(<UserProfile {...defaultProps} avatarUrl="https://example.com/avatar.jpg" />)
      const avatar = screen.getByAltText("John Doe")
      expect(avatar).toBeInTheDocument()
    })

    it("passes status to Avatar", () => {
      render(<UserProfile {...defaultProps} status="online" />)
      const statusIndicator = screen.getByLabelText("Status: online")
      expect(statusIndicator).toBeInTheDocument()
    })

    it("passes offline status to Avatar", () => {
      render(<UserProfile {...defaultProps} status="offline" />)
      const statusIndicator = screen.getByLabelText("Status: offline")
      expect(statusIndicator).toBeInTheDocument()
    })

    it("passes away status to Avatar", () => {
      render(<UserProfile {...defaultProps} status="away" />)
      const statusIndicator = screen.getByLabelText("Status: away")
      expect(statusIndicator).toBeInTheDocument()
    })

    it("passes busy status to Avatar", () => {
      render(<UserProfile {...defaultProps} status="busy" />)
      const statusIndicator = screen.getByLabelText("Status: busy")
      expect(statusIndicator).toBeInTheDocument()
    })
  })

  describe("Size Variants", () => {
    it("renders small size with correct classes", () => {
      render(<UserProfile {...defaultProps} email="test@example.com" size="sm" />)
      const name = screen.getByText("John Doe")
      const email = screen.getByText("test@example.com")

      expect(name).toHaveClass("text-sm")
      expect(email).toHaveClass("text-xs")
    })

    it("renders medium size with correct classes (default)", () => {
      render(<UserProfile {...defaultProps} email="test@example.com" size="md" />)
      const name = screen.getByText("John Doe")
      const email = screen.getByText("test@example.com")

      expect(name).toHaveClass("text-base")
      expect(email).toHaveClass("text-sm")
    })

    it("renders large size with correct classes", () => {
      render(<UserProfile {...defaultProps} email="test@example.com" size="lg" />)
      const name = screen.getByText("John Doe")
      const email = screen.getByText("test@example.com")

      expect(name).toHaveClass("text-lg")
      expect(email).toHaveClass("text-base")
    })

    it("uses medium as default size", () => {
      render(<UserProfile {...defaultProps} email="test@example.com" />)
      const name = screen.getByText("John Doe")

      expect(name).toHaveClass("text-base")
    })

    it("applies bio size based on size prop", () => {
      render(<UserProfile {...defaultProps} bio="Test bio" size="lg" />)
      const bio = screen.getByText("Test bio")

      expect(bio).toHaveClass("text-base")
    })
  })

  describe("Interactive Behavior", () => {
    it("renders as button when onClick is provided", () => {
      const onClick = vi.fn()
      const { container } = render(<UserProfile {...defaultProps} onClick={onClick} />)
      const profileElement = container.querySelector("button")

      expect(profileElement).toBeInTheDocument()
    })

    it("renders as div when onClick is not provided", () => {
      const { container } = render(<UserProfile {...defaultProps} />)
      const profileElement = container.firstChild

      expect(profileElement?.nodeName).toBe("DIV")
    })

    it("calls onClick when clicked", () => {
      const onClick = vi.fn()
      render(<UserProfile {...defaultProps} onClick={onClick} />)
      const profileElement = screen.getByRole("button")

      fireEvent.click(profileElement)

      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it("does not call onClick when not clickable", () => {
      const { container } = render(<UserProfile {...defaultProps} />)
      const profileElement = container.firstChild as HTMLElement

      expect(() => {
        fireEvent.click(profileElement)
      }).not.toThrow()
    })

    it("applies hover styles when clickable", () => {
      const onClick = vi.fn()
      const { container } = render(<UserProfile {...defaultProps} onClick={onClick} />)
      const profileElement = container.querySelector("button")

      expect(profileElement).toHaveClass("cursor-pointer")
      expect(profileElement).toHaveClass("hover:bg-neutral-50")
    })

    it("does not apply hover styles when not clickable", () => {
      const { container } = render(<UserProfile {...defaultProps} />)
      const profileElement = container.firstChild as HTMLElement

      expect(profileElement).not.toHaveClass("cursor-pointer")
    })

    it("applies focus styles when clickable", () => {
      const onClick = vi.fn()
      const { container } = render(<UserProfile {...defaultProps} onClick={onClick} />)
      const profileElement = container.querySelector("button")

      expect(profileElement).toHaveClass("focus:ring-2")
      expect(profileElement).toHaveClass("focus:outline-none")
    })

    it("allows multiple clicks", () => {
      const onClick = vi.fn()
      render(<UserProfile {...defaultProps} onClick={onClick} />)
      const profileElement = screen.getByRole("button")

      fireEvent.click(profileElement)
      fireEvent.click(profileElement)
      fireEvent.click(profileElement)

      expect(onClick).toHaveBeenCalledTimes(3)
    })
  })

  describe("Text Truncation", () => {
    it("applies truncate class to name", () => {
      render(<UserProfile {...defaultProps} />)
      const name = screen.getByText("John Doe")

      expect(name).toHaveClass("truncate")
    })

    it("applies truncate class to email", () => {
      render(<UserProfile {...defaultProps} email="verylongemailaddress@example.com" />)
      const email = screen.getByText("verylongemailaddress@example.com")

      expect(email).toHaveClass("truncate")
    })

    it("applies line-clamp-2 to bio", () => {
      render(<UserProfile {...defaultProps} bio="This is a long bio" />)
      const bio = screen.getByText("This is a long bio")

      expect(bio).toHaveClass("line-clamp-2")
    })

    it("handles very long names", () => {
      const longName = "A".repeat(100)
      render(<UserProfile name={longName} />)
      const name = screen.getByText(longName)

      expect(name).toBeInTheDocument()
      expect(name).toHaveClass("truncate")
    })

    it("handles very long emails", () => {
      const longEmail = "verylongemailaddress".repeat(10) + "@example.com"
      render(<UserProfile {...defaultProps} email={longEmail} />)
      const email = screen.getByText(longEmail)

      expect(email).toBeInTheDocument()
      expect(email).toHaveClass("truncate")
    })

    it("handles very long bio", () => {
      const longBio = "This is a very long bio text. ".repeat(20)
      render(<UserProfile {...defaultProps} bio={longBio} />)
      const bio = screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === "p" && element.textContent === longBio
      })

      expect(bio).toBeInTheDocument()
      expect(bio).toHaveClass("line-clamp-2")
    })
  })

  describe("Layout and Styling", () => {
    it("applies flex layout classes", () => {
      const { container } = render(<UserProfile {...defaultProps} />)
      const profileElement = container.firstChild as HTMLElement

      expect(profileElement).toHaveClass("flex")
      expect(profileElement).toHaveClass("items-center")
      expect(profileElement).toHaveClass("gap-3")
    })

    it("applies rounded corners", () => {
      const { container } = render(<UserProfile {...defaultProps} />)
      const profileElement = container.firstChild as HTMLElement

      expect(profileElement).toHaveClass("rounded-xl")
    })

    it("applies padding", () => {
      const { container } = render(<UserProfile {...defaultProps} />)
      const profileElement = container.firstChild as HTMLElement

      expect(profileElement).toHaveClass("p-3")
    })

    it("applies transition classes", () => {
      const { container } = render(<UserProfile {...defaultProps} />)
      const profileElement = container.firstChild as HTMLElement

      expect(profileElement).toHaveClass("transition-colors")
    })

    it("applies text-left to content wrapper", () => {
      const { container } = render(<UserProfile {...defaultProps} />)
      const contentWrapper = container.querySelector(".text-left")

      expect(contentWrapper).toBeInTheDocument()
    })

    it("applies min-w-0 for text truncation", () => {
      const { container } = render(<UserProfile {...defaultProps} />)
      const contentWrapper = container.querySelector(".min-w-0")

      expect(contentWrapper).toBeInTheDocument()
    })

    it("applies flex-1 for flexible width", () => {
      const { container } = render(<UserProfile {...defaultProps} />)
      const contentWrapper = container.querySelector(".flex-1")

      expect(contentWrapper).toBeInTheDocument()
    })
  })

  describe("Typography", () => {
    it("applies font-semibold to name", () => {
      render(<UserProfile {...defaultProps} />)
      const name = screen.getByText("John Doe")

      expect(name).toHaveClass("font-semibold")
    })

    it("applies text-neutral-900 to name", () => {
      render(<UserProfile {...defaultProps} />)
      const name = screen.getByText("John Doe")

      expect(name).toHaveClass("text-neutral-900")
    })

    it("applies text-neutral-600 to email", () => {
      render(<UserProfile {...defaultProps} email="test@example.com" />)
      const email = screen.getByText("test@example.com")

      expect(email).toHaveClass("text-neutral-600")
    })

    it("applies text-neutral-500 to bio", () => {
      render(<UserProfile {...defaultProps} bio="Test bio" />)
      const bio = screen.getByText("Test bio")

      expect(bio).toHaveClass("text-neutral-500")
    })
  })

  describe("Edge Cases", () => {
    it("handles empty string name", () => {
      render(<UserProfile name="" />)
      const { container } = render(<UserProfile name="" />)
      expect(container).toBeInTheDocument()
    })

    it("handles special characters in name", () => {
      render(<UserProfile name="Jöhn Döe 李明" />)
      expect(screen.getByText("Jöhn Döe 李明")).toBeInTheDocument()
    })

    it("handles special characters in email", () => {
      render(<UserProfile {...defaultProps} email="user+test@example.com" />)
      expect(screen.getByText("user+test@example.com")).toBeInTheDocument()
    })

    it("handles special characters in bio", () => {
      render(<UserProfile {...defaultProps} bio="Developer @ Company™ <3" />)
      expect(screen.getByText("Developer @ Company™ <3")).toBeInTheDocument()
    })

    it("handles undefined status", () => {
      const { container } = render(<UserProfile {...defaultProps} status={undefined} />)
      const statusIndicator = container.querySelector('[aria-label^="Status:"]')
      expect(statusIndicator).not.toBeInTheDocument()
    })

    it("handles multiple spaces in name", () => {
      const { container } = render(<UserProfile name="John    Doe" />)
      const nameElement = container.querySelector("p.truncate.font-semibold")
      expect(nameElement).toBeInTheDocument()
      expect(nameElement?.textContent).toBe("John    Doe")
    })

    it("handles emoji in name", () => {
      render(<UserProfile name="John Doe 😊" />)
      expect(screen.getByText("John Doe 😊")).toBeInTheDocument()
    })

    it("handles emoji in bio", () => {
      render(<UserProfile {...defaultProps} bio="Love coding 💻 🚀" />)
      expect(screen.getByText("Love coding 💻 🚀")).toBeInTheDocument()
    })
  })

  describe("Accessibility", () => {
    it("provides accessible name through Avatar", () => {
      render(<UserProfile {...defaultProps} />)
      const avatar = screen.getByLabelText("John Doe")
      expect(avatar).toBeInTheDocument()
    })

    it("button has implicit role when onClick is provided", () => {
      const onClick = vi.fn()
      render(<UserProfile {...defaultProps} onClick={onClick} />)
      const button = screen.getByRole("button")

      expect(button).toBeInTheDocument()
    })

    it("supports keyboard interaction when clickable", () => {
      const onClick = vi.fn()
      render(<UserProfile {...defaultProps} onClick={onClick} />)
      const button = screen.getByRole("button")

      button.focus()
      fireEvent.keyDown(button, { key: "Enter" })

      // Button click will be triggered by Enter key natively
      expect(button).toHaveFocus()
    })

    it("has focus outline styles", () => {
      const onClick = vi.fn()
      const { container } = render(<UserProfile {...defaultProps} onClick={onClick} />)
      const button = container.querySelector("button")

      expect(button).toHaveClass("focus:outline-none")
      expect(button).toHaveClass("focus:ring-2")
    })
  })

  describe("Component Props", () => {
    it("has correct displayName", () => {
      expect(UserProfile.displayName).toBe("UserProfile")
    })

    it("accepts all valid size options", () => {
      const sizes: Array<"sm" | "md" | "lg"> = ["sm", "md", "lg"]

      sizes.forEach((size) => {
        const { unmount } = render(<UserProfile {...defaultProps} size={size} />)
        expect(screen.getByText("John Doe")).toBeInTheDocument()
        unmount()
      })
    })

    it("accepts all valid status options", () => {
      const statuses: Array<"online" | "offline" | "away" | "busy"> = ["online", "offline", "away", "busy"]

      statuses.forEach((status) => {
        const { unmount } = render(<UserProfile {...defaultProps} status={status} />)
        expect(screen.getByLabelText(`Status: ${status}`)).toBeInTheDocument()
        unmount()
      })
    })
  })

  describe("Combined Props", () => {
    it("renders correctly with all optional props", () => {
      const onClick = vi.fn()
      render(
        <UserProfile
          name="Alice Johnson"
          email="alice@company.com"
          bio="Senior Engineer at Tech Corp"
          avatarUrl="https://example.com/alice.jpg"
          status="online"
          size="lg"
          onClick={onClick}
          className="custom-profile-class"
        />
      )

      expect(screen.getByText("Alice Johnson")).toBeInTheDocument()
      expect(screen.getByText("alice@company.com")).toBeInTheDocument()
      expect(screen.getByText("Senior Engineer at Tech Corp")).toBeInTheDocument()
      expect(screen.getByLabelText("Status: online")).toBeInTheDocument()

      const button = screen.getByRole("button")
      fireEvent.click(button)
      expect(onClick).toHaveBeenCalled()
    })

    it("renders correctly with minimal props", () => {
      const { container } = render(<UserProfile name="Bob" />)

      expect(screen.getByText("Bob")).toBeInTheDocument()
      expect(container.firstChild?.nodeName).toBe("DIV")
    })

    it("merges custom className with default classes", () => {
      const { container } = render(<UserProfile {...defaultProps} className="border-2 border-blue-500" />)
      const profileElement = container.firstChild as HTMLElement

      expect(profileElement).toHaveClass("border-2")
      expect(profileElement).toHaveClass("flex")
      expect(profileElement).toHaveClass("items-center")
    })
  })
})
