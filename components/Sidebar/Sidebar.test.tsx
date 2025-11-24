import { fireEvent, render } from "@testing-library/react"
import React from "react"
import { Sidebar } from "./Sidebar"

const items = [{ label: "A", onClick: jest.fn() }]

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
