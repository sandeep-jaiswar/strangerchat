import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
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
    const globeTab = screen.getByText("Globe")
    expect(globeTab).toHaveAttribute("data-state", "active")
  })

  it("renders disabled tab", () => {
    const tabsWithDisabled = [
      { value: "active", label: "Active" },
      { value: "disabled", label: "Disabled", disabled: true },
    ]
    render(<TabGroup tabs={tabsWithDisabled} />)
    const disabledTab = screen.getByText("Disabled")
    expect(disabledTab).toBeDisabled()
  })

  it("renders tabs with icons", () => {
    const tabsWithIcons = [{ value: "visitors", label: "Visitors", icon: <span data-testid="icon">📊</span> }]
    render(<TabGroup tabs={tabsWithIcons} />)
    expect(screen.getByTestId("icon")).toBeInTheDocument()
  })

  it("applies custom className", () => {
    const { container } = render(<TabGroup tabs={tabs} className="custom-class" />)
    const tabList = container.querySelector("[role='tablist']")
    expect(tabList).toHaveClass("custom-class")
  })
})
