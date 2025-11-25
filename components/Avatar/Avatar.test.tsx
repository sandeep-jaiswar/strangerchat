import { render } from "@testing-library/react"
import React from "react"
import { Avatar } from "./Avatar"

describe("Avatar", () => {
  it("renders image when src is provided", () => {
    const { getByAltText } = render(<Avatar src="/img.png" alt="user" size={32} width={32} height={32} />)
    const img = getByAltText("user")
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute("width", "32")
    expect(img).toHaveAttribute("height", "32")
  })

  it("renders initials when src is not provided", () => {
    const { getByText } = render(<Avatar initials="AB" alt="AB avatar" />)
    expect(getByText("AB")).toBeInTheDocument()
  })

  it("applies size", () => {
    const { container } = render(<Avatar initials="A" size={50} alt="A avatar" />)
    expect(container.firstChild).toHaveStyle("width: 50px")
    expect(container.firstChild).toHaveStyle("height: 50px")
  })

  it("applies custom className", () => {
    const { container } = render(<Avatar initials="A" alt="A avatar" className="custom-avatar" />)
    expect(container.firstChild).toHaveClass("custom-avatar")
  })
})
