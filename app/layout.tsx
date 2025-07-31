import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/hooks/use-auth"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { statsigAdapter } from "@flags-sdk/statsig"
import { DynamicStatsigProvider } from "@/components/dynamic-statsig-provider"

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
  const Statsig = await statsigAdapter.initialize();
  const datafile = await Statsig.getClientInitializeResponse({userID: "1234"}, {hash: "djb2",});
  // minimal example, you'll want to customize your user object, likely using the flags SDK's identify function

  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <DynamicStatsigProvider datafile={datafile}>
              {children}
            </DynamicStatsigProvider>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
