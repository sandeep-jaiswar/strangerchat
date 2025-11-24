import React from "react"
import { FriendList } from "./FriendList"

export default { title: "FriendList" }

const friends = [
  { id: "1", name: "Alice", avatar: "" },
  { id: "2", name: "Bob", avatar: "" },
]

export const Default = () => <FriendList friends={friends} />
