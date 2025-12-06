import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import React from "react"
import { Modal } from "./Modal"

describe("Modal", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    children: <div>Modal content</div>,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("should render when open", () => {
      render(<Modal {...defaultProps} />)
      expect(screen.getByRole("dialog")).toBeInTheDocument()
      expect(screen.getByText("Modal content")).toBeInTheDocument()
    })

    it("should not render when closed", () => {
      render(<Modal {...defaultProps} open={false} />)
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })

    it("should render with title", () => {
      render(<Modal {...defaultProps} title="Modal Title" />)
      expect(screen.getByText("Modal Title")).toBeInTheDocument()
    })

    it("should render with description", () => {
      render(<Modal {...defaultProps} description="Modal description" />)
      expect(screen.getByText("Modal description")).toBeInTheDocument()
    })

    it("should render with footer", () => {
      render(<Modal {...defaultProps} footer={<button>Action</button>} />)
      expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument()
    })
  })

  describe("Sizes", () => {
    const sizes = ["sm", "md", "lg", "full"] as const

    sizes.forEach((size) => {
      it(`should render ${size} size`, () => {
        const { container } = render(<Modal {...defaultProps} size={size} />)
        const modal = container.querySelector('[data-testid="modal-content"]')
        expect(modal).toHaveClass(
          size === "sm"
            ? "max-w-sm"
            : size === "md"
            ? "max-w-md"
            : size === "lg"
            ? "max-w-2xl"
            : "max-w-[calc(100vw-2rem)]"
        )
      })
    })
  })

  describe("Close button", () => {
    it("should show close button by default", () => {
      render(<Modal {...defaultProps} title="Title" />)
      expect(screen.getByLabelText("Close modal")).toBeInTheDocument()
    })

    it("should hide close button when showCloseButton is false", () => {
      render(<Modal {...defaultProps} showCloseButton={false} />)
      expect(screen.queryByLabelText("Close modal")).not.toBeInTheDocument()
    })

    it("should call onOpenChange when close button clicked", () => {
      const onOpenChange = vi.fn()
      render(<Modal {...defaultProps} onOpenChange={onOpenChange} title="Title" />)

      fireEvent.click(screen.getByLabelText("Close modal"))
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe("Backdrop interaction", () => {
    it("should close on backdrop click by default", () => {
      const onOpenChange = vi.fn()
      render(<Modal {...defaultProps} onOpenChange={onOpenChange} />)

      const backdrop = screen.getByRole("dialog").querySelector('[aria-hidden="true"]')
      fireEvent.click(backdrop!)

      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it("should not close on backdrop click when closeOnBackdropClick is false", () => {
      const onOpenChange = vi.fn()
      render(<Modal {...defaultProps} onOpenChange={onOpenChange} closeOnBackdropClick={false} />)

      const backdrop = screen.getByRole("dialog").querySelector('[aria-hidden="true"]')
      fireEvent.click(backdrop!)

      expect(onOpenChange).not.toHaveBeenCalled()
    })

    it("should not close on content click", () => {
      const onOpenChange = vi.fn()
      render(<Modal {...defaultProps} onOpenChange={onOpenChange} />)

      fireEvent.click(screen.getByText("Modal content"))
      expect(onOpenChange).not.toHaveBeenCalled()
    })
  })

  describe("Keyboard interaction", () => {
    it("should close on Escape key", () => {
      const onOpenChange = vi.fn()
      render(<Modal {...defaultProps} onOpenChange={onOpenChange} />)

      fireEvent.keyDown(document, { key: "Escape" })
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it("should not close on other keys", () => {
      const onOpenChange = vi.fn()
      render(<Modal {...defaultProps} onOpenChange={onOpenChange} />)

      fireEvent.keyDown(document, { key: "Enter" })
      expect(onOpenChange).not.toHaveBeenCalled()
    })
  })

  describe("Body scroll lock", () => {
    it("should lock body scroll when open", () => {
      render(<Modal {...defaultProps} />)
      expect(document.body.style.overflow).toBe("hidden")
    })

    it("should restore body scroll when closed", () => {
      const { rerender } = render(<Modal {...defaultProps} />)
      expect(document.body.style.overflow).toBe("hidden")

      rerender(<Modal {...defaultProps} open={false} />)
      expect(document.body.style.overflow).toBe("")
    })

    it("should restore body scroll on unmount", () => {
      const { unmount } = render(<Modal {...defaultProps} />)
      expect(document.body.style.overflow).toBe("hidden")

      unmount()
      expect(document.body.style.overflow).toBe("")
    })
  })

  describe("Accessibility", () => {
    it("should have role dialog", () => {
      render(<Modal {...defaultProps} />)
      expect(screen.getByRole("dialog")).toBeInTheDocument()
    })

    it("should have aria-modal", () => {
      render(<Modal {...defaultProps} />)
      expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true")
    })

    it("should have aria-labelledby when title provided", () => {
      render(<Modal {...defaultProps} title="Title" />)
      expect(screen.getByRole("dialog")).toHaveAttribute("aria-labelledby", "modal-title")
    })

    it("should have aria-describedby when description provided", () => {
      render(<Modal {...defaultProps} description="Description" />)
      expect(screen.getByRole("dialog")).toHaveAttribute("aria-describedby", "modal-description")
    })

    it("should support custom body className", () => {
      render(<Modal {...defaultProps} bodyClassName="custom-body" />)
      expect(screen.getByText("Modal content").parentElement).toHaveClass("custom-body")
    })
  })

  describe("Focus management", () => {
    it("should focus first focusable element when opened", async () => {
      render(
        <Modal {...defaultProps} title="Title">
          <button>First</button>
          <button>Second</button>
        </Modal>
      )

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Close modal" })).toHaveFocus()
      })
    })
  })
})
