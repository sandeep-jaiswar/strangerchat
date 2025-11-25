import { render, screen } from "@testing-library/react"
import React from "react"
import { Header } from "./Header"

import { describe, it, expect } from "vitest"
describe("Header", () => {
  it("renders title", () => {
    render(<Header title="Chat" />)
    expect(screen.getByText("Chat")).toBeInTheDocument()
  })

  it("renders actions", () => {
    render(<Header title="Chat" actions={<button>Act</button>} />)
    expect(screen.getByText("Act")).toBeInTheDocument()
  })
})
