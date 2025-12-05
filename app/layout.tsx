import SessionProvider from "providers/SessionProvider"
import { env } from "../env.mjs"
import "styles/tailwind.css"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google AdSense site verification */}
        <meta name="google-adsense-account" content={env.NEXT_PUBLIC_ADSENSE_CLIENT} />
      </head>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
