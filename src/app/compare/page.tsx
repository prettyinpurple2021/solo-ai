'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { CyberPageLayout } from '@/components/cyber/CyberPageLayout'
import { HudBorder } from '@/components/cyber/HudBorder'
import { BarChart3 } from 'lucide-react'

export default function CompareIndexPage() {
  const comparisons = [
    { title: 'SoloSuccess AI vs Generic All‑in‑One', href: '/compare/solosuccess-vs-generic' },
    { title: 'SoloSuccess AI vs Freelancer Tool Stack', href: '/compare/solosuccess-vs-freelancer-stack' },
  ]

  return (
    <CyberPageLayout>
      <div className="pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-cyber-cyan/30 bg-cyber-cyan/5 rounded-none mb-6">
              <BarChart3 className="w-4 h-4 text-cyber-cyan" />
              <span className="text-xs font-bold tracking-widest text-cyber-cyan uppercase">System Comparison</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-orbitron font-bold text-white mb-6">
              COMPARE <span className="text-cyber-cyan">SYSTEMS</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto font-mono">
              See how SoloSuccess AI compares and choose the best fit for your solo business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {comparisons.map((comparison) => (
              <Link key={comparison.href} href={comparison.href}>
                <HudBorder variant="hover" className="p-6 cursor-pointer">
                  <h3 className="font-orbitron text-xl text-white mb-3">{comparison.title}</h3>
                  <p className="text-sm text-gray-400 font-mono">
                    Feature breakdowns, pricing notes, and best‑fit recommendations.
                  </p>
                </HudBorder>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-400 font-mono">
              Or explore our <Link href="/pricing" className="text-cyber-cyan hover:text-neon-purple">pricing</Link> and{' '}
              <Link href="/features" className="text-cyber-cyan hover:text-neon-purple">features</Link> directly.
            </p>
          </div>
        </div>
      </div>
    </CyberPageLayout>
  )
}
