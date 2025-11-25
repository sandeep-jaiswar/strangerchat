import "styles/tailwind.css"
import SessionProvider from "providers/SessionProvider"
import { env } from "../env.mjs"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google AdSense site verification */}
        <meta name="google-adsense-account" content={env.ADSENSE_CLIENT} />
      </head>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
