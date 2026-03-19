import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import Script from 'next/script'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://solosuccessai.fun'

export default function PricingLayout({ children }: { children: ReactNode }) {
  const products = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: [
      {
        '@type': 'Product',
        name: 'Launch',
        description: 'Free plan for getting started with AI-powered Productivity.',
        brand: { '@type': 'Brand', name: 'SoloSuccess AI' },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          url: `${BASE_URL}/signup`,
          availability: 'https://schema.org/InStock',
        },
      },
      {
        '@type': 'Product',
        name: 'Accelerator',
        description: 'Growth plan with Workflow Automation AI and Founder AI Tools.',
        brand: { '@type': 'Brand', name: 'SoloSuccess AI' },
        offers: {
          '@type': 'Offer',
          price: '19',
          priceCurrency: 'USD',
          url: `${BASE_URL}/signup`,
          availability: 'https://schema.org/InStock',
        },
      },
      {
        '@type': 'Product',
        name: 'Dominator',
        description: 'Advanced plan with AI Business Co-pilot and full automation suite.',
        brand: { '@type': 'Brand', name: 'SoloSuccess AI' },
        offers: {
          '@type': 'Offer',
          price: '29',
          priceCurrency: 'USD',
          url: `${BASE_URL}/contact`,
          availability: 'https://schema.org/InStock',
        },
      },
    ],
  }

  return (
    <>
      <Script id="ld-products" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(products)}
      </Script>
      <Script id="ld-breadcrumbs-pricing" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: `${BASE_URL}/`
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Pricing',
              item: `${BASE_URL}/pricing`
            }
          ]
        })}
      </Script>
      {children}
    </>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers()
  const acceptLang = h.get('accept-language') || 'en'
  const locale = acceptLang.split(',')[0]?.toLowerCase() || 'en'
  const localizedTitle = locale.startsWith('en')
    ? 'Pricing — SoloSuccess AI: AI Co-founder Plans'
    : 'Pricing — SoloSuccess AI'
  const localizedDescription = locale.startsWith('en')
    ? 'Plans for Solo Founder, Solopreneur, Consultant, and Small Business Owner with AI Business Co-pilot, Founder AI Tools, and Workflow Automation AI.'
    : 'Plans for solo founders and small businesses.'
  return {
    title: localizedTitle,
    description: localizedDescription,
    alternates: { canonical: `${BASE_URL}/pricing` },
    openGraph: {
      title: localizedTitle,
      description: localizedDescription,
      url: `${BASE_URL}/pricing`,
      type: 'website',
      siteName: 'SoloSuccess AI',
    },
    twitter: {
      card: 'summary_large_image',
      title: localizedTitle,
      description: localizedDescription,
    },
  }
}


