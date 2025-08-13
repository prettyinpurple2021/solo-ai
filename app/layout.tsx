import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { AdSense } from "@/components/adsense"

export const dynamic = 'force-dynamic'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SoloBoss AI - Your Virtual AI Team",
  description: "Build, grow, and scale your business with your personal AI-powered team of experts.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <Script
        id="adsense-script"
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-9458819180463481'}`}
        crossOrigin="anonymous"
        strategy="beforeInteractive"
      />
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-5MKXFX2T');`,
        }}
      />
      <body className={`${inter.className} gradient-background animate-gradient`}>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5MKXFX2T"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="min-h-screen">
            <header className="w-full py-4">
              <div className="mx-auto max-w-7xl px-4">
                <div className="rounded-xl p-1 soloboss-gradient animate-gradient">
                  <div className="rounded-xl bg-background/70 backdrop-blur-md border-2 border-purple-200 px-4 py-3">
                    <h1 className="text-xl md:text-2xl font-bold boss-text-gradient">SoloBoss AI</h1>
                  </div>
                </div>
              </div>
            </header>
            <main className="mx-auto max-w-7xl px-4 py-6">
              {children}
            </main>
            <footer className="mx-auto max-w-7xl px-4 py-10">
              <div className="text-center text-sm text-muted-foreground">
                <span className="gradient-text-secondary font-semibold">Strong. Loud. Proud. Punk Rock Girl Boss.</span>
              </div>
            </footer>
          </div>
          <Toaster />
          <SonnerToaster richColors closeButton />
        </ThemeProvider>
        <AdSense clientId={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID} />
      </body>
    </html>
  )
}
