'use client';

import Link from "next/link"
import { ArrowLeft, Home, LayoutDashboard } from "lucide-react"
import { CyberPageLayout } from "@/components/cyber/CyberPageLayout"
import { CyberButton } from "@/components/cyber/CyberButton"
import { HudBorder } from "@/components/cyber/HudBorder"
import { GlitchText } from "@/components/cyber/GlitchText"

export default function NotFound() {
  return (
    <CyberPageLayout showNav={true} showFooter={true}>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl text-center z-10">
          
          {/* 404 Glitch Header */}
          <div className="mb-8 relative">
            <h1 className="text-9xl font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-white to-neon-magenta mb-2 select-none">
              <GlitchText>404</GlitchText>
            </h1>
            <div className="text-2xl font-bold font-orbitron text-neon-cyan tracking-[0.5em] uppercase animate-pulse">
              System Error // Page Not Found
            </div>
          </div>

          <p className="text-gray-400 font-mono mb-12 max-w-lg mx-auto border-l-2 border-neon-cyan/30 pl-4 py-2 text-left">
            <span className="text-neon-cyan">root@solosuccess:~$</span> The requested resource could not be located in the neural network. Signal lost.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/">
              <CyberButton variant="cyan" size="lg" className="w-full sm:w-auto">
                <Home className="mr-2 h-4 w-4" />
                Return to Base
              </CyberButton>
            </Link>
            
            <Link href="/dashboard">
              <CyberButton variant="ghost" size="lg" className="w-full sm:w-auto">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Access Dashboard
              </CyberButton>
            </Link>
          </div>

          {/* Smart Links Grid */}
          <div className="text-left max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-2 w-2 bg-neon-magenta rounded-full animate-ping" />
              <h3 className="text-sm font-bold font-orbitron text-gray-400 uppercase tracking-widest">
                Alternate Routes found:
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/pricing" className="group">
                <HudBorder variant="purple" className="h-full p-6 group-hover:bg-neon-purple/5 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold font-orbitron text-neon-purple text-lg group-hover:text-white transition-colors">
                      Pricing Protocols
                    </div>
                    <div className="text-xs font-mono text-neon-purple/60 border border-neon-purple/30 px-2 py-0.5 rounded">
                      Commercial
                    </div>
                  </div>
                  <div className="text-sm text-gray-400 font-mono">
                    Access upgraded system capabilities and AI reinforcements.
                  </div>
                </HudBorder>
              </Link>

              <Link href="/features" className="group">
                <HudBorder variant="cyan" className="h-full p-6 group-hover:bg-neon-cyan/5 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold font-orbitron text-neon-cyan text-lg group-hover:text-white transition-colors">
                      System Features
                    </div>
                    <div className="text-xs font-mono text-neon-cyan/60 border border-neon-cyan/30 px-2 py-0.5 rounded">
                      Modules
                    </div>
                  </div>
                  <div className="text-sm text-gray-400 font-mono">
                    Explore available AI agents and automation tools.
                  </div>
                </HudBorder>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </CyberPageLayout>
  )
}
