import React from "react"
import { ChatBubble } from "./ChatBubble"

export default { title: "ChatBubble" }

export const Own = () => <ChatBubble message="Hello!" isOwn timestamp="10:00" />
export const Other = () => <ChatBubble message="Hi there!" timestamp="10:01" />
