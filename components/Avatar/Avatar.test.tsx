import { render } from "@testing-library/react"
import React from "react"
import { Avatar } from "./Avatar"

describe("Avatar", () => {
  it("renders image when src is provided", () => {
    const { getByAltText } = render(<Avatar src="img.png" alt="user" />)
    expect(getByAltText("user")).toBeInTheDocument()
  })

  it("renders initials when src is not provided", () => {
    const { getByText } = render(<Avatar initials="AB" />)
    expect(getByText("AB")).toBeInTheDocument()
  })

  it("applies size", () => {
    const { container } = render(<Avatar initials="A" size={50} />)
    expect(container.firstChild).toHaveStyle("width: 50px")
  })
})
