"use client"

import React, { useEffect, useRef } from "react"

type AdsenseBannerProps = {
  adClient: string
}

export const AdsenseBanner: React.FC<AdsenseBannerProps> = ({ adClient }) => {
  const initialized = useRef(false)
  const scriptLoaded = useRef(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    // Load AdSense script manually to avoid Next.js Script component warning
    if (!scriptLoaded.current) {
      const script = document.createElement("script")
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`
      script.async = true
      script.crossOrigin = "anonymous"
      document.head.appendChild(script)
      scriptLoaded.current = true
    }

    // Initialize ad after script loads
    const initAd = () => {
      if (initialized.current) return
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
    }

    // Wait a bit for script to load
    const timer = setTimeout(initAd, 1000)
    return () => clearTimeout(timer)
  }, [adClient])

  return (
    <div style={{ textAlign: "center", margin: "16px 0" }}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={adClient}
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  )
}
