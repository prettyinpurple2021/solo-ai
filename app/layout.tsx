import "./globals.css"
import type { ReactNode } from 'react'
import { Inter as, Orbitron, JetBrains_Mono } from "next/font/google"
import Script from 'next/script'
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { RecaptchaProvider } from "@/components/recaptcha/recaptcha-provider"
import { PerformanceMonitor } from "@/components/performance/performance-monitor"
import { ServiceWorkerRegister } from "@/components/performance/service-worker-register"
import ExitIntentSurvey from "@/components/marketing/exit-intent-survey"
import { AccessibilityProvider } from "@/components/ui/accessibility"
import { ChatProvider } from "@/components/providers/chat-provider"
import { SmartTipManager } from "@/components/ui/smart-tip"
import { FeedbackWidget } from "@/components/feedback/feedback-widget"
import { CssScriptCleanup } from "@/components/util/css-script-cleanup"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { OfflineProvider } from "@/components/providers/offline-provider"
import PWAInstallPrompt from "@/components/mobile/pwa-install-prompt"

// Font configuration - Cyberpunk Design System v3 fonts
const orbitronFont = Orbitron({ 
  subsets: ['latin'], 
  variable: '--font-orbitron',
  weight: ['400', '700', '900'],
  display: 'swap',
})

const jetbrainsMonoFont = JetBrains_Mono({ 
  subsets: ['latin'], 
  variable: '--font-mono',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

// Legacy font configuration - using runtime-loaded fonts via link tags
// These objects define CSS variables that map to font families in globals.css
const inter = { variable: '--font-inter', className: 'font-sans' }
const jetbrains = { variable: '--font-mono', className: 'font-mono' }
const orbitron = { variable: '--font-sci', className: 'font-sci' }
const rajdhani = { variable: '--font-tech', className: 'font-tech' }

export const metadata = {
  title: {
    default: 'SoloSuccess AI — AI Co-founder for Solo Founders',
    template: '%s | SoloSuccess AI'
  },
  description: 'AI Business Co-pilot and Virtual Team for Founders. Solopreneur Operating System with AI Business Assistant, Startup AI Platform, and Founder AI Tools to scale a one-person business.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SoloSuccess AI',
  },
  metadataBase: new URL('https://www.solosuccessai.fun'),
  alternates: {
    canonical: '/',
  },
  keywords: [
    'AI Co-founder',
    'AI Business Co-pilot',
    'Virtual Team for Founders',
    'Solopreneur Operating System',
    'AI Business Assistant',
    'Startup AI Platform',
    'Founder AI Tools',
    'One-Person Business Software',
    'Solo Founder',
    'Solopreneur',
    'Freelancer Tools',
    'Individual Creator',
    'Bootstrapped Founder',
    'E-commerce Entrepreneur',
    'Small Business Owner',
    'Consultant Software',
    'Founder Burnout',
    'Reduce Context Switching',
    'Overcome Decision Fatigue',
    'Scale a Solo Business',
    'Business Automation',
    'Strategic Planning Tools',
    'Streamline Operations',
    'How to Grow a Business Alone',
    'AI Marketing Assistant',
    'AI Sales Strategist',
    'Automated Content Creation',
    'AI for Social Media',
    'Business Intelligence Tools',
    'Workflow Automation AI',
    'AI Executive Assistant',
    'AI-powered Productivity',
  ],
  openGraph: {
    title: 'SoloSuccess AI — AI Co-founder for Solo Founders',
    description: 'Virtual Team for Founders. AI Business Co-pilot and Solopreneur OS to automate workflows, streamline operations, and scale a solo business.',
    type: 'website',
    url: 'https://www.solosuccessai.fun',
    siteName: 'SoloSuccess AI',
    images: [
      {
        url: '/images/soloboss-hero-silhouette.jpg',
        width: 1200,
        height: 630,
        alt: 'SoloSuccess AI - AI Co-founder Platform',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SoloSuccess AI — Founder AI Tools',
    description: 'AI Business Assistant, Workflow Automation AI, and AI-powered Productivity for solo founders.',
    images: ['/images/soloboss-hero-silhouette.jpg'],
    creator: '@solosuccessai',
    site: '@solosuccessai',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 0.5,
  userScalable: true,
  themeColor: '#6366f1',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  // Keep behavior aligned with ExitIntentSurvey (default on; disable when explicitly "true")
  const exitIntentDisabled = process.env.NEXT_PUBLIC_DISABLE_EXIT_INTENT === 'true'

  // GA4 is injected manually; no env var needed
  const appShell = (
    <ThemeProvider>
      <AuthProvider>
        <RecaptchaProvider>
          <OfflineProvider>
            <AccessibilityProvider>
              <ChatProvider>
                {children}
              </ChatProvider>
              <PerformanceMonitor />
              <ServiceWorkerRegister />
              <PWAInstallPrompt />
              {!exitIntentDisabled && <ExitIntentSurvey />}
              <SmartTipManager />
              <FeedbackWidget />
              <CssScriptCleanup />
            </AccessibilityProvider>
          </OfflineProvider>
        </RecaptchaProvider>
      </AuthProvider>
    </ThemeProvider>
  )

  return (
    <html lang="en" suppressHydrationWarning className={`${orbitronFont.variable} ${jetbrainsMonoFont.variable} ${inter.variable} ${jetbrains.variable} ${orbitron.variable} ${rajdhani.variable}`}>
      <head>
        <Script
          id="strip-css-scripts"
          strategy="beforeInteractive"
        >{`
          (function() {
            try {
              // Suppress React DevTools errors in production
              if (typeof window !== 'undefined' && window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
                const originalOn = window.__REACT_DEVTOOLS_GLOBAL_HOOK__.on;
                if (typeof originalOn !== 'function') {
                  window.__REACT_DEVTOOLS_GLOBAL_HOOK__.on = function() {
                    // Suppress error silently
                    return function() {};
                  };
                }
              }

              // Suppress specific extension errors without blocking others
              if (typeof window !== 'undefined' && window.addEventListener) {
                const originalErrorHandler = window.onerror;
                window.onerror = function(message, source, lineno, colno, error) {
                  const msg = String(message);
                  const src = String(source || '');
                  
                  // Known browser extension and third-party noise
                  const isIgnorable = 
                    (msg.includes('backendManager') || src.includes('backendManager')) ||
                    (msg.includes('appendChild') && src.includes('framework')) || 
                    (msg.includes('__REACT_DEVTOOLS_GLOBAL_HOOK__')) ||
                    (src.includes('chrome-extension://')) ||
                    (src.includes('moz-extension://')) ||
                    (msg.includes('ResizeObserver loop'));

                  if (isIgnorable) {
                    return true;
                  }

                  if (originalErrorHandler) {
                    return originalErrorHandler.call(this, message, source, lineno, colno, error);
                  }
                  return false;
                };

                // Suppress unhandled promise rejections from extensions
                window.addEventListener('unhandledrejection', function(event) {
                  const reason = event.reason?.message || String(event.reason || '');
                  if (
                    reason.includes('backendManager') || 
                    reason.includes('Extension context invalidated') ||
                    reason.includes('disconnected port')
                  ) {
                    event.preventDefault();
                  }
                });
              }
            } catch (err) {
              // no-op
            }
          })();
        `}</Script>
        {/* Optimize font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href={`https://fonts.googleapis.com/css2?` +
                `family=Inter:wght@300;400;500;600;700;800;900&` +
                `family=JetBrains+Mono:wght@400;500;600;700&` +
                `family=Orbitron:wght@400;500;600;700;800;900&` +
                `family=Rajdhani:wght@300;400;500;600;700&` +
                `display=swap`}
          rel="stylesheet"
        />
        
        {/* Search engine verification placeholders */}
        <meta name="google-site-verification" content="CHANGE_ME" />
        <meta name="msvalidate.01" content="CHANGE_ME" />
        {/* Analytics scripts moved to afterInteractive to prevent chunk loading issues */}
        {/* Move canonical & prefetch links into head to avoid incorrect tag handling */}
        <link rel="canonical" href="https://www.solosuccessai.fun/" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-dark-bg text-white font-mono antialiased",
          orbitronFont.variable,
          jetbrainsMonoFont.variable,
          inter.variable,
          jetbrains.variable,
          orbitron.variable,
          rajdhani.variable
        )}
      >
        {/* Structured Data */}
        <Script
          id="ld-org"
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'SoloSuccess AI',
            url: 'https://www.solosuccessai.fun/',
            logo: 'https://www.solosuccessai.fun/images/logo.png',
            sameAs: [
              'https://twitter.com/solosuccessai',
              'https://www.linkedin.com/company/solosuccessai'
            ]
          })}
        </Script>

        {/* Analytics Scripts - Load after page is interactive */}
        <Script
          id="ga4-gtag-src"
          src="https://www.googletagmanager.com/gtag/js?id=G-W174T4ZFNF"
          strategy="afterInteractive"
        />
        <Script
          id="ga4-gtag-init"
          strategy="afterInteractive"
        >
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);} 
            gtag('js', new Date());
            gtag('config', 'G-W174T4ZFNF');
          `}
        </Script>
        <Script
          id="chatbase-widget-loader"
          strategy="afterInteractive"
        >
          {`
            (function () {
              if (!window.chatbase || window.chatbase("getState") !== "initialized") {
                window.chatbase = (...args) => {
                  if (!window.chatbase.q) {
                    window.chatbase.q = [];
                  }
                  window.chatbase.q.push(args);
                };
                window.chatbase = new Proxy(window.chatbase, {
                  get(target, prop) {
                    if (prop === "q") {
                      return target.q;
                    }
                    return (...proxyArgs) => target(prop, ...proxyArgs);
                  },
                });
              }
              const onLoad = function () {
                const script = document.createElement("script");
                script.src = "https://www.chatbase.co/embed.min.js";
                script.id = "8-mWFi8v0Y7sa4YG0EdmV";
                script.domain = "www.chatbase.co";
                document.body.appendChild(script);
              };
              if (document.readyState === "complete") {
                onLoad();
              } else {
                window.addEventListener("load", onLoad);
              }
            })();
          `}
        </Script>
        {appShell}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}