import { render, screen } from "@testing-library/react"
import React from "react"
import { describe, expect, it } from "vitest"
import { Header } from "./Header"

describe("Header", () => {
  describe("Rendering", () => {
    it("should render header with title", () => {
      render(<Header title="Test Title" />)
      expect(screen.getByText("Test Title")).toBeInTheDocument()
    })

    it("should render with subtitle", () => {
      render(<Header title="Title" subtitle="Subtitle" />)
      expect(screen.getByText("Subtitle")).toBeInTheDocument()
    })

    it("should render with actions", () => {
      render(<Header title="Title" actions={<button>Action</button>} />)
      expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument()
    })

    it("should render with left content", () => {
      render(<Header title="Title" leftContent={<div>Left</div>} />)
      expect(screen.getByText("Left")).toBeInTheDocument()
    })
  })

  describe("Sticky behavior", () => {
    it("should not be sticky by default", () => {
      const { container } = render(<Header title="Title" />)
      expect(container.firstChild).not.toHaveClass("sticky")
    })

    it("should be sticky when sticky prop is true", () => {
      const { container } = render(<Header title="Title" sticky />)
      expect(container.firstChild).toHaveClass("sticky")
    })
  })

  describe("Styling", () => {
    it("should support custom className", () => {
      const { container } = render(<Header title="Title" className="custom" />)
      expect(container.firstChild).toHaveClass("custom")
    })

    it("should have banner role", () => {
      render(<Header title="Title" />)
      expect(screen.getByRole("banner")).toBeInTheDocument()
    })
  })

  describe("Layout", () => {
    it("should truncate long title", () => {
      render(<Header title="Very long title that should be truncated" />)
      const title = screen.getByText("Very long title that should be truncated")
      expect(title).toHaveClass("truncate")
    })

    it("should truncate long subtitle", () => {
      render(<Header title="Title" subtitle="Very long subtitle" />)
      const subtitle = screen.getByText("Very long subtitle")
      expect(subtitle).toHaveClass("truncate")
    })
  })
})
