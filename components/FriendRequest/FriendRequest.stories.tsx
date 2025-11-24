import React from "react"
import { FriendRequest } from "./FriendRequest"

export default { title: "FriendRequest" }

export const Default = () => (
  <FriendRequest name="Charlie" onAccept={() => alert("Accepted")} onDecline={() => alert("Declined")} />
)
