'use client'

import { CyberPageLayout } from '@/components/cyber/CyberPageLayout'
import { HudBorder } from '@/components/cyber/HudBorder'
import { Scale, FileText } from 'lucide-react'

export default function TermsOfServicePage() {
  return (
    <CyberPageLayout>
      <div className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-neon-purple/30 bg-neon-purple/5 rounded-none mb-6">
              <Scale className="w-4 h-4 text-neon-purple" />
              <span className="text-xs font-bold tracking-widest text-neon-purple uppercase">Legal Framework</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-orbitron font-bold text-white mb-6">
              TERMS OF <span className="text-neon-purple">SERVICE</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto font-mono">
              The terms that govern your use of SoloSuccess AI.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-4 font-mono">
              <FileText className="w-4 h-4" />
              <span>Effective Date: January 2025</span>
            </div>
          </div>

          <div className="space-y-8">
            <HudBorder className="p-8">
              <h2 className="font-orbitron text-2xl text-white mb-4">ACCEPTANCE</h2>
              <p className="text-gray-400 font-mono leading-relaxed">
                By accessing and using SoloSuccess AI, you agree to be bound by these Terms of Service. 
                If you do not agree, please do not use our services.
              </p>
            </HudBorder>

            <HudBorder className="p-8">
              <h2 className="font-orbitron text-2xl text-white mb-4">SERVICE_DESCRIPTION</h2>
              <p className="text-gray-400 font-mono leading-relaxed">
                SoloSuccess AI provides AI-powered business automation and management tools. 
                We reserve the right to modify or discontinue services at any time.
              </p>
            </HudBorder>

            <HudBorder className="p-8">
              <h2 className="font-orbitron text-2xl text-white mb-4">USER_OBLIGATIONS</h2>
              <p className="text-gray-400 font-mono leading-relaxed">
                Users are responsible for maintaining the security of their accounts and for all activities 
                that occur under their account.
              </p>
            </HudBorder>
          </div>
        </div>
      </div>
    </CyberPageLayout>
  )
}
