"use client"

import { SessionProvider as NSessionProvider } from "next-auth/react"
import { Session } from "next-auth"

type Props = {
  children: React.ReactNode
  session?: Session | null
}

const SessionProvider = ({ children, session }: Props) => {
  return <NSessionProvider session={session}>{children}</NSessionProvider>
}

export default SessionProvider
