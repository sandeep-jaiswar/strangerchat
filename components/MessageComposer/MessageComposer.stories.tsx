import React from "react"
import { MessageComposer } from "./MessageComposer"

export default { title: "MessageComposer" }

export const Default = () => <MessageComposer onSend={(msg) => alert(msg)} />
