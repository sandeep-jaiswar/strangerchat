import React from "react"
import { Button } from "components/Button/Button"
import { Header } from "./Header"

export default { title: "Header" }

export const Default = () => <Header title="StrangerChat" actions={<Button>Logout</Button>} />
