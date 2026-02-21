import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Accelerator Plan — AI Business Co-pilot for Growing Founders',
  description: 'Scale with 5 AI agents, advanced automation, and team collaboration. Perfect for growing Solo Founders, Small Business Owners, and E-commerce Entrepreneurs.',
  alternates: {
    canonical: '/pricing/accelerator',
  },
  openGraph: {
    title: 'Accelerator Plan — AI Business Co-pilot for Growing Founders',
    description: 'Scale with 5 AI agents, advanced automation, and team collaboration. Perfect for growing Solo Founders, Small Business Owners, and E-commerce Entrepreneurs.',
    url: '/pricing/accelerator',
    siteName: 'SoloSuccess AI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Accelerator Plan — AI Business Co-pilot for Growing Founders',
    description: 'Scale with 5 AI agents, advanced automation, and team collaboration. Perfect for growing Solo Founders, Small Business Owners, and E-commerce Entrepreneurs.',
  },
}

export default function AcceleratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
