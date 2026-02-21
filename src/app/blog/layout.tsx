// @ts-nocheck
import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import Script from 'next/script'


export default function BlogLayout({ children }: { children: ReactNode }) {
  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Boss Blog — SoloSuccess AI',
    url: 'https://solobossai.fun/blog',
    description:
      'Actionable playbooks for Business Automation, AI-powered Productivity, and growth systems for solo founders.',
    publisher: {
      '@type': 'Organization',
      name: 'SoloSuccess AI',
      url: 'https://solobossai.fun/',
    },
  }

  return (
    <>
      <Script id="ld-blog" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(blogSchema)}
      </Script>
      <Script id="ld-breadcrumbs-blog" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: 'https://solobossai.fun/'
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Blog',
              item: 'https://solobossai.fun/blog'
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
    ? 'Boss Blog — SoloSuccess AI: Solo Founder Playbooks'
    : 'Boss Blog — SoloSuccess AI'
  const localizedDescription = locale.startsWith('en')
    ? 'Guides on AI-powered Productivity, Business Automation, Workflow Automation AI, and Strategic Planning Tools for solo founders.'
    : 'Guides for solo founders and small businesses.'
  return {
    title: localizedTitle,
    description: localizedDescription,
    alternates: { canonical: 'https://solobossai.fun/blog' },
    openGraph: {
      title: localizedTitle,
      description: localizedDescription,
      url: 'https://solobossai.fun/blog',
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


