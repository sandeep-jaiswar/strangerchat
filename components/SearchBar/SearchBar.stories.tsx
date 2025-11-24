import React, { useState } from "react"
import { SearchBar } from "./SearchBar"

export default { title: "SearchBar" }

export const Default = () => {
  const [val, setVal] = useState("")
  return <SearchBar value={val} onChange={setVal} />
}
