import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/hooks/use-auth"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { statsigAdapter } from "@flags-sdk/statsig"
import { DynamicStatsigProvider } from "@/components/dynamic-statsig-provider"
import { ClerkProvider } from "@clerk/nextjs"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SoloBoss AI - Your Virtual AI Team",
  description: "Build, grow, and scale your business with your personal AI-powered team of experts.",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Initialize Statsig with fallback for build time
  let Statsig: any = null;
  let datafile: any = null;

  try {
    // Only initialize Statsig if we have proper environment setup
    if (process.env.NODE_ENV === 'production' || process.env.STATSIG_SERVER_SECRET_KEY) {
      Statsig = await statsigAdapter.initialize();
      datafile = await Statsig.getClientInitializeResponse({userID: "1234"}, {hash: "djb2"});
    }
  } catch (error) {
    console.warn('Statsig initialization failed, continuing without feature flags:', error);
  }

  // Check if Clerk environment variables are available
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Google Tag Manager */}
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
        {/* End Google Tag Manager */}
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5MKXFX2T"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {clerkPublishableKey ? (
            <ClerkProvider publishableKey={clerkPublishableKey}>
              <AuthProvider>
                <DynamicStatsigProvider datafile={datafile}>
                  {children}
                </DynamicStatsigProvider>
                <Toaster />
              </AuthProvider>
            </ClerkProvider>
          ) : (
            <AuthProvider>
              <DynamicStatsigProvider datafile={datafile}>
                {children}
              </DynamicStatsigProvider>
              <Toaster />
            </AuthProvider>
          )}
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
