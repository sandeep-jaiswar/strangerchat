import React from "react"
import { Sidebar } from "./Sidebar"

export default { title: "Sidebar" }

const items = [
  { label: "Chats", onClick: () => alert("Chats") },
  { label: "Friends", onClick: () => alert("Friends") },
]

export const Default = () => <Sidebar items={items} />
