import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dominator Plan — Unlimited AI Business Co-pilot for Empire Builders',
  description: 'Unlimited AI agents, custom workflows, and white-label options. For empire builders who demand unlimited power with AI Business Assistant and Workflow Automation AI.',
  alternates: {
    canonical: '/pricing/dominator',
  },
  openGraph: {
    title: 'Dominator Plan — Unlimited AI Business Co-pilot for Empire Builders',
    description: 'Unlimited AI agents, custom workflows, and white-label options. For empire builders who demand unlimited power with AI Business Assistant and Workflow Automation AI.',
    url: '/pricing/dominator',
    siteName: 'SoloSuccess AI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dominator Plan — Unlimited AI Business Co-pilot for Empire Builders',
    description: 'Unlimited AI agents, custom workflows, and white-label options. For empire builders who demand unlimited power with AI Business Assistant and Workflow Automation AI.',
  },
}

export default function DominatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
