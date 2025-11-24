import React from "react"
import { ChatList } from "./ChatList"

export default { title: "ChatList" }

const messages = [
  { id: "1", message: "Hello!", isOwn: true, timestamp: "10:00" },
  { id: "2", message: "Hi!", timestamp: "10:01" },
]

export const Default = () => <ChatList messages={messages} />
