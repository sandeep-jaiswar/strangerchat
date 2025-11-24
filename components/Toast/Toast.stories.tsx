import React, { useState } from "react"
import { Toast } from "./Toast"

export default { title: "Toast" }

export const Success = () => {
  const [open, setOpen] = useState(true)
  return open ? <Toast message="Success!" type="success" onClose={() => setOpen(false)} /> : null
}

export const Error = () => {
  const [open, setOpen] = useState(true)
  return open ? <Toast message="Error!" type="error" onClose={() => setOpen(false)} /> : null
}
