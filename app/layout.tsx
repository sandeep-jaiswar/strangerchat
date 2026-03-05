import { Metadata } from "next"
import { Inter } from "next/font/google"
import { ReactNode } from "react"
import SessionProvider from "providers/SessionProvider"
import { env } from "../env.mjs"
import "styles/tailwind.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
export const metadata: Metadata = {
  title: "StrangerChat - Anonymous Random Chat",
  description: "Connect with random strangers around the world instantly",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <head>
        <meta name="google-adsense-account" content={env.NEXT_PUBLIC_ADSENSE_CLIENT} />
      </head>
      <body className="bg-slate-950 font-sans text-slate-50 antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
