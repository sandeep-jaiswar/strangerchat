import React, { useState } from "react"
import { Input } from "./Input"

export default { title: "Input" }

export const Default = () => {
  const [value, setValue] = useState("")
  return <Input label="Name" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Enter your name" />
}

export const Error = () => (
  <Input label="Email" value="" onChange={() => {}} error="Invalid email" placeholder="Enter your email" />
)
