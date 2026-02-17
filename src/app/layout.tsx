import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import "./globals.css"

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "GrantLink - Find Funding for What Matters",
    template: "%s | GrantLink",
  },
  description:
    "Discover grants, fellowships, prizes, and funding opportunities for nonprofits and social enterprises. Search thousands of opportunities from foundations, corporations, and government agencies.",
  keywords: [
    "grants",
    "funding",
    "nonprofit",
    "foundation",
    "fellowship",
    "social enterprise",
    "philanthropy",
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
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
