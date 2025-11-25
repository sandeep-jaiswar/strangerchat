import { render } from "@testing-library/react"
import React from "react"
import { Avatar } from "./Avatar"

describe("Avatar", () => {
  it("renders image when src is provided", () => {
    const { getByAltText } = render(<Avatar src="/img.png" alt="user" size="sm" />)
    const img = getByAltText("user")
    expect(img).toBeInTheDocument()
  })

  it("renders initials when src is not provided", () => {
    const { getByText } = render(<Avatar initials="AB" alt="AB avatar" />)
    expect(getByText("AB")).toBeInTheDocument()
  })

  it("applies size classes", () => {
    const { container } = render(<Avatar initials="A" size="lg" alt="A avatar" />)
    const avatarDiv = container.querySelector(".w-12")
    expect(avatarDiv).toBeInTheDocument()
    expect(avatarDiv).toHaveClass("h-12")
  })

  it("applies custom className", () => {
    const { container } = render(<Avatar initials="A" alt="A avatar" className="custom-avatar" />)
    const avatarDiv = container.querySelector(".custom-avatar")
    expect(avatarDiv).toBeInTheDocument()
  })

  it("renders status indicator when status is provided", () => {
    const { container } = render(<Avatar initials="A" alt="A avatar" status="online" />)
    const statusIndicator = container.querySelector(".bg-success")
    expect(statusIndicator).toBeInTheDocument()
  })

  it("applies different size variants", () => {
    const { container: xsContainer } = render(<Avatar initials="A" alt="A avatar" size="xs" />)
    expect(xsContainer.querySelector(".w-6")).toBeInTheDocument()

    const { container: xlContainer } = render(<Avatar initials="A" alt="A avatar" size="xl" />)
    expect(xlContainer.querySelector(".w-16")).toBeInTheDocument()
  })
})
