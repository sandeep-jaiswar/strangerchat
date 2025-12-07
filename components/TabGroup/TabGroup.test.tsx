import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { TabGroup } from "./TabGroup"

const tabs = [
  { value: "visitors", label: "Visitors" },
  { value: "globe", label: "Globe" },
  { value: "contacts", label: "Contacts" },
]

describe("TabGroup", () => {
  it("renders all tabs", () => {
    render(<TabGroup tabs={tabs} />)
    expect(screen.getByText("Visitors")).toBeInTheDocument()
    expect(screen.getByText("Globe")).toBeInTheDocument()
    expect(screen.getByText("Contacts")).toBeInTheDocument()
  })

  it("renders with default value", () => {
    render(<TabGroup tabs={tabs} defaultValue="globe" />)
    const globeTab = screen.getByRole("tab", { name: "Globe" })
    expect(globeTab).toHaveAttribute("aria-selected", "true")
  })

  it("renders first tab as active by default", () => {
    render(<TabGroup tabs={tabs} />)
    const visitorsTab = screen.getByRole("tab", { name: "Visitors" })
    expect(visitorsTab).toHaveAttribute("aria-selected", "true")
  })

  it("renders disabled tab", () => {
    const tabsWithDisabled = [
      { value: "active", label: "Active" },
      { value: "disabled", label: "Disabled", disabled: true },
    ]
    render(<TabGroup tabs={tabsWithDisabled} />)
    const disabledTab = screen.getByRole("tab", { name: "Disabled" })
    expect(disabledTab).toBeDisabled()
    expect(disabledTab).toHaveAttribute("aria-disabled", "true")
  })

  it("renders tabs with icons", () => {
    const tabsWithIcons = [{ value: "visitors", label: "Visitors", icon: <span data-testid="icon">📊</span> }]
    render(<TabGroup tabs={tabsWithIcons} />)
    expect(screen.getByTestId("icon")).toBeInTheDocument()
  })

  it("renders tabs with badges", () => {
    const tabsWithBadges = [{ value: "all", label: "All", badge: 5 }]
    render(<TabGroup tabs={tabsWithBadges} />)
    expect(screen.getByText("5")).toBeInTheDocument()
  })

  it("applies custom className", () => {
    const { container } = render(<TabGroup tabs={tabs} className="custom-class" />)
    const tabList = container.querySelector("[role='tablist']")
    expect(tabList).toHaveClass("custom-class")
  })

  it("calls onValueChange when tab is clicked", () => {
    const handleChange = vi.fn()
    render(<TabGroup tabs={tabs} onValueChange={handleChange} />)
    
    const globeTab = screen.getByRole("tab", { name: "Globe" })
    fireEvent.click(globeTab)
    
    expect(handleChange).toHaveBeenCalledWith("globe")
  })

  it("does not call onValueChange for disabled tab", () => {
    const handleChange = vi.fn()
    const tabsWithDisabled = [
      { value: "active", label: "Active" },
      { value: "disabled", label: "Disabled", disabled: true },
    ]
    render(<TabGroup tabs={tabsWithDisabled} onValueChange={handleChange} />)
    
    const disabledTab = screen.getByRole("tab", { name: "Disabled" })
    fireEvent.click(disabledTab)
    
    expect(handleChange).not.toHaveBeenCalled()
  })

  it("works in controlled mode", () => {
    const { rerender } = render(<TabGroup tabs={tabs} value="visitors" />)
    expect(screen.getByRole("tab", { name: "Visitors" })).toHaveAttribute("aria-selected", "true")
    
    rerender(<TabGroup tabs={tabs} value="globe" />)
    expect(screen.getByRole("tab", { name: "Globe" })).toHaveAttribute("aria-selected", "true")
  })

  it("renders different variants", () => {
    const { rerender } = render(<TabGroup tabs={tabs} variant="default" />)
    expect(screen.getByText("Visitors")).toBeInTheDocument()
    
    rerender(<TabGroup tabs={tabs} variant="pills" />)
    expect(screen.getByText("Visitors")).toBeInTheDocument()
    
    rerender(<TabGroup tabs={tabs} variant="underline" />)
    expect(screen.getByText("Visitors")).toBeInTheDocument()
  })

  it("renders different sizes", () => {
    const { rerender } = render(<TabGroup tabs={tabs} size="sm" />)
    expect(screen.getByText("Visitors")).toBeInTheDocument()
    
    rerender(<TabGroup tabs={tabs} size="md" />)
    expect(screen.getByText("Visitors")).toBeInTheDocument()
    
    rerender(<TabGroup tabs={tabs} size="lg" />)
    expect(screen.getByText("Visitors")).toBeInTheDocument()
  })

  it("supports keyboard navigation", () => {
    render(<TabGroup tabs={tabs} />)
    
    const visitorsTab = screen.getByRole("tab", { name: "Visitors" })
    const globeTab = screen.getByRole("tab", { name: "Globe" })
    
    // Press ArrowRight to move to next tab
    fireEvent.keyDown(visitorsTab, { key: "ArrowRight" })
    expect(globeTab).toHaveFocus()
  })

  it("has proper accessibility attributes", () => {
    render(<TabGroup tabs={tabs} />)
    
    const tabList = screen.getByRole("tablist")
    expect(tabList).toHaveAttribute("aria-orientation", "horizontal")
    
    const visitorsTab = screen.getByRole("tab", { name: "Visitors" })
    expect(visitorsTab).toHaveAttribute("aria-selected")
    expect(visitorsTab).toHaveAttribute("aria-controls")
  })
})

