'use client'

import, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { NeuralNetworkCanvas } from '@/components/cyber/NeuralNetworkCanvas'
import { Server, Brain,} from 'lucide-react'

import { 
  FeaturesSection, 
  AgentsSection, 
  PricingSection, 
  FAQSection,
  CyberFooter
} from '@/components/home/landing-sections'
import { InlineSSLogo } from '@/components/cyber/InlineSSLogo'

// --- Types & Interfaces ---
interface HudMetricProps {
  label: string
  value: string
  status: 'active' | 'stabilizing' | 'offline'
  pcolor: string
}

// --- Components ---

const HudMetric = ({ label, value, status, pcolor }: HudMetricProps) => (
  <div className="space-y-1 font-mono text-xs tracking-wider">
    <div className="flex justify-between items-end text-gray-400">
      <span>{label}</span>
      <span className={status === 'active' ? 'text-neon-cyan' : 'text-neon-purple'}>
        {value}
      </span>
    </div>
    <div className="h-1 w-full bg-dark-card relative overflow-hidden">
      <div 
        className={`absolute top-0 left-0 h-full ${pcolor === 'cyan' ? 'bg-neon-cyan' : 'bg-neon-purple'}`} 
        style={{ width: status === 'active' ? '100%' : '60%' }}
      >
        {status === 'stabilizing' && (
          <div className="absolute inset-0 bg-white/30 animate-[shimmer_1s_infinite]" />
        )}
      </div>
    </div>
  </div>
)

const BracketCorner = ({ position }: { position: string }) => {
  const styles = {
    'tl': 'top-0 left-0 border-t-2 border-l-2',
    'tr': 'top-0 right-0 border-t-2 border-r-2',
    'bl': 'bottom-0 left-0 border-b-2 border-l-2',
    'br': 'bottom-0 right-0 border-b-2 border-r-2',
  }
  return (
    <div className={`absolute w-3 h-3 border-neon-cyan ${styles[position as keyof typeof styles]}`} />
  )
}

// --- Navbar Component ---
const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/80 backdrop-blur-md border-b border-gray-700">
    <div className="max-w-[1240px] mx-auto px-6 h-20 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <InlineSSLogo size={32} animated={true} />
        <span className="font-orbitron font-bold text-xl tracking-widest text-white">
          SOLO<span className="text-neon-cyan">SUCCESS</span>.AI
        </span>
      </div>
      
      <div className="hidden md:flex items-center gap-8">
        <Link href="#features" className="text-sm font-mono tracking-widest text-gray-400 hover:text-neon-cyan transition-colors uppercase">
          Features
        </Link>
        <Link href="#agents" className="text-sm font-mono tracking-widest text-gray-400 hover:text-neon-cyan transition-colors uppercase">
          AI Squad
        </Link>
        <Link href="#pricing" className="text-sm font-mono tracking-widest text-gray-400 hover:text-neon-cyan transition-colors uppercase">
          Pricing
        </Link>
        <Link href="/contact" className="text-sm font-mono tracking-widest text-gray-400 hover:text-neon-cyan transition-colors uppercase">
          Contact
        </Link>
        <Link href="/login">
          <button className="px-6 py-2 border-2 border-neon-cyan/50 text-neon-cyan font-mono font-bold uppercase tracking-widest hover:bg-neon-cyan/10 hover:border-neon-cyan transition-all rounded-sm">
            Sign In
          </button>
        </Link>
      </div>
    </div>
  </nav>
)

export default function HomePage() {
  const [, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <main className="min-h-screen bg-dark-bg relative overflow-hidden flex flex-col selection:bg-neon-cyan selection:text-black">
      {/* 1. Global Background Effects */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none fixed">
        <NeuralNetworkCanvas particleCount={60} connectionDistance={150} mouseDistance={200} />
      </div>
      
      {/* Scanline Effect */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20 fixed" />

      {/* Navbar */}
      <Navbar />

      {/* Main Content Container */}
      <div className="relative z-10 w-full pt-32 pb-20">
        
        {/* --- HERO SECTION --- */}
        <div className="max-w-[1240px] px-6 lg:px-8 mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-0 min-h-[calc(100vh-140px)] mb-20">
          
          {/* --- LEFT COLUMN: CONTENT (Text/Headline) --- */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full lg:w-[48%] space-y-8 text-center lg:text-left relative z-20"
          >
            {/* Headline */}
            <div className="space-y-4">
              <div className="inline-block px-3 py-1 mb-2 border border-neon-cyan/30 bg-neon-cyan/10 rounded-sm">
                <span className="font-mono text-[10px] text-neon-cyan tracking-[0.2em] uppercase flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-pulse" />
                  Intelligence Network Active
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-orbitron tracking-tight leading-[1.1] text-white uppercase tracking-wider glitch-text" data-text="YOUR AI CO-FOUNDER">
                YOUR AI <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple animate-pulse">
                  CO-FOUNDER
                </span>
              </h1>
            </div>

            {/* Subtext */}
            <p className="text-gray-300 text-lg md:text-xl max-w-[550px] mx-auto lg:mx-0 leading-relaxed font-mono">
              Build your intelligent business ecosystem. Scale your operations with a network of specialized AI agents working 24/7.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
              <Link href="/register">
                <button className="group relative px-8 py-4 bg-transparent border-2 border-neon-cyan text-neon-cyan font-mono font-bold tracking-widest uppercase text-sm transition-all hover:bg-neon-cyan/10 hover:shadow-[0_0_20px_rgba(11,228,236,0.4)] rounded-sm">
                  <span className="relative z-10">Get Started</span>
                </button>
              </Link>
              
              <Link href="#features">
                <button className="group px-8 py-4 bg-transparent text-white font-mono font-bold tracking-widest uppercase text-sm border-2 border-transparent hover:border-gray-700 transition-all opacity-70 hover:opacity-100 rounded-sm">
                  Learn More
                </button>
              </Link>
            </div>

            {/* Stats Row */}
            <div className="flex flex-row justify-center lg:justify-start gap-12 border-t border-white/5 pt-8 mt-2">
              {[
                { label: 'Active Nodes', value: '10K+' },
                { label: 'Uptime', value: '99.9%' },
                { label: 'Tasks', value: '500K+' },
              ].map((stat, i) => (
                <div key={i} className="text-center lg:text-left">
                  <div className="text-2xl font-mono text-white mb-1">{stat.value}</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* --- RIGHT COLUMN: HUD VISUAL --- */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-lg lg:max-w-full lg:w-[45%] relative z-10"
          >
            {/* HUD Container */}
            <div className="relative bg-dark-bg/90 border border-neon-cyan/50 p-6 md:p-8 backdrop-blur-md shadow-[0_0_40px_rgba(11,228,236,0.1)] group hover:border-neon-cyan transition-colors duration-500">
              
              {/* Corner Accents */}
              <BracketCorner position="tl" />
              <BracketCorner position="tr" />
              <BracketCorner position="bl" />
              <BracketCorner position="br" />

              {/* Header */}
              <div className="flex justify-between items-center mb-8 border-b border-neon-cyan/30 pb-4">
                <div className="font-mono text-xs text-neon-cyan tracking-[0.2em] flex items-center gap-2">
                  <Server size={14} />
                  <span>HUB_01</span>
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-neon-cyan/30 rounded-full" />
                  <div className="w-2 h-2 bg-neon-cyan/30 rounded-full" />
                </div>
              </div>

              {/* Main Visual Content */}
              <div className="space-y-8">
                <div className="text-center py-4 relative">
                   <div className="absolute inset-0 flex items-center justify-center opacity-10">
                      <Brain size={120} className="text-neon-purple animate-pulse" />
                   </div>
                   <h3 className="relative z-10 font-mono text-sm text-gray-400 mb-2 tracking-widest uppercase">
                     Current Objective
                   </h3>
                   <p className="relative z-10 font-orbitron text-3xl text-white font-bold tracking-wider drop-shadow-[0_0_10px_rgba(179,0,255,0.5)] uppercase">
                     MARKET_INTELLIGENCE
                   </p>
                </div>

                {/* Progress Bars */}
                <div className="space-y-6">
                  <HudMetric 
                    label="ACTIVE AGENTS" 
                    value="8/8 ONLINE" 
                    status="active" 
                    pcolor="cyan" 
                  />
                  <HudMetric 
                    label="SYSTEM SYNC" 
                    value="OPTIMIZING..." 
                    status="stabilizing" 
                    pcolor="purple" 
                  />
                </div>

                {/* Terminal Log Output */}
                <div className="mt-6 p-4 bg-dark-card border border-gray-700 font-mono text-[10px] text-gray-400 rounded-sm h-32 overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-dark-bg/90 pointer-events-none" />
                  <div className="space-y-2 opacity-80">
                    <p><span className="text-neon-cyan">{'>'}</span> Initializing intelligence modules...</p>
                    <p><span className="text-neon-cyan">{'>'}</span> Loading business data streams...</p>
                    <p><span className="text-neon-cyan">{'>'}</span> Optimizing agent networks...</p>
                    <p><span className="text-neon-purple">{'>'}</span> Connection established.</p>
                    <p className="animate-pulse"><span className="text-neon-cyan">{'>'}</span> Ready for input_</p>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </div>

        {/* --- APPENDED SECTIONS --- */}
        <FeaturesSection />
        <AgentsSection />
        <PricingSection />
        <FAQSection />

      </div>
      
      <CyberFooter />
    </main>
  )
}