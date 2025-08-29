import "./globals.css"
import { Inter as FontSans } from "next/font/google"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { StackAuthProvider } from "@/components/auth/stack-provider"
import { RecaptchaProvider } from "@/components/recaptcha/recaptcha-provider"
import { PerformanceMonitor } from "@/components/performance/performance-monitor"
import { ServiceWorkerRegister } from "@/components/performance/service-worker-register"
import { AccessibilityProvider } from "@/components/ui/accessibility"
import { ErrorBoundary } from "@/components/ui/error-handler"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata = {
  title: 'SoloBoss AI',
  description: 'SoloBoss AI Platform',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SoloBoss AI',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#6366f1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <StackAuthProvider>
            <RecaptchaProvider>
              <AccessibilityProvider>
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
                <PerformanceMonitor />
                <ServiceWorkerRegister />
              </AccessibilityProvider>
            </RecaptchaProvider>
          </StackAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
