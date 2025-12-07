import { ReactNode } from "react"
import SessionProvider from "providers/SessionProvider"
import { env } from "../../env.mjs"
import "styles/tailwind.css"

export default function RootLayout({
  children,
  navbar,
  sidebar,
}: {
  children: ReactNode
  navbar: ReactNode
  sidebar: ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content={env.NEXT_PUBLIC_ADSENSE_CLIENT} />
      </head>
      <body>
        <SessionProvider>
          <main className="flex min-h-screen flex-col">
            <header className="w-full p-4 shadow">{navbar}</header>
            <main className="flex flex-1 flex-row shadow">
              <aside className="w-2/8 p-4 shadow">{sidebar}</aside>
              <section className="w-6/8 p-4">{children}</section>
            </main>
          </main>
        </SessionProvider>
      </body>
    </html>
  )
}
