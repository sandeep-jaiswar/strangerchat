import Script from "next/script"
import React, { useEffect } from "react"

type AdsenseBannerProps = {
  adClient: string
}

export const AdsenseBanner: React.FC<AdsenseBannerProps> = ({ adClient }) => {
  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return
    // Wait for adsbygoogle script to be loaded
    const interval = setInterval(() => {
      const ins = document.querySelector(".adsbygoogle")
      // @ts-expect-error - window.adsbygoogle may not be defined yet
      if (window.adsbygoogle && ins) {
        try {
          // @ts-expect-error - window.adsbygoogle may not be defined yet
          window.adsbygoogle.push({})
          clearInterval(interval)
        } catch (e) {
          console.error("Adsense error:", e)
          clearInterval(interval)
        }
      }
    }, 300)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <Script
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
        strategy="afterInteractive"
        crossOrigin="anonymous"
      />
      <div style={{ textAlign: "center", margin: "16px 0" }}>
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={adClient}
          data-ad-format="auto"
          data-full-width-responsive="true"
        ></ins>
      </div>
    </>
  )
}
