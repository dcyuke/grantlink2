import type { Metadata } from "next"
import Script from "next/script"
import { Inter } from "next/font/google"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import "./globals.css"

const GA_MEASUREMENT_ID = "G-5QW521ZPX4"

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const SITE_URL = "https://grantlink.org"
const SITE_DESCRIPTION =
  "Discover grants, fellowships, prizes, and funding opportunities for nonprofits and social enterprises. Search available opportunities from foundations, corporations, and government agencies."

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "GrantLink - Find Funding for What Matters",
    template: "%s | GrantLink",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "grants",
    "grants for nonprofits",
    "funding opportunities",
    "nonprofit grants",
    "foundation grants",
    "fellowship",
    "social enterprise funding",
    "philanthropy",
    "government grants",
    "corporate giving",
    "grant search",
    "grant database",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "GrantLink",
    title: "GrantLink - Find Funding for What Matters",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "GrantLink - Find Funding for What Matters",
    description: SITE_DESCRIPTION,
  },
  alternates: {
    canonical: SITE_URL,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
