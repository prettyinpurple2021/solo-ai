import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Launch Plan — Free AI Co-founder for Solo Founders',
  description: 'Start free with AI Business Assistant, basic automation, and community access. Perfect for Solo Founders, Solopreneurs, and Individual Creators getting started.',
  alternates: {
    canonical: '/pricing/launch',
  },
  openGraph: {
    title: 'Launch Plan — Free AI Co-founder for Solo Founders',
    description: 'Start free with AI Business Assistant, basic automation, and community access. Perfect for Solo Founders, Solopreneurs, and Individual Creators getting started.',
    url: '/pricing/launch',
    siteName: 'SoloSuccess AI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Launch Plan — Free AI Co-founder for Solo Founders',
    description: 'Start free with AI Business Assistant, basic automation, and community access. Perfect for Solo Founders, Solopreneurs, and Individual Creators getting started.',
  },
}

export default function LaunchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
