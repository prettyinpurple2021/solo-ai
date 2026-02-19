export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { CyberPageLayout } from '@/components/cyber/CyberPageLayout'
import { HudBorder } from '@/components/cyber/HudBorder'
import { CyberButton } from '@/components/cyber/CyberButton'
import { ArrowRight } from 'lucide-react'

export default function AboutPage() {
  return (
    <CyberPageLayout>
      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-neon-cyan/30 bg-neon-cyan/5 rounded-none mb-6">
              <span className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-ping"></span>
              <span className="text-xs font-bold tracking-widest text-neon-cyan uppercase">System Intelligence</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-orbitron font-bold text-white mb-6">
              ABOUT <span className="text-neon-cyan">SOLOSUCCESS</span>.AI
            </h1>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto font-tech">
              The ultimate platform for solo entrepreneurs who refuse to settle for mediocrity. 
              Built for the elite, designed for domination.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <HudBorder className="p-8">
              <h2 className="font-orbitron text-2xl text-white mb-4">OUR MISSION</h2>
              <p className="text-gray-400 font-tech leading-relaxed">
                To empower solo founders with autonomous AI agents that handle every aspect of business operations, 
                from strategy to execution, enabling them to scale without limits.
              </p>
            </HudBorder>

            <HudBorder className="p-8">
              <h2 className="font-orbitron text-2xl text-white mb-4">OUR VISION</h2>
              <p className="text-gray-400 font-tech leading-relaxed">
                A future where every solo entrepreneur has access to enterprise-grade AI infrastructure, 
                leveling the playing field and enabling unprecedented growth.
              </p>
            </HudBorder>
          </div>

          <div className="text-center">
            <Link href="/signup">
              <CyberButton variant="primary" size="lg">
                JOIN THE NETWORK
                <ArrowRight className="ml-2 w-5 h-5" />
              </CyberButton>
            </Link>
          </div>
        </div>
      </div>
    </CyberPageLayout>
  )
}
