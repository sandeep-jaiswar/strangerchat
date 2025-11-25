"use client"

import Script from "next/script"
import React, { useEffect, useRef } from "react"

type AdsenseBannerProps = {
  adClient: string
}

export const AdsenseBanner: React.FC<AdsenseBannerProps> = ({ adClient }) => {
  const initialized = useRef(false)

  useEffect(() => {
    if (typeof window === "undefined" || initialized.current) return
    const ins = document.querySelector(".adsbygoogle")
    // @ts-expect-error known issue
    if (window.adsbygoogle && ins) {
      try {
        // @ts-expect-error known issue
        window.adsbygoogle.push({})
        initialized.current = true
      } catch (e) {
        console.error("Adsense error:", e)
      }
    }
  }, [])

  return (
    <>
      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`}
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
