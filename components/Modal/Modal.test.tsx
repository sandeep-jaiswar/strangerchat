import { fireEvent, render } from "@testing-library/react"
import React from "react"
import { Modal } from "./Modal"

describe("Modal", () => {
  it("renders when open", () => {
    const { getByText } = render(
      <Modal open onClose={() => {}}>
        Content
      </Modal>
    )
    expect(getByText("Content")).toBeInTheDocument()
  })

  it("does not render when closed", () => {
    const { queryByText } = render(
      <Modal open={false} onClose={() => {}}>
        Content
      </Modal>
    )
    expect(queryByText("Content")).toBeNull()
  })

  it("calls onClose", () => {
    const onClose = jest.fn()
    const { getByText } = render(
      <Modal open onClose={onClose}>
        Content
      </Modal>
    )
    fireEvent.click(getByText("Close"))
    expect(onClose).toHaveBeenCalled()
  })
})
