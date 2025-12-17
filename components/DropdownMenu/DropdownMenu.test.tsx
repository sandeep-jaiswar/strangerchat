import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { DropdownMenu, DropdownMenuItem } from "./DropdownMenu"

describe("DropdownMenu Component", () => {
  const defaultItems: (DropdownMenuItem | "divider")[] = [
    { id: "1", label: "Item 1", onClick: vi.fn() },
    { id: "2", label: "Item 2", onClick: vi.fn() },
  ]

  beforeEach(() => {
    document.body.innerHTML = ""
  })

  afterEach(() => {
    document.body.innerHTML = ""
    vi.clearAllMocks()
  })

  describe("Basic Rendering", () => {
    it("renders trigger element", () => {
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={defaultItems} />)
      expect(screen.getByText("Open Menu")).toBeInTheDocument()
    })

    it("menu is hidden by default", () => {
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={defaultItems} />)
      expect(screen.queryByRole("menu")).not.toBeInTheDocument()
    })

    it("shows menu when trigger is clicked", async () => {
      const user = userEvent.setup()
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={defaultItems} />)

      await user.click(screen.getByText("Open Menu"))
      expect(screen.getByRole("menu")).toBeInTheDocument()
    })

    it("has displayName set", () => {
      expect(DropdownMenu.displayName).toBe("DropdownMenu")
    })

    it("forwards ref correctly", () => {
      const ref = { current: null }
      render(<DropdownMenu ref={ref} trigger={<button>Open Menu</button>} items={defaultItems} />)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it("applies custom className", () => {
      const { container } = render(
        <DropdownMenu trigger={<button>Open Menu</button>} items={defaultItems} className="custom-class" />
      )
      const dropdown = container.firstChild
      expect(dropdown).toHaveClass("custom-class")
    })
  })

  describe("Menu Items", () => {
    it("renders all menu items", async () => {
      const user = userEvent.setup()
      const items: DropdownMenuItem[] = [
        { id: "1", label: "Item 1", onClick: vi.fn() },
        { id: "2", label: "Item 2", onClick: vi.fn() },
        { id: "3", label: "Item 3", onClick: vi.fn() },
      ]
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={items} />)

      await user.click(screen.getByText("Open Menu"))

      expect(screen.getByText("Item 1")).toBeInTheDocument()
      expect(screen.getByText("Item 2")).toBeInTheDocument()
      expect(screen.getByText("Item 3")).toBeInTheDocument()
    })

    it("calls onClick when item is clicked", async () => {
      const user = userEvent.setup()
      const onClick = vi.fn()
      const items: DropdownMenuItem[] = [{ id: "1", label: "Item 1", onClick }]
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={items} />)

      await user.click(screen.getByText("Open Menu"))
      await user.click(screen.getByText("Item 1"))

      expect(onClick).toHaveBeenCalled()
    })

    it("closes menu after item click", async () => {
      const user = userEvent.setup()
      const onClick = vi.fn()
      const items: DropdownMenuItem[] = [{ id: "1", label: "Item 1", onClick }]
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={items} />)

      await user.click(screen.getByText("Open Menu"))
      await user.click(screen.getByText("Item 1"))

      expect(screen.queryByRole("menu")).not.toBeInTheDocument()
    })

    it("renders item with icon", async () => {
      const user = userEvent.setup()
      const items: DropdownMenuItem[] = [
        {
          id: "1",
          label: "Item with icon",
          icon: <span data-testid="icon">🔥</span>,
          onClick: vi.fn(),
        },
      ]
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={items} />)

      await user.click(screen.getByText("Open Menu"))
      expect(screen.getByTestId("icon")).toBeInTheDocument()
    })

    it("renders item with shortcut", async () => {
      const user = userEvent.setup()
      const items: DropdownMenuItem[] = [{ id: "1", label: "Copy", shortcut: "⌘C", onClick: vi.fn() }]
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={items} />)

      await user.click(screen.getByText("Open Menu"))
      expect(screen.getByText("⌘C")).toBeInTheDocument()
    })

    it("renders disabled item", async () => {
      const user = userEvent.setup()
      const onClick = vi.fn()
      const items: DropdownMenuItem[] = [{ id: "1", label: "Disabled Item", disabled: true, onClick }]
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={items} />)

      await user.click(screen.getByText("Open Menu"))
      const item = screen.getByText("Disabled Item").closest("button")
      expect(item).toBeDisabled()
    })

    it("does not call onClick for disabled item", async () => {
      const user = userEvent.setup()
      const onClick = vi.fn()
      const items: DropdownMenuItem[] = [{ id: "1", label: "Disabled Item", disabled: true, onClick }]
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={items} />)

      await user.click(screen.getByText("Open Menu"))
      const item = screen.getByText("Disabled Item").closest("button")

      // Try to click disabled button
      try {
        await user.click(item!)
      } catch {
        // Expected to fail
      }

      expect(onClick).not.toHaveBeenCalled()
    })

    it("renders danger item with red text", async () => {
      const user = userEvent.setup()
      const items: DropdownMenuItem[] = [{ id: "1", label: "Delete", danger: true, onClick: vi.fn() }]
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={items} />)

      await user.click(screen.getByText("Open Menu"))
      const item = screen.getByText("Delete").closest("button")
      expect(item).toHaveClass("text-[#ff3b30]")
    })

    it("applies hover styles to danger items", async () => {
      const user = userEvent.setup()
      const items: DropdownMenuItem[] = [{ id: "1", label: "Delete", danger: true, onClick: vi.fn() }]
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={items} />)

      await user.click(screen.getByText("Open Menu"))
      const item = screen.getByText("Delete").closest("button")
      expect(item).toHaveClass("hover:bg-[#ff3b30]/10")
    })
  })

  describe("Dividers", () => {
    it("renders divider", async () => {
      const user = userEvent.setup()
      const items: (DropdownMenuItem | "divider")[] = [
        { id: "1", label: "Item 1", onClick: vi.fn() },
        "divider",
        { id: "2", label: "Item 2", onClick: vi.fn() },
      ]
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={items} />)

      await user.click(screen.getByText("Open Menu"))
      const divider = document.querySelector('[role="separator"]')
      expect(divider).toBeInTheDocument()
    })

    it("divider has correct styling", async () => {
      const user = userEvent.setup()
      const items: (DropdownMenuItem | "divider")[] = [
        { id: "1", label: "Item 1", onClick: vi.fn() },
        "divider",
        { id: "2", label: "Item 2", onClick: vi.fn() },
      ]
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={items} />)

      await user.click(screen.getByText("Open Menu"))
      const divider = document.querySelector('[role="separator"]')
      expect(divider).toHaveClass("h-px", "bg-neutral-200")
    })

    it("renders multiple dividers", async () => {
      const user = userEvent.setup()
      const items: (DropdownMenuItem | "divider")[] = [
        { id: "1", label: "Item 1", onClick: vi.fn() },
        "divider",
        { id: "2", label: "Item 2", onClick: vi.fn() },
        "divider",
        { id: "3", label: "Item 3", onClick: vi.fn() },
      ]
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={items} />)

      await user.click(screen.getByText("Open Menu"))
      const dividers = document.querySelectorAll('[role="separator"]')
      expect(dividers).toHaveLength(2)
    })
  })

  describe("Submenu", () => {
    it("renders item with submenu indicator", async () => {
      const user = userEvent.setup()
      const items: DropdownMenuItem[] = [
        {
          id: "1",
          label: "Parent",
          submenu: [{ id: "1-1", label: "Child", onClick: vi.fn() }],
        },
      ]
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={items} />)

      await user.click(screen.getByText("Open Menu"))
      const parent = screen.getByText("Parent").closest("button")
      const arrow = parent?.querySelector("svg")
      expect(arrow).toBeInTheDocument()
    })

    it("opens submenu when parent item clicked", async () => {
      const user = userEvent.setup()
      const items: DropdownMenuItem[] = [
        {
          id: "1",
          label: "Parent",
          submenu: [{ id: "1-1", label: "Child Item", onClick: vi.fn() }],
        },
      ]
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={items} />)

      await user.click(screen.getByText("Open Menu"))
      await user.click(screen.getByText("Parent"))

      expect(screen.getByText("Child Item")).toBeInTheDocument()
    })

    it("closes submenu when parent item clicked again", async () => {
      const user = userEvent.setup()
      const items: DropdownMenuItem[] = [
        {
          id: "1",
          label: "Parent",
          submenu: [{ id: "1-1", label: "Child Item", onClick: vi.fn() }],
        },
      ]
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={items} />)

      await user.click(screen.getByText("Open Menu"))
      await user.click(screen.getByText("Parent"))
      expect(screen.getByText("Child Item")).toBeInTheDocument()

      await user.click(screen.getByText("Parent"))
      expect(screen.queryByText("Child Item")).not.toBeInTheDocument()
    })

    it("calls submenu item onClick", async () => {
      const user = userEvent.setup()
      const onClick = vi.fn()
      const items: DropdownMenuItem[] = [
        {
          id: "1",
          label: "Parent",
          submenu: [{ id: "1-1", label: "Child Item", onClick }],
        },
      ]
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={items} />)

      await user.click(screen.getByText("Open Menu"))
      await user.click(screen.getByText("Parent"))
      await user.click(screen.getByText("Child Item"))

      expect(onClick).toHaveBeenCalled()
    })

    it("closes entire menu when submenu item clicked", async () => {
      const user = userEvent.setup()
      const onClick = vi.fn()
      const items: DropdownMenuItem[] = [
        {
          id: "1",
          label: "Parent",
          submenu: [{ id: "1-1", label: "Child Item", onClick }],
        },
      ]
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={items} />)

      await user.click(screen.getByText("Open Menu"))
      await user.click(screen.getByText("Parent"))
      await user.click(screen.getByText("Child Item"))

      expect(screen.queryByRole("menu")).not.toBeInTheDocument()
    })

    it("positions submenu correctly", async () => {
      const user = userEvent.setup()
      const items: DropdownMenuItem[] = [
        {
          id: "1",
          label: "Parent",
          submenu: [{ id: "1-1", label: "Child Item", onClick: vi.fn() }],
        },
      ]
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={items} />)

      await user.click(screen.getByText("Open Menu"))
      await user.click(screen.getByText("Parent"))

      const submenu = screen.getByText("Child Item").closest(".absolute")
      expect(submenu).toHaveClass("left-full")
    })

    it("rotates arrow when submenu is open", async () => {
      const user = userEvent.setup()
      const items: DropdownMenuItem[] = [
        {
          id: "1",
          label: "Parent",
          submenu: [{ id: "1-1", label: "Child", onClick: vi.fn() }],
        },
      ]
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={items} />)

      await user.click(screen.getByText("Open Menu"))
      await user.click(screen.getByText("Parent"))

      const arrow = screen.getByText("Parent").closest("button")?.querySelector("svg")
      expect(arrow).toHaveClass("rotate-180")
    })

    it("does not call onClick for parent with submenu", async () => {
      const user = userEvent.setup()
      const parentOnClick = vi.fn()
      const items: DropdownMenuItem[] = [
        {
          id: "1",
          label: "Parent",
          onClick: parentOnClick,
          submenu: [{ id: "1-1", label: "Child", onClick: vi.fn() }],
        },
      ]
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={items} />)

      await user.click(screen.getByText("Open Menu"))
      await user.click(screen.getByText("Parent"))

      expect(parentOnClick).not.toHaveBeenCalled()
    })
  })

  describe("Position", () => {
    it("renders bottom-start position by default", async () => {
      const user = userEvent.setup()
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={defaultItems} />)

      await user.click(screen.getByText("Open Menu"))
      const menu = screen.getByRole("menu")
      expect(menu).toHaveClass("top-full", "left-0", "mt-2")
    })

    it("renders bottom-end position", async () => {
      const user = userEvent.setup()
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={defaultItems} position="bottom-end" />)

      await user.click(screen.getByText("Open Menu"))
      const menu = screen.getByRole("menu")
      expect(menu).toHaveClass("top-full", "right-0", "mt-2")
    })

    it("renders top-start position", async () => {
      const user = userEvent.setup()
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={defaultItems} position="top-start" />)

      await user.click(screen.getByText("Open Menu"))
      const menu = screen.getByRole("menu")
      expect(menu).toHaveClass("bottom-full", "left-0", "mb-2")
    })

    it("renders top-end position", async () => {
      const user = userEvent.setup()
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={defaultItems} position="top-end" />)

      await user.click(screen.getByText("Open Menu"))
      const menu = screen.getByRole("menu")
      expect(menu).toHaveClass("bottom-full", "right-0", "mb-2")
    })
  })

  describe("Click Outside", () => {
    it("closes menu when clicking outside", async () => {
      const user = userEvent.setup()
      render(
        <div>
          <div data-testid="outside">Outside</div>
          <DropdownMenu trigger={<button>Open Menu</button>} items={defaultItems} />
        </div>
      )

      await user.click(screen.getByText("Open Menu"))
      expect(screen.getByRole("menu")).toBeInTheDocument()

      fireEvent.mouseDown(screen.getByTestId("outside"))

      await waitFor(() => {
        expect(screen.queryByRole("menu")).not.toBeInTheDocument()
      })
    })

    it("does not close menu when clicking inside", async () => {
      const user = userEvent.setup()
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={defaultItems} />)

      await user.click(screen.getByText("Open Menu"))
      const menu = screen.getByRole("menu")

      fireEvent.mouseDown(menu)

      expect(screen.getByRole("menu")).toBeInTheDocument()
    })

    it("closes submenu when clicking outside", async () => {
      const user = userEvent.setup()
      const items: DropdownMenuItem[] = [
        {
          id: "1",
          label: "Parent",
          submenu: [{ id: "1-1", label: "Child", onClick: vi.fn() }],
        },
      ]
      render(
        <div>
          <div data-testid="outside">Outside</div>
          <DropdownMenu trigger={<button>Open Menu</button>} items={items} />
        </div>
      )

      await user.click(screen.getByText("Open Menu"))
      await user.click(screen.getByText("Parent"))
      expect(screen.getByText("Child")).toBeInTheDocument()

      fireEvent.mouseDown(screen.getByTestId("outside"))

      await waitFor(() => {
        expect(screen.queryByText("Child")).not.toBeInTheDocument()
      })
    })
  })

  describe("Keyboard Navigation", () => {
    it("closes menu on Escape key", async () => {
      const user = userEvent.setup()
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={defaultItems} />)

      await user.click(screen.getByText("Open Menu"))
      expect(screen.getByRole("menu")).toBeInTheDocument()

      fireEvent.keyDown(document, { key: "Escape" })

      await waitFor(() => {
        expect(screen.queryByRole("menu")).not.toBeInTheDocument()
      })
    })

    it("closes submenu on Escape key", async () => {
      const user = userEvent.setup()
      const items: DropdownMenuItem[] = [
        {
          id: "1",
          label: "Parent",
          submenu: [{ id: "1-1", label: "Child", onClick: vi.fn() }],
        },
      ]
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={items} />)

      await user.click(screen.getByText("Open Menu"))
      await user.click(screen.getByText("Parent"))
      expect(screen.getByText("Child")).toBeInTheDocument()

      fireEvent.keyDown(document, { key: "Escape" })

      await waitFor(() => {
        expect(screen.queryByText("Child")).not.toBeInTheDocument()
      })
    })
  })

  describe("Accessibility", () => {
    it("has correct aria attributes on trigger", () => {
      const { container } = render(<DropdownMenu trigger={<button>Open Menu</button>} items={defaultItems} />)
      const trigger = container.querySelector('[role="button"][aria-haspopup]')
      expect(trigger).toHaveAttribute("aria-haspopup", "true")
      expect(trigger).toHaveAttribute("aria-expanded", "false")
    })

    it("updates aria-expanded when menu opens", async () => {
      const user = userEvent.setup()
      const { container } = render(<DropdownMenu trigger={<button>Open Menu</button>} items={defaultItems} />)
      const trigger = container.querySelector('[role="button"][aria-haspopup]')

      await user.click(screen.getByText("Open Menu"))
      expect(trigger).toHaveAttribute("aria-expanded", "true")
    })

    it("trigger is keyboard accessible", () => {
      const { container } = render(<DropdownMenu trigger={<button>Open Menu</button>} items={defaultItems} />)
      const trigger = container.querySelector('[role="button"][aria-haspopup]')
      expect(trigger).toHaveAttribute("tabIndex", "0")
    })

    it("menu has role attribute", async () => {
      const user = userEvent.setup()
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={defaultItems} />)

      await user.click(screen.getByText("Open Menu"))
      expect(screen.getByRole("menu")).toBeInTheDocument()
    })

    it("icon has aria-hidden", async () => {
      const user = userEvent.setup()
      const items: DropdownMenuItem[] = [
        {
          id: "1",
          label: "Item",
          icon: <span>🔥</span>,
          onClick: vi.fn(),
        },
      ]
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={items} />)

      await user.click(screen.getByText("Open Menu"))
      const iconContainer = screen.getByText("🔥").parentElement
      expect(iconContainer).toHaveAttribute("aria-hidden", "true")
    })
  })

  describe("Menu Styling", () => {
    it("menu has correct base styling", async () => {
      const user = userEvent.setup()
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={defaultItems} />)

      await user.click(screen.getByText("Open Menu"))
      const menu = screen.getByRole("menu")
      expect(menu).toHaveClass("rounded-xl", "border", "bg-white", "shadow-lg", "py-1")
    })

    it("menu has correct z-index", async () => {
      const user = userEvent.setup()
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={defaultItems} />)

      await user.click(screen.getByText("Open Menu"))
      const menu = screen.getByRole("menu")
      expect(menu).toHaveClass("z-[1400]")
    })

    it("menu items have correct padding", async () => {
      const user = userEvent.setup()
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={defaultItems} />)

      await user.click(screen.getByText("Open Menu"))
      const item = screen.getByText("Item 1").closest("button")
      expect(item).toHaveClass("px-3", "py-2")
    })

    it("disabled items have opacity", async () => {
      const user = userEvent.setup()
      const items: DropdownMenuItem[] = [{ id: "1", label: "Disabled", disabled: true, onClick: vi.fn() }]
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={items} />)

      await user.click(screen.getByText("Open Menu"))
      const item = screen.getByText("Disabled").closest("button")
      expect(item).toHaveClass("opacity-50")
    })
  })

  describe("Edge Cases", () => {
    it("handles empty items array", async () => {
      const user = userEvent.setup()
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={[]} />)

      await user.click(screen.getByText("Open Menu"))
      const menu = screen.getByRole("menu")
      expect(menu).toBeInTheDocument()
      expect(menu.children).toHaveLength(0)
    })

    it("handles item without onClick", async () => {
      const user = userEvent.setup()
      const items: DropdownMenuItem[] = [{ id: "1", label: "No onClick" }]
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={items} />)

      await user.click(screen.getByText("Open Menu"))
      await user.click(screen.getByText("No onClick"))

      // Should close menu even without onClick
      expect(screen.queryByRole("menu")).not.toBeInTheDocument()
    })

    it("handles very long label text", async () => {
      const user = userEvent.setup()
      const longLabel = "A".repeat(100)
      const items: DropdownMenuItem[] = [{ id: "1", label: longLabel, onClick: vi.fn() }]
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={items} />)

      await user.click(screen.getByText("Open Menu"))
      expect(screen.getByText(longLabel)).toBeInTheDocument()
    })

    it("toggles menu open/close on trigger click", async () => {
      const user = userEvent.setup()
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={defaultItems} />)

      await user.click(screen.getByText("Open Menu"))
      expect(screen.getByRole("menu")).toBeInTheDocument()

      await user.click(screen.getByText("Open Menu"))
      expect(screen.queryByRole("menu")).not.toBeInTheDocument()
    })

    it("handles string trigger", () => {
      render(<DropdownMenu trigger="Menu Button" items={defaultItems} />)
      expect(screen.getByText("Menu Button")).toBeInTheDocument()
    })

    it("submenu has correct positioning classes", async () => {
      const user = userEvent.setup()
      const items: DropdownMenuItem[] = [
        {
          id: "1",
          label: "Parent",
          submenu: [{ id: "1-1", label: "Child", onClick: vi.fn() }],
        },
      ]
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={items} />)

      await user.click(screen.getByText("Open Menu"))
      await user.click(screen.getByText("Parent"))

      const submenu = screen.getByText("Child").closest(".absolute")
      expect(submenu).toHaveClass("rounded-xl", "border", "shadow-lg")
    })

    it("only one submenu can be open at a time", async () => {
      const user = userEvent.setup()
      const items: DropdownMenuItem[] = [
        {
          id: "1",
          label: "Parent 1",
          submenu: [{ id: "1-1", label: "Child 1", onClick: vi.fn() }],
        },
        {
          id: "2",
          label: "Parent 2",
          submenu: [{ id: "2-1", label: "Child 2", onClick: vi.fn() }],
        },
      ]
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={items} />)

      await user.click(screen.getByText("Open Menu"))
      await user.click(screen.getByText("Parent 1"))
      expect(screen.getByText("Child 1")).toBeInTheDocument()

      await user.click(screen.getByText("Parent 2"))
      expect(screen.queryByText("Child 1")).not.toBeInTheDocument()
      expect(screen.getByText("Child 2")).toBeInTheDocument()
    })
  })

  describe("Item Styling", () => {
    it("items have transition classes", async () => {
      const user = userEvent.setup()
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={defaultItems} />)

      await user.click(screen.getByText("Open Menu"))
      const item = screen.getByText("Item 1").closest("button")
      expect(item).toHaveClass("transition-colors")
    })

    it("normal items have correct text color", async () => {
      const user = userEvent.setup()
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={defaultItems} />)

      await user.click(screen.getByText("Open Menu"))
      const item = screen.getByText("Item 1").closest("button")
      expect(item).toHaveClass("text-neutral-900")
    })

    it("items have full width", async () => {
      const user = userEvent.setup()
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={defaultItems} />)

      await user.click(screen.getByText("Open Menu"))
      const item = screen.getByText("Item 1").closest("button")
      expect(item).toHaveClass("w-full")
    })

    it("label is left-aligned", async () => {
      const user = userEvent.setup()
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={defaultItems} />)

      await user.click(screen.getByText("Open Menu"))
      const label = screen.getByText("Item 1")
      expect(label).toHaveClass("text-left")
    })

    it("shortcut has correct styling", async () => {
      const user = userEvent.setup()
      const items: DropdownMenuItem[] = [{ id: "1", label: "Copy", shortcut: "⌘C", onClick: vi.fn() }]
      render(<DropdownMenu trigger={<button>Open Menu</button>} items={items} />)

      await user.click(screen.getByText("Open Menu"))
      const shortcut = screen.getByText("⌘C")
      expect(shortcut).toHaveClass("text-xs", "font-medium", "text-neutral-400")
    })
  })
})
