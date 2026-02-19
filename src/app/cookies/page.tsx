'use client'

export const dynamic = 'force-dynamic'

import { CyberPageLayout } from '@/components/cyber/CyberPageLayout'
import { HudBorder } from '@/components/cyber/HudBorder'
import { Cookie } from 'lucide-react'

export default function CookiePolicyPage() {
  return (
    <CyberPageLayout>
      <div className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-neon-purple/30 bg-neon-purple/5 rounded-none mb-6">
              <Cookie className="w-4 h-4 text-neon-purple" />
              <span className="text-xs font-bold tracking-widest text-neon-purple uppercase">Cookie Protocol</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-orbitron font-bold text-white mb-6">
              COOKIE <span className="text-neon-purple">POLICY</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto font-mono">
              Learn how we use cookies and similar technologies to enhance your experience.
            </p>
          </div>

          <div className="space-y-8">
            <HudBorder className="p-8">
              <h2 className="font-orbitron text-2xl text-white mb-4">WHAT_ARE_COOKIES</h2>
              <p className="text-gray-400 font-mono leading-relaxed">
                Cookies are small data files stored on your device that help us provide and improve our services. 
                They enable essential functionality and enhance user experience.
              </p>
            </HudBorder>

            <HudBorder className="p-8">
              <h2 className="font-orbitron text-2xl text-white mb-4">HOW_WE_USE_COOKIES</h2>
              <p className="text-gray-400 font-mono leading-relaxed">
                We use cookies for authentication, analytics, and personalization. 
                Essential cookies are required for the platform to function properly.
              </p>
            </HudBorder>

            <HudBorder className="p-8">
              <h2 className="font-orbitron text-2xl text-white mb-4">COOKIE_CONTROL</h2>
              <p className="text-gray-400 font-mono leading-relaxed">
                You can control cookie preferences through your browser settings. 
                Note that disabling certain cookies may affect platform functionality.
              </p>
            </HudBorder>
          </div>
        </div>
      </div>
    </CyberPageLayout>
  )
}
