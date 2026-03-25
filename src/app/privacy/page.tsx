'use client'

import { CyberPageLayout } from '@/components/cyber/CyberPageLayout'
import { HudBorder } from '@/components/cyber/HudBorder'
import { Shield,} from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <CyberPageLayout>
      <div className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-neon-cyan/30 bg-neon-cyan/5 rounded-none mb-6">
              <Shield className="w-4 h-4 text-neon-cyan" />
              <span className="text-xs font-bold tracking-widest text-neon-cyan uppercase">Security Protocol</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-orbitron font-bold text-white mb-6">
              PRIVACY <span className="text-neon-cyan">POLICY</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto font-tech">
              Your data security is our top priority. Learn how we protect your information.
            </p>
          </div>

          <div className="space-y-8">
            <HudBorder className="p-8">
              <h2 className="font-orbitron text-2xl text-white mb-4">DATA_COLLECTION</h2>
              <p className="text-gray-400 font-tech leading-relaxed">
                We collect only the information necessary to provide and improve our services. 
                This includes account information, usage data, and communication preferences.
              </p>
            </HudBorder>

            <HudBorder className="p-8">
              <h2 className="font-orbitron text-2xl text-white mb-4">DATA_SECURITY</h2>
              <p className="text-gray-400 font-tech leading-relaxed">
                All data is encrypted using quantum-grade encryption protocols. 
                We implement industry-standard security measures to protect your information.
              </p>
            </HudBorder>

            <HudBorder className="p-8">
              <h2 className="font-orbitron text-2xl text-white mb-4">YOUR_RIGHTS</h2>
              <p className="text-gray-400 font-tech leading-relaxed">
                You have the right to access, modify, or delete your personal data at any time. 
                Contact our support team to exercise these rights.
              </p>
            </HudBorder>
          </div>
        </div>
      </div>
    </CyberPageLayout>
  )
}
