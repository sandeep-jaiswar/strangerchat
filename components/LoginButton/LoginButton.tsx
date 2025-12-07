"use client"
import { signIn, signOut, useSession } from "next-auth/react"
import { Button } from "../Button"

export default function LoginButton() {
  const { data: session } = useSession()

  if (session) {
    return (
      <Button variant="bordered" intent="danger" onClick={() => signOut()}>
        Sign out
      </Button>
    )
  }
  return (
    <Button variant="bordered" intent="danger" onClick={() => signIn("google")}>
      Sign in with Google
    </Button>
  )
}
