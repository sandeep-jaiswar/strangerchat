import React from "react"
import { DropdownMenu } from "./DropdownMenu"

export default { title: "DropdownMenu" }

const options = [
  { label: "Profile", value: "profile" },
  { label: "Logout", value: "logout" },
]

export const Default = () => <DropdownMenu options={options} onSelect={(val) => alert(val)} />
