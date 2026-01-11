'use client'

import Link from 'next/link'
import { SoloSuccessLogo } from './SoloSuccessLogo'

export function CyberFooter() {
  return (
    <footer className="border-t border-white/5 bg-black py-12 relative z-10 text-center">
      <div className="flex justify-center mb-6">
        <SoloSuccessLogo size={48} animated={false} variant="footer" />
      </div>
      <div className="font-tech text-gray-500 text-sm space-y-4">
        <p>
          SYSTEM STATUS: ONLINE <br />
          © 2025 SoloSuccess AI. All rights reserved.
        </p>
        <div className="flex justify-center gap-6 my-4 text-xs tracking-widest uppercase">
          <Link href="/privacy" className="hover:text-cyber-cyan transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-cyber-cyan transition-colors">Terms of Service</Link>
        </div>
        <p className="text-[10px] text-cyber-dim mt-2">
          ENCHANTED NIGHTMARE INDUSTRIES
        </p>
      </div>
    </footer>
  )
}

