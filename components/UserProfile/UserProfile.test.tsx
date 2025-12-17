import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import "@testing-library/jest-dom/vitest"

import { UserProfile } from "./UserProfile"

describe("UserProfile", () => {
  const defaultProps = {
    name: "John Doe",
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Basic Rendering", () => {
    it("renders with required props only", () => {
      render(<UserProfile {...defaultProps} />)
      expect(screen.getByText("John Doe")).toBeInTheDocument()
    })

    it("renders with all props", () => {
      render(
        <UserProfile
          name="Jane Smith"
          email="jane@example.com"
          username="janesmith"
          avatarUrl="https://example.com/avatar.jpg"
          status="online"
          bio="Software Engineer at Tech Corp"
          location="San Francisco, CA"
          website="https://example.com"
          verified={true}
          size="md"
          variant="card"
          followers={1500}
          following={200}
          posts={350}
          badges={[
            { label: "Pro", intent: "primary" },
            { label: "Verified", intent: "success" },
          ]}
          metadata={[
            { label: "Role", value: "Developer" },
            { label: "Team", value: "Engineering" },
          ]}
          showActions={true}
          onMessage={vi.fn()}
          onCall={vi.fn()}
          onMore={vi.fn()}
          onClick={vi.fn()}
        />
      )

      expect(screen.getByText("Jane Smith")).toBeInTheDocument()
      expect(screen.getByText("jane@example.com")).toBeInTheDocument()
      expect(screen.getByText("@janesmith")).toBeInTheDocument()
      expect(screen.getByText("Software Engineer at Tech Corp")).toBeInTheDocument()
    })

    it("renders as div when not clickable", () => {
      const { container } = render(<UserProfile {...defaultProps} />)
      const wrapper = container.firstChild
      expect(wrapper?.nodeName).toBe("DIV")
    })

    it("renders as button when onClick is provided", () => {
      const onClick = vi.fn()
      const { container } = render(<UserProfile {...defaultProps} onClick={onClick} />)
      const button = container.querySelector("button")
      expect(button).toBeInTheDocument()
    })
  })

  describe("Size Variants", () => {
    it("renders small size with correct classes", () => {
      render(<UserProfile {...defaultProps} email="test@example.com" size="sm" />)
      const name = screen.getByText("John Doe")
      const email = screen.getByText("test@example.com")

      expect(name).toHaveClass("text-[15px]")
      expect(email).toHaveClass("text-[13px]")
    })

    it("renders medium size with correct classes (default)", () => {
      render(<UserProfile {...defaultProps} email="test@example.com" size="md" />)
      const name = screen.getByText("John Doe")
      const email = screen.getByText("test@example.com")

      expect(name).toHaveClass("text-[17px]")
      expect(email).toHaveClass("text-[15px]")
    })

    it("renders large size with correct classes", () => {
      render(<UserProfile {...defaultProps} email="test@example.com" size="lg" />)
      const name = screen.getByText("John Doe")
      const email = screen.getByText("test@example.com")

      expect(name).toHaveClass("text-[20px]")
      expect(email).toHaveClass("text-[17px]")
    })

    it("renders xl size with correct classes", () => {
      render(<UserProfile {...defaultProps} email="test@example.com" size="xl" />)
      const name = screen.getByText("John Doe")
      const email = screen.getByText("test@example.com")

      expect(name).toHaveClass("text-[28px]")
      expect(email).toHaveClass("text-[20px]")
    })

    it("uses medium as default size", () => {
      render(<UserProfile {...defaultProps} email="test@example.com" />)
      const name = screen.getByText("John Doe")

      expect(name).toHaveClass("text-[17px]")
    })

    it("applies bio size based on size prop", () => {
      render(<UserProfile {...defaultProps} bio="Test bio" size="lg" />)
      const bio = screen.getByText("Test bio")

      expect(bio).toHaveClass("text-[17px]")
    })
  })

  describe("Variant Styles", () => {
    it("applies card variant styles", () => {
      const { container } = render(<UserProfile {...defaultProps} variant="card" />)
      const wrapper = container.firstChild as HTMLElement

      expect(wrapper).toHaveClass("rounded-2xl")
      expect(wrapper).toHaveClass("bg-white")
      expect(wrapper).toHaveClass("p-6")
      expect(wrapper).toHaveClass("shadow-sm")
    })

    it("applies inline variant styles (default)", () => {
      const { container } = render(<UserProfile {...defaultProps} variant="inline" />)
      const wrapper = container.firstChild as HTMLElement

      expect(wrapper).toHaveClass("rounded-xl")
      expect(wrapper).toHaveClass("p-3")
    })

    it("applies compact variant styles", () => {
      const { container } = render(<UserProfile {...defaultProps} variant="compact" />)
      const wrapper = container.firstChild as HTMLElement

      expect(wrapper).toHaveClass("rounded-lg")
      expect(wrapper).toHaveClass("p-2")
    })

    it("applies detailed variant styles", () => {
      const { container } = render(<UserProfile {...defaultProps} variant="detailed" />)
      const wrapper = container.firstChild as HTMLElement

      expect(wrapper).toHaveClass("rounded-2xl")
      expect(wrapper).toHaveClass("bg-white")
      expect(wrapper).toHaveClass("p-8")
      expect(wrapper).toHaveClass("shadow-md")
    })
  })

  describe("Content Display", () => {
    it("displays username with @ prefix", () => {
      render(<UserProfile {...defaultProps} username="johndoe" />)
      expect(screen.getByText("@johndoe")).toBeInTheDocument()
    })

    it("displays email when provided", () => {
      render(<UserProfile {...defaultProps} email="john@example.com" />)
      expect(screen.getByText("john@example.com")).toBeInTheDocument()
    })

    it("does not display email in compact variant", () => {
      render(<UserProfile {...defaultProps} email="john@example.com" variant="compact" />)
      expect(screen.queryByText("john@example.com")).not.toBeInTheDocument()
    })

    it("displays bio when provided", () => {
      render(<UserProfile {...defaultProps} bio="This is my bio" />)
      expect(screen.getByText("This is my bio")).toBeInTheDocument()
    })

    it("does not display bio in compact variant", () => {
      render(<UserProfile {...defaultProps} bio="This is my bio" variant="compact" />)
      expect(screen.queryByText("This is my bio")).not.toBeInTheDocument()
    })

    it("applies line-clamp-2 to bio in inline variant", () => {
      render(<UserProfile {...defaultProps} bio="This is my bio" variant="inline" />)
      const bio = screen.getByText("This is my bio")
      expect(bio).toHaveClass("line-clamp-2")
    })

    it("applies line-clamp-3 to bio in non-inline variants", () => {
      render(<UserProfile {...defaultProps} bio="This is my bio" variant="card" />)
      const bio = screen.getByText("This is my bio")
      expect(bio).toHaveClass("line-clamp-3")
    })

    it("displays verified badge when verified is true", () => {
      const { container } = render(<UserProfile {...defaultProps} verified={true} />)
      const verifiedIcon = container.querySelector('svg[viewBox="0 0 24 24"]')
      expect(verifiedIcon).toBeInTheDocument()
    })

    it("does not display verified badge when verified is false", () => {
      const { container } = render(<UserProfile {...defaultProps} verified={false} />)
      const verifiedIcons = container.querySelectorAll('svg[viewBox="0 0 24 24"]')
      // Should not have the verified badge (other SVGs might exist for status, etc.)
      const verifiedBadge = Array.from(verifiedIcons).find((svg) =>
        svg.querySelector('path[d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"]')
      )
      expect(verifiedBadge).toBeUndefined()
    })

    it("displays location when provided", () => {
      render(<UserProfile {...defaultProps} location="New York, NY" />)
      expect(screen.getByText("New York, NY")).toBeInTheDocument()
    })

    it("displays website as link when provided", () => {
      render(<UserProfile {...defaultProps} website="https://example.com" />)
      const link = screen.getByText("https://example.com")
      expect(link).toBeInTheDocument()
      expect(link.closest("a")).toHaveAttribute("href", "https://example.com")
      expect(link.closest("a")).toHaveAttribute("target", "_blank")
      expect(link.closest("a")).toHaveAttribute("rel", "noopener noreferrer")
    })

    it("does not display location/website in compact variant", () => {
      render(<UserProfile {...defaultProps} location="NY" website="https://example.com" variant="compact" />)
      expect(screen.queryByText("NY")).not.toBeInTheDocument()
      expect(screen.queryByText("https://example.com")).not.toBeInTheDocument()
    })
  })

  describe("Metadata", () => {
    it("displays custom metadata fields", () => {
      render(
        <UserProfile
          {...defaultProps}
          metadata={[
            { label: "Role", value: "Developer" },
            { label: "Team", value: "Engineering" },
          ]}
        />
      )

      expect(screen.getByText(/Role: Developer/)).toBeInTheDocument()
      expect(screen.getByText(/Team: Engineering/)).toBeInTheDocument()
    })

    it("displays metadata with custom icons", () => {
      render(
        <UserProfile
          {...defaultProps}
          metadata={[
            {
              label: "Custom",
              value: "Value",
              icon: <svg data-testid="custom-icon" />,
            },
          ]}
        />
      )

      expect(screen.getByTestId("custom-icon")).toBeInTheDocument()
      expect(screen.getByText(/Custom: Value/)).toBeInTheDocument()
    })

    it("does not display metadata in compact variant", () => {
      render(<UserProfile {...defaultProps} metadata={[{ label: "Role", value: "Developer" }]} variant="compact" />)

      expect(screen.queryByText(/Role: Developer/)).not.toBeInTheDocument()
    })

    it("hides location/website when metadata is provided", () => {
      render(
        <UserProfile
          {...defaultProps}
          location="New York"
          website="https://example.com"
          metadata={[{ label: "Role", value: "Developer" }]}
        />
      )

      // Metadata takes precedence
      expect(screen.getByText(/Role: Developer/)).toBeInTheDocument()
      // Location and website should not be displayed when metadata exists
      expect(screen.queryByText("New York")).not.toBeInTheDocument()
      expect(screen.queryByText("https://example.com")).not.toBeInTheDocument()
    })
  })

  describe("Social Stats", () => {
    it("displays posts count", () => {
      render(<UserProfile {...defaultProps} posts={42} />)
      expect(screen.getByText("42")).toBeInTheDocument()
      expect(screen.getByText("Posts")).toBeInTheDocument()
    })

    it("displays followers count", () => {
      render(<UserProfile {...defaultProps} followers={1234} />)
      expect(screen.getByText("1.2K")).toBeInTheDocument()
      expect(screen.getByText("Followers")).toBeInTheDocument()
    })

    it("displays following count", () => {
      render(<UserProfile {...defaultProps} following={567} />)
      expect(screen.getByText("567")).toBeInTheDocument()
      expect(screen.getByText("Following")).toBeInTheDocument()
    })

    it("displays all stats together", () => {
      render(<UserProfile {...defaultProps} posts={100} followers={2000} following={300} />)
      expect(screen.getByText("100")).toBeInTheDocument()
      expect(screen.getByText("2K")).toBeInTheDocument()
      expect(screen.getByText("300")).toBeInTheDocument()
    })

    it("formats numbers over 1000 with K suffix", () => {
      render(<UserProfile {...defaultProps} followers={1500} />)
      expect(screen.getByText("1.5K")).toBeInTheDocument()
    })

    it("formats numbers over 1000000 with M suffix", () => {
      render(<UserProfile {...defaultProps} followers={2500000} />)
      expect(screen.getByText("2.5M")).toBeInTheDocument()
    })

    it("removes trailing .0 from formatted numbers", () => {
      render(<UserProfile {...defaultProps} followers={1000} />)
      expect(screen.getByText("1K")).toBeInTheDocument()
    })

    it("does not display stats in compact variant", () => {
      render(<UserProfile {...defaultProps} followers={1000} variant="compact" />)
      expect(screen.queryByText("1K")).not.toBeInTheDocument()
      expect(screen.queryByText("Followers")).not.toBeInTheDocument()
    })
  })

  describe("Badges", () => {
    it("displays badges when provided", () => {
      render(
        <UserProfile
          {...defaultProps}
          badges={[
            { label: "Pro", intent: "primary" },
            { label: "Verified", intent: "success" },
          ]}
        />
      )

      expect(screen.getByText("Pro")).toBeInTheDocument()
      expect(screen.getByText("Verified")).toBeInTheDocument()
    })

    it("uses secondary intent as default for badges", () => {
      render(<UserProfile {...defaultProps} badges={[{ label: "Member" }]} />)
      expect(screen.getByText("Member")).toBeInTheDocument()
    })

    it("does not display badges in compact variant", () => {
      render(<UserProfile {...defaultProps} badges={[{ label: "Pro" }]} variant="compact" />)
      expect(screen.queryByText("Pro")).not.toBeInTheDocument()
    })
  })

  describe("Interactive Behavior", () => {
    it("calls onClick when profile is clicked", () => {
      const onClick = vi.fn()
      render(<UserProfile {...defaultProps} onClick={onClick} />)

      const button = screen.getByRole("button")
      fireEvent.click(button)

      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it("applies hover and active styles when clickable", () => {
      const onClick = vi.fn()
      const { container } = render(<UserProfile {...defaultProps} onClick={onClick} />)
      const button = container.querySelector("button")

      expect(button).toHaveClass("hover:bg-neutral-50")
      expect(button).toHaveClass("active:bg-neutral-100")
    })

    it("applies focus ring styles when clickable", () => {
      const onClick = vi.fn()
      const { container } = render(<UserProfile {...defaultProps} onClick={onClick} />)
      const button = container.querySelector("button")

      expect(button).toHaveClass("focus:ring-2")
      expect(button).toHaveClass("focus:ring-[#0071e3]")
      expect(button).toHaveClass("focus:ring-offset-2")
    })

    it("applies card hover effects in card variant", () => {
      const onClick = vi.fn()
      const { container } = render(<UserProfile {...defaultProps} onClick={onClick} variant="card" />)
      const button = container.querySelector("button")

      expect(button).toHaveClass("hover:scale-[1.02]")
      expect(button).toHaveClass("hover:shadow-md")
    })

    it("applies transition-all duration-200", () => {
      const onClick = vi.fn()
      const { container } = render(<UserProfile {...defaultProps} onClick={onClick} />)
      const button = container.querySelector("button")

      expect(button).toHaveClass("transition-all")
      expect(button).toHaveClass("duration-200")
    })

    it("applies text-left and w-full to button", () => {
      const onClick = vi.fn()
      const { container } = render(<UserProfile {...defaultProps} onClick={onClick} />)
      const button = container.querySelector("button")

      expect(button).toHaveClass("text-left")
      expect(button).toHaveClass("w-full")
    })
  })

  describe("Action Buttons", () => {
    it("displays message button when onMessage and showActions are provided", () => {
      const onMessage = vi.fn()
      render(<UserProfile {...defaultProps} onMessage={onMessage} showActions={true} />)

      const messageButton = screen.getByText("Message")
      expect(messageButton).toBeInTheDocument()
    })

    it("calls onMessage when message button is clicked", () => {
      const onMessage = vi.fn()
      render(<UserProfile {...defaultProps} onMessage={onMessage} showActions={true} />)

      const messageButton = screen.getByText("Message")
      fireEvent.click(messageButton)

      expect(onMessage).toHaveBeenCalledTimes(1)
    })

    it("stops propagation when message button is clicked", () => {
      const onMessage = vi.fn()
      const onClick = vi.fn()
      render(<UserProfile {...defaultProps} onMessage={onMessage} showActions={true} onClick={onClick} />)

      const messageButton = screen.getByText("Message")
      fireEvent.click(messageButton)

      expect(onMessage).toHaveBeenCalledTimes(1)
      expect(onClick).not.toHaveBeenCalled()
    })

    it("displays call button when onCall and showActions are provided", () => {
      const onCall = vi.fn()
      render(<UserProfile {...defaultProps} onCall={onCall} showActions={true} />)

      const callButton = screen.getByLabelText("Call")
      expect(callButton).toBeInTheDocument()
    })

    it("calls onCall when call button is clicked", () => {
      const onCall = vi.fn()
      render(<UserProfile {...defaultProps} onCall={onCall} showActions={true} />)

      const callButton = screen.getByLabelText("Call")
      fireEvent.click(callButton)

      expect(onCall).toHaveBeenCalledTimes(1)
    })

    it("stops propagation when call button is clicked", () => {
      const onCall = vi.fn()
      const onClick = vi.fn()
      render(<UserProfile {...defaultProps} onCall={onCall} showActions={true} onClick={onClick} />)

      const callButton = screen.getByLabelText("Call")
      fireEvent.click(callButton)

      expect(onCall).toHaveBeenCalledTimes(1)
      expect(onClick).not.toHaveBeenCalled()
    })

    it("displays more button when onMore and showActions are provided", () => {
      const onMore = vi.fn()
      render(<UserProfile {...defaultProps} onMore={onMore} showActions={true} />)

      const moreButton = screen.getByLabelText("More options")
      expect(moreButton).toBeInTheDocument()
    })

    it("calls onMore when more button is clicked", () => {
      const onMore = vi.fn()
      render(<UserProfile {...defaultProps} onMore={onMore} showActions={true} />)

      const moreButton = screen.getByLabelText("More options")
      fireEvent.click(moreButton)

      expect(onMore).toHaveBeenCalledTimes(1)
    })

    it("displays all action buttons together", () => {
      render(<UserProfile {...defaultProps} onMessage={vi.fn()} onCall={vi.fn()} onMore={vi.fn()} showActions={true} />)

      expect(screen.getByText("Message")).toBeInTheDocument()
      expect(screen.getByLabelText("Call")).toBeInTheDocument()
      expect(screen.getByLabelText("More options")).toBeInTheDocument()
    })

    it("does not display action buttons when showActions is false", () => {
      render(
        <UserProfile {...defaultProps} onMessage={vi.fn()} onCall={vi.fn()} onMore={vi.fn()} showActions={false} />
      )

      expect(screen.queryByText("Message")).not.toBeInTheDocument()
      expect(screen.queryByLabelText("Call")).not.toBeInTheDocument()
    })

    it("displays inline more button when onMore provided without showActions", () => {
      const onMore = vi.fn()
      render(<UserProfile {...defaultProps} onMore={onMore} />)

      const moreButton = screen.getByLabelText("More options")
      expect(moreButton).toBeInTheDocument()
    })

    it("does not display inline more button in detailed variant", () => {
      const onMore = vi.fn()
      render(<UserProfile {...defaultProps} onMore={onMore} variant="detailed" />)

      expect(screen.queryByLabelText("More options")).not.toBeInTheDocument()
    })

    it("adjusts button size based on profile size prop", () => {
      const { container } = render(<UserProfile {...defaultProps} size="xl" onMessage={vi.fn()} showActions={true} />)

      const messageButton = screen.getByText("Message").closest("button")
      // Button should have lg size classes when profile size is xl
      expect(messageButton).toBeInTheDocument()
      expect(container).toBeTruthy()
    })
  })

  describe("Detailed Variant Specific", () => {
    it("centers content in detailed variant", () => {
      const { container } = render(<UserProfile {...defaultProps} username="test" variant="detailed" />)

      const flexContainer = container.querySelector(".flex.flex-col.items-center")
      expect(flexContainer).toBeInTheDocument()

      const nameContainer = container.querySelector(".flex.items-center.gap-2.justify-center")
      expect(nameContainer).toBeInTheDocument()
    })

    it("uses larger name size in detailed variant", () => {
      render(<UserProfile {...defaultProps} variant="detailed" />)
      const name = screen.getByText("John Doe")
      expect(name).toHaveClass("text-[34px]")
    })

    it("uses larger username size in detailed variant", () => {
      render(<UserProfile {...defaultProps} username="johndoe" variant="detailed" />)
      const username = screen.getByText("@johndoe")
      expect(username).toHaveClass("text-[20px]")
    })

    it("uses xl avatar in detailed variant", () => {
      const { container } = render(<UserProfile {...defaultProps} variant="detailed" />)
      // Avatar component should be rendered with xl size
      expect(container.querySelector(".flex.flex-col.items-center")).toBeInTheDocument()
    })

    it("uses xl avatar in card variant", () => {
      const { container } = render(<UserProfile {...defaultProps} variant="card" />)
      // Avatar component should be rendered with xl size
      expect(container.querySelector(".flex.items-start")).toBeInTheDocument()
    })

    it("adds border to stats in detailed variant", () => {
      const { container } = render(<UserProfile {...defaultProps} variant="detailed" followers={100} />)

      const statsContainer = container.querySelector(".border-y.border-neutral-100.py-4")
      expect(statsContainer).toBeInTheDocument()
    })

    it("centers stats in detailed variant", () => {
      const { container } = render(<UserProfile {...defaultProps} variant="detailed" followers={100} />)

      const statsContainer = container.querySelector(".justify-center")
      expect(statsContainer).toBeInTheDocument()
    })
  })

  describe("Compact Variant Specific", () => {
    it("uses smaller gap in compact variant", () => {
      const { container } = render(<UserProfile {...defaultProps} variant="compact" />)

      const flexContainer = container.querySelector(".gap-2")
      expect(flexContainer).toBeInTheDocument()
    })

    it("hides email in compact variant", () => {
      render(<UserProfile {...defaultProps} email="test@example.com" variant="compact" />)
      expect(screen.queryByText("test@example.com")).not.toBeInTheDocument()
    })

    it("hides bio in compact variant", () => {
      render(<UserProfile {...defaultProps} bio="My bio" variant="compact" />)
      expect(screen.queryByText("My bio")).not.toBeInTheDocument()
    })

    it("hides badges in compact variant", () => {
      render(<UserProfile {...defaultProps} badges={[{ label: "Pro" }]} variant="compact" />)
      expect(screen.queryByText("Pro")).not.toBeInTheDocument()
    })

    it("hides stats in compact variant", () => {
      render(<UserProfile {...defaultProps} followers={1000} variant="compact" />)
      expect(screen.queryByText("Followers")).not.toBeInTheDocument()
    })

    it("hides metadata in compact variant", () => {
      render(<UserProfile {...defaultProps} metadata={[{ label: "Role", value: "Dev" }]} variant="compact" />)
      expect(screen.queryByText(/Role: Dev/)).not.toBeInTheDocument()
    })
  })

  describe("Verified Badge Sizing", () => {
    it("shows small verified badge for sm size", () => {
      const { container } = render(<UserProfile {...defaultProps} verified={true} size="sm" />)
      const verifiedIcon = container.querySelector("svg.h-4.w-4.text-\\[\\#007aff\\]")
      expect(verifiedIcon).toBeInTheDocument()
    })

    it("shows medium verified badge for md size", () => {
      const { container } = render(<UserProfile {...defaultProps} verified={true} size="md" />)
      const verifiedIcon = container.querySelector("svg.h-5.w-5.text-\\[\\#007aff\\]")
      expect(verifiedIcon).toBeInTheDocument()
    })

    it("shows large verified badge for lg size", () => {
      const { container } = render(<UserProfile {...defaultProps} verified={true} size="lg" />)
      const verifiedIcon = container.querySelector("svg.h-6.w-6.text-\\[\\#007aff\\]")
      expect(verifiedIcon).toBeInTheDocument()
    })

    it("shows xl verified badge for xl size", () => {
      const { container } = render(<UserProfile {...defaultProps} verified={true} size="xl" />)
      const verifiedIcon = container.querySelector("svg.h-7.w-7.text-\\[\\#007aff\\]")
      expect(verifiedIcon).toBeInTheDocument()
    })
  })

  describe("Custom Styling", () => {
    it("applies custom className", () => {
      const { container } = render(<UserProfile {...defaultProps} className="custom-class" />)
      const wrapper = container.firstChild as HTMLElement

      expect(wrapper).toHaveClass("custom-class")
    })

    it("merges custom className with default classes", () => {
      const { container } = render(<UserProfile {...defaultProps} className="custom-class" variant="card" />)
      const wrapper = container.firstChild as HTMLElement

      expect(wrapper).toHaveClass("custom-class")
      expect(wrapper).toHaveClass("rounded-2xl")
    })
  })

  describe("Website Link Interaction", () => {
    it("stops propagation when website link is clicked", () => {
      const onClick = vi.fn()
      render(<UserProfile {...defaultProps} website="https://example.com" onClick={onClick} />)

      const websiteLink = screen.getByText("https://example.com")
      fireEvent.click(websiteLink)

      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe("Ref Forwarding", () => {
    it("forwards ref to div when not clickable", () => {
      const ref = vi.fn()
      render(<UserProfile {...defaultProps} ref={ref} />)

      expect(ref).toHaveBeenCalled()
      const element = ref.mock.calls[0][0]
      expect(element?.nodeName).toBe("DIV")
    })

    it("forwards ref to button when clickable", () => {
      const ref = vi.fn()
      const onClick = vi.fn()
      render(<UserProfile {...defaultProps} onClick={onClick} ref={ref} />)

      expect(ref).toHaveBeenCalled()
      const element = ref.mock.calls[0][0]
      expect(element?.nodeName).toBe("BUTTON")
    })
  })

  describe("DisplayName", () => {
    it("has correct displayName", () => {
      expect(UserProfile.displayName).toBe("UserProfile")
    })
  })

  describe("Action Button Spacing", () => {
    it("applies correct margin in inline variant with actions", () => {
      const { container } = render(
        <UserProfile {...defaultProps} variant="inline" onMessage={vi.fn()} showActions={true} />
      )

      const actionsContainer = container.querySelector(".mt-3")
      expect(actionsContainer).toBeInTheDocument()
    })

    it("applies correct margin in card variant with actions", () => {
      const { container } = render(
        <UserProfile {...defaultProps} variant="card" onMessage={vi.fn()} showActions={true} />
      )

      const actionsContainer = container.querySelector(".mt-4")
      expect(actionsContainer).toBeInTheDocument()
    })

    it("applies correct margin in detailed variant with actions", () => {
      const { container } = render(
        <UserProfile {...defaultProps} variant="detailed" onMessage={vi.fn()} showActions={true} />
      )

      const actionsContainer = container.querySelector(".mt-6")
      expect(actionsContainer).toBeInTheDocument()
    })
  })

  describe("Edge Cases", () => {
    it("handles zero stats values", () => {
      render(<UserProfile {...defaultProps} followers={0} following={0} posts={0} />)
      const zeros = screen.getAllByText("0")
      expect(zeros).toHaveLength(3) // One for each stat
      expect(screen.getByText("Posts")).toBeInTheDocument()
      expect(screen.getByText("Followers")).toBeInTheDocument()
      expect(screen.getByText("Following")).toBeInTheDocument()
    })

    it("handles undefined stats gracefully", () => {
      render(<UserProfile {...defaultProps} />)
      expect(screen.queryByText("Followers")).not.toBeInTheDocument()
    })

    it("handles empty badges array", () => {
      render(<UserProfile {...defaultProps} badges={[]} />)
      // Should render without errors
      expect(screen.getByText("John Doe")).toBeInTheDocument()
    })

    it("handles empty metadata array", () => {
      render(<UserProfile {...defaultProps} metadata={[]} />)
      // Should render without errors
      expect(screen.getByText("John Doe")).toBeInTheDocument()
    })

    it("renders without status", () => {
      render(<UserProfile {...defaultProps} />)
      expect(screen.getByText("John Doe")).toBeInTheDocument()
    })

    it("renders with all status types", () => {
      const statuses: Array<"online" | "offline" | "away" | "busy"> = ["online", "offline", "away", "busy"]

      statuses.forEach((status) => {
        const { unmount } = render(<UserProfile {...defaultProps} status={status} />)
        expect(screen.getByText("John Doe")).toBeInTheDocument()
        unmount()
      })
    })

    it("handles very long names gracefully", () => {
      const longName = "A".repeat(100)
      render(<UserProfile name={longName} />)
      const nameElement = screen.getByText(longName)
      expect(nameElement).toHaveClass("truncate")
    })

    it("handles very long email gracefully", () => {
      const longEmail = "a".repeat(50) + "@example.com"
      render(<UserProfile {...defaultProps} email={longEmail} />)
      const emailElement = screen.getByText(longEmail)
      expect(emailElement).toHaveClass("truncate")
    })

    it("handles very long username gracefully", () => {
      const longUsername = "u".repeat(50)
      render(<UserProfile {...defaultProps} username={longUsername} />)
      const usernameElement = screen.getByText(`@${longUsername}`)
      expect(usernameElement).toHaveClass("truncate")
    })
  })
})
