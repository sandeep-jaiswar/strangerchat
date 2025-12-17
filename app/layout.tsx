import { Metadata } from "next"
import { ReactNode } from "react"
import SessionProvider from "providers/SessionProvider"
import { env } from "../env.mjs"
import "styles/tailwind.css"

export const metadata: Metadata = {
  title: "StrangerChat - Anonymous Random Chat",
  description: "Connect with random strangers around the world instantly",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content={env.NEXT_PUBLIC_ADSENSE_CLIENT} />
      </head>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
