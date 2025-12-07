"use client"

import { useSession } from "next-auth/react"

const Home = () => {
  const { data: session } = useSession()
  console.log("Session data on landing page:", session)

  return (
    <main>
      <h1>Welcome to the Home Page</h1>
    </main>
  )
}

export default Home
