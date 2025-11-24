import { render } from "@testing-library/react"
import React from "react"
import { UserProfile } from "./UserProfile"

describe("UserProfile", () => {
  it("renders name and email", () => {
    const { getByText } = render(<UserProfile name="A" email="a@b.com" />)
    expect(getByText("A")).toBeInTheDocument()
    expect(getByText("a@b.com")).toBeInTheDocument()
  })

  it("renders avatar", () => {
    const { container } = render(<UserProfile name="A" email="a@b.com" avatar="img.png" />)
    expect(container.querySelector("img")).toBeInTheDocument()
  })
})
