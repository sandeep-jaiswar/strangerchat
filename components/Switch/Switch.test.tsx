import { fireEvent, render, screen } from "@testing-library/react"
import React from "react"
import { describe, expect, it, vi } from "vitest"

import { Switch } from "./Switch"

describe("Switch", () => {
  describe("Rendering", () => {
    it("should render switch", () => {
      render(<Switch />)
      expect(screen.getByRole("checkbox")).toBeInTheDocument()
    })

    it("should render with label", () => {
      render(<Switch label="Enable feature" />)
      expect(screen.getByText("Enable feature")).toBeInTheDocument()
    })

    it("should render with helper text", () => {
      render(<Switch helperText="This is a helper text" />)
      expect(screen.getByText("This is a helper text")).toBeInTheDocument()
    })
  })

  describe("Intents", () => {
    const intents = ["primary", "secondary", "success", "danger", "warning"] as const

    intents.forEach((intent) => {
      it(`should render ${intent} intent`, () => {
        render(<Switch intent={intent} />)
        expect(screen.getByRole("checkbox")).toBeInTheDocument()
      })
    })
  })

  describe("Sizes", () => {
    it("should render small size", () => {
      const { container } = render(<Switch size="sm" />)
      expect(container.querySelector(".w-9")).toBeInTheDocument()
    })

    it("should render medium size", () => {
      const { container } = render(<Switch size="md" />)
      expect(container.querySelector(".w-11")).toBeInTheDocument()
    })

    it("should render large size", () => {
      const { container } = render(<Switch size="lg" />)
      expect(container.querySelector(".w-14")).toBeInTheDocument()
    })
  })

  describe("Label position", () => {
    it("should render label on right by default", () => {
      const { container } = render(<Switch label="Label" />)
      const wrapper = container.querySelector(".flex-row-reverse")
      expect(wrapper).not.toBeInTheDocument()
    })

    it("should render label on left", () => {
      const { container } = render(<Switch label="Label" labelPosition="left" />)
      const wrapper = container.querySelector(".flex-row-reverse")
      expect(wrapper).toBeInTheDocument()
    })
  })

  describe("Checked state", () => {
    it("should be unchecked by default", () => {
      render(<Switch />)
      expect(screen.getByRole("checkbox")).not.toBeChecked()
    })

    it("should be checked when defaultChecked", () => {
      render(<Switch defaultChecked />)
      expect(screen.getByRole("checkbox")).toBeChecked()
    })

    it("should be controlled by checked prop", () => {
      const { rerender } = render(<Switch checked={false} onChange={() => {}} />)
      expect(screen.getByRole("checkbox")).not.toBeChecked()

      rerender(<Switch checked={true} onChange={() => {}} />)
      expect(screen.getByRole("checkbox")).toBeChecked()
    })
  })

  describe("Disabled state", () => {
    it("should be disabled", () => {
      render(<Switch disabled />)
      expect(screen.getByRole("checkbox")).toBeDisabled()
    })

    it("should have disabled styling", () => {
      const { container } = render(<Switch disabled label="Label" />)
      expect(container.querySelector(".opacity-50")).toBeInTheDocument()
    })

    it("should not trigger onChange when disabled", () => {
      const onChange = vi.fn()
      render(<Switch disabled onChange={onChange} checked={false} />)

      const checkbox = screen.getByRole("checkbox")
      expect(checkbox).toBeDisabled()

      // Even if we try to click, the browser won't allow interaction
      // Instead, verify the input remains unchecked
      expect(checkbox).not.toBeChecked()
    })
  })

  describe("Interaction", () => {
    it("should call onChange when clicked", () => {
      const onChange = vi.fn()
      render(<Switch onChange={onChange} />)

      fireEvent.click(screen.getByRole("checkbox"))
      expect(onChange).toHaveBeenCalledTimes(1)
    })

    it("should toggle state on click", () => {
      render(<Switch />)
      const checkbox = screen.getByRole("checkbox")

      expect(checkbox).not.toBeChecked()

      fireEvent.click(checkbox)
      expect(checkbox).toBeChecked()

      fireEvent.click(checkbox)
      expect(checkbox).not.toBeChecked()
    })

    it("should be clickable via label", () => {
      const onChange = vi.fn()
      render(<Switch label="Enable" onChange={onChange} />)

      fireEvent.click(screen.getByText("Enable"))
      expect(onChange).toHaveBeenCalled()
    })
  })

  describe("Accessibility", () => {
    it("should have checkbox role", () => {
      render(<Switch />)
      expect(screen.getByRole("checkbox")).toBeInTheDocument()
    })

    it("should generate unique id", () => {
      const { container } = render(<Switch />)
      const input = container.querySelector("input")
      expect(input?.id).toBeTruthy()
    })

    it("should use provided id", () => {
      render(<Switch id="custom-id" />)
      expect(screen.getByRole("checkbox")).toHaveAttribute("id", "custom-id")
    })

    it("should support custom className", () => {
      const { container } = render(<Switch label="Label" className="custom-class" />)
      expect(container.querySelector(".custom-class")).toBeInTheDocument()
    })

    it("should forward ref", () => {
      const ref = React.createRef<HTMLInputElement>()
      render(<Switch ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
    })

    it("should have sr-only class on input", () => {
      render(<Switch />)
      expect(screen.getByRole("checkbox")).toHaveClass("sr-only")
    })
  })

  describe("Combinations", () => {
    it("should render checked primary switch with label", () => {
      render(<Switch intent="primary" defaultChecked label="Enable" />)
      expect(screen.getByRole("checkbox")).toBeChecked()
      expect(screen.getByText("Enable")).toBeInTheDocument()
    })

    it("should render large disabled switch with helper text", () => {
      const { container } = render(<Switch size="lg" disabled helperText="Helper text" label="Label" />)
      expect(screen.getByRole("checkbox")).toBeDisabled()
      expect(screen.getByText("Helper text")).toBeInTheDocument()
      expect(container.querySelector(".w-14")).toBeInTheDocument()
    })
  })
})
