"use client"

import { Session } from "next-auth"
import { SessionProvider as NSessionProvider } from "next-auth/react"

type Props = {
  children: React.ReactNode
  session?: Session | null
}

const SessionProvider = ({ children, session }: Props) => {
  return <NSessionProvider session={session}>{children}</NSessionProvider>
}

export default SessionProvider
