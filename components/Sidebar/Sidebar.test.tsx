import { fireEvent, render } from "@testing-library/react"
import React from "react"
import { Sidebar } from "./Sidebar"

import { vi } from "vitest"
const items = [{ label: "A", onClick: vi.fn() }]

describe("Sidebar", () => {
  it("renders items", () => {
    const { getByText } = render(<Sidebar items={items} />)
    expect(getByText("A")).toBeInTheDocument()
  })

  it("calls onClick", () => {
    const { getByText } = render(<Sidebar items={items} />)
    fireEvent.click(getByText("A"))
    expect(items[0].onClick).toHaveBeenCalled()
  })
})
