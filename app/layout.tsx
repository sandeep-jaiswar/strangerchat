import "styles/tailwind.css"
import { env } from "../env.mjs"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google AdSense site verification */}
        <meta name="google-adsense-account" content={env.ADSENSE_CLIENT} />
        {/* Google AdSense script */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
          crossOrigin="anonymous"
        ></script>
        <script
          id="adsense-init"
          dangerouslySetInnerHTML={{
            __html: `
              (adsbygoogle = window.adsbygoogle || []).push({});
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
