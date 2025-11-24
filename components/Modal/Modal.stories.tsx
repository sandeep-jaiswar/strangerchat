import React, { useState } from "react"
import { Modal } from "./Modal"

export default { title: "Modal" }

export const Default = () => {
  const [open, setOpen] = useState(true)
  return (
    <Modal open={open} onClose={() => setOpen(false)} title="Modal Title">
      <div>Modal Content</div>
    </Modal>
  )
}
