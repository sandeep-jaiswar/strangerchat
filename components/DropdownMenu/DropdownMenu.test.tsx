import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import React from "react"
import { DropdownMenu, DropdownMenuItem } from "./DropdownMenu"

const mockItems: (DropdownMenuItem | "divider")[] = [
  { id: "1", label: "Item 1", onClick: vi.fn() },
  { id: "2", label: "Item 2", onClick: vi.fn() },
  "divider",
  { id: "3", label: "Item 3", disabled: true, onClick: vi.fn() },
]

describe("DropdownMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("should render trigger", () => {
      render(<DropdownMenu trigger={<button>Menu</button>} items={mockItems} />)
      expect(screen.getByRole("button", { name: "Menu" })).toBeInTheDocument()
    })

    it("should not show menu initially", () => {
      render(<DropdownMenu trigger={<button>Menu</button>} items={mockItems} />)
      expect(screen.queryByRole("menu")).not.toBeInTheDocument()
    })

    it("should show menu when trigger clicked", () => {
      render(<DropdownMenu trigger={<button>Menu</button>} items={mockItems} />)
      fireEvent.click(screen.getByRole("button", { name: "Menu" }))
      expect(screen.getByRole("menu")).toBeInTheDocument()
    })
  })

  describe("Menu items", () => {
    it("should render all menu items", () => {
      render(<DropdownMenu trigger={<button>Menu</button>} items={mockItems} />)
      fireEvent.click(screen.getByRole("button", { name: "Menu" }))

      expect(screen.getByText("Item 1")).toBeInTheDocument()
      expect(screen.getByText("Item 2")).toBeInTheDocument()
      expect(screen.getByText("Item 3")).toBeInTheDocument()
    })

    it("should render dividers", () => {
      render(<DropdownMenu trigger={<button>Menu</button>} items={mockItems} />)
      fireEvent.click(screen.getByRole("button", { name: "Menu" }))

      expect(screen.getByRole("separator")).toBeInTheDocument()
    })

    it("should render item with icon", () => {
      const Icon = () => <span data-testid="icon">★</span>
      const items: DropdownMenuItem[] = [{ id: "1", label: "Item", icon: <Icon />, onClick: vi.fn() }]

      render(<DropdownMenu trigger={<button>Menu</button>} items={items} />)
      fireEvent.click(screen.getByRole("button", { name: "Menu" }))

      expect(screen.getByTestId("icon")).toBeInTheDocument()
    })

    it("should render item with shortcut", () => {
      const items: DropdownMenuItem[] = [{ id: "1", label: "Item", shortcut: "⌘K", onClick: vi.fn() }]

      render(<DropdownMenu trigger={<button>Menu</button>} items={items} />)
      fireEvent.click(screen.getByRole("button", { name: "Menu" }))

      expect(screen.getByText("⌘K")).toBeInTheDocument()
    })

    it("should render danger item with proper styling", () => {
      const items: DropdownMenuItem[] = [{ id: "1", label: "Delete", danger: true, onClick: vi.fn() }]

      render(<DropdownMenu trigger={<button>Menu</button>} items={items} />)
      fireEvent.click(screen.getByRole("button", { name: "Menu" }))

      expect(screen.getByText("Delete")).toHaveClass("text-[#ff3b30]")
    })

    it("should disable item when disabled", () => {
      render(<DropdownMenu trigger={<button>Menu</button>} items={mockItems} />)
      fireEvent.click(screen.getByRole("button", { name: "Menu" }))

      expect(screen.getByText("Item 3").closest("button")).toBeDisabled()
    })
  })

  describe("Item interactions", () => {
    it("should call onClick when item clicked", () => {
      const onClick = vi.fn()
      const items: DropdownMenuItem[] = [{ id: "1", label: "Item", onClick }]

      render(<DropdownMenu trigger={<button>Menu</button>} items={items} />)
      fireEvent.click(screen.getByRole("button", { name: "Menu" }))
      fireEvent.click(screen.getByText("Item"))

      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it("should close menu after item click", async () => {
      const items: DropdownMenuItem[] = [{ id: "1", label: "Item", onClick: vi.fn() }]

      render(<DropdownMenu trigger={<button>Menu</button>} items={items} />)
      fireEvent.click(screen.getByRole("button", { name: "Menu" }))
      fireEvent.click(screen.getByText("Item"))

      await waitFor(() => {
        expect(screen.queryByRole("menu")).not.toBeInTheDocument()
      })
    })

    it("should not call onClick for disabled item", () => {
      const onClick = vi.fn()
      const items: DropdownMenuItem[] = [{ id: "1", label: "Item", disabled: true, onClick }]

      render(<DropdownMenu trigger={<button>Menu</button>} items={items} />)
      fireEvent.click(screen.getByRole("button", { name: "Menu" }))
      fireEvent.click(screen.getByText("Item"))

      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe("Submenu", () => {
    const itemsWithSubmenu: DropdownMenuItem[] = [
      {
        id: "1",
        label: "Parent",
        submenu: [
          { id: "1-1", label: "Child 1", onClick: vi.fn() },
          { id: "1-2", label: "Child 2", onClick: vi.fn() },
        ],
      },
    ]

    it("should show submenu indicator", () => {
      render(<DropdownMenu trigger={<button>Menu</button>} items={itemsWithSubmenu} />)
      fireEvent.click(screen.getByRole("button", { name: "Menu" }))

      const parent = screen.getByText("Parent").closest("button")
      expect(parent?.querySelector("svg")).toBeInTheDocument()
    })

    it("should open submenu on parent click", () => {
      render(<DropdownMenu trigger={<button>Menu</button>} items={itemsWithSubmenu} />)
      fireEvent.click(screen.getByRole("button", { name: "Menu" }))
      fireEvent.click(screen.getByText("Parent"))

      expect(screen.getByText("Child 1")).toBeInTheDocument()
      expect(screen.getByText("Child 2")).toBeInTheDocument()
    })

    it("should toggle submenu on repeated clicks", () => {
      render(<DropdownMenu trigger={<button>Menu</button>} items={itemsWithSubmenu} />)
      fireEvent.click(screen.getByRole("button", { name: "Menu" }))

      fireEvent.click(screen.getByText("Parent"))
      expect(screen.getByText("Child 1")).toBeInTheDocument()

      fireEvent.click(screen.getByText("Parent"))
      expect(screen.queryByText("Child 1")).not.toBeInTheDocument()
    })
  })

  describe("Close behavior", () => {
    it("should close on outside click", async () => {
      render(<DropdownMenu trigger={<button>Menu</button>} items={mockItems} />)
      fireEvent.click(screen.getByRole("button", { name: "Menu" }))
      expect(screen.getByRole("menu")).toBeInTheDocument()

      fireEvent.mouseDown(document.body)

      await waitFor(() => {
        expect(screen.queryByRole("menu")).not.toBeInTheDocument()
      })
    })

    it("should close on Escape key", async () => {
      render(<DropdownMenu trigger={<button>Menu</button>} items={mockItems} />)
      fireEvent.click(screen.getByRole("button", { name: "Menu" }))
      expect(screen.getByRole("menu")).toBeInTheDocument()

      fireEvent.keyDown(document, { key: "Escape" })

      await waitFor(() => {
        expect(screen.queryByRole("menu")).not.toBeInTheDocument()
      })
    })
  })

  describe("Positions", () => {
    const positions = ["bottom-start", "bottom-end", "top-start", "top-end"] as const

    positions.forEach((position) => {
      it(`should render ${position} position`, () => {
        const { container } = render(
          <DropdownMenu trigger={<button>Menu</button>} items={mockItems} position={position} />
        )
        fireEvent.click(screen.getByRole("button", { name: "Menu" }))

        const menu = container.querySelector('[role="menu"]')
        expect(menu).toHaveClass(position.includes("top") ? "bottom-full" : "top-full")
      })
    })
  })

  describe("Accessibility", () => {
    it("should have menu role", () => {
      render(<DropdownMenu trigger={<button>Menu</button>} items={mockItems} />)
      fireEvent.click(screen.getByRole("button", { name: "Menu" }))
      expect(screen.getByRole("menu")).toBeInTheDocument()
    })

    it("should support custom className", () => {
      const { container } = render(
        <DropdownMenu trigger={<button>Menu</button>} items={mockItems} className="custom" />
      )
      expect(container.querySelector(".custom")).toBeInTheDocument()
    })
  })
})
