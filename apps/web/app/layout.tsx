import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "@repo/ui/globals.css";
import { Providers } from "@/components/providers";
import { ADSENSE_CLIENT } from "@/lib/ads";
import { Analytics } from "@vercel/analytics/next";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: "StrangerChat — Talk to someone new",
    template: "%s · StrangerChat",
  },
  description:
    "Sign in with Google and get matched instantly with a random stranger for an anonymous one-on-one chat.",
  applicationName: "StrangerChat",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Shrink the layout (not just the visual viewport) when the mobile keyboard opens.
  interactiveWidget: "resizes-content",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#18171f" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {ADSENSE_CLIENT ? (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
        ) : null}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
