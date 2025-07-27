import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SoloBoss AI - Build Your Empire With AI Squad Power",
  description:
    "Command your personal army of 8 specialized AI agents and transform into the legendary boss you were meant to be.",
  keywords: "AI, entrepreneurship, business automation, AI agents, solopreneur, business growth",
  authors: [{ name: "SoloBoss AI Team" }],
  creator: "SoloBoss AI",
  publisher: "SoloBoss AI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://soloboss-ai.vercel.app"),
  openGraph: {
    title: "SoloBoss AI - Build Your Empire With AI Squad Power",
    description:
      "Command your personal army of 8 specialized AI agents and transform into the legendary boss you were meant to be.",
    url: "https://soloboss-ai.vercel.app",
    siteName: "SoloBoss AI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SoloBoss AI - Build Your Empire With AI Squad Power",
    description:
      "Command your personal army of 8 specialized AI agents and transform into the legendary boss you were meant to be.",
    creator: "@solobossai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
