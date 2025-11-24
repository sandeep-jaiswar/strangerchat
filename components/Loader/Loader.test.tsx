import { render } from "@testing-library/react"
import React from "react"
import { Loader } from "./Loader"

describe("Loader", () => {
  it("renders loader", () => {
    const { container } = render(<Loader />)
    expect(container.firstChild).toBeInTheDocument()
  })
})
