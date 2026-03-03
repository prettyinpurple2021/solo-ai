"use client"

import { motion } from 'framer-motion'
import { Shield, AlertTriangle, Target } from 'lucide-react'

interface Threat {
  id: string
  name: string
  distance: number // 0 to 100
  angle: number // 0 to 360
  severity: 'low' | 'medium' | 'high' | 'critical'
}

interface IntelligenceRadarProps {
  threats?: Threat[]
}

export function IntelligenceRadar({ threats = [] }: IntelligenceRadarProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      default: return 'bg-neon-cyan'
    }
  }

  return (
    <div className="relative w-full aspect-square max-w-[300px] mx-auto flex items-center justify-center bg-black/40 border border-white/5 overflow-hidden">
      {/* Background Circles */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[80%] h-[80%] border border-white/5 rounded-full" />
        <div className="w-[60%] h-[60%] border border-white/5 rounded-full" />
        <div className="w-[40%] h-[40%] border border-white/5 rounded-full" />
        <div className="w-[20%] h-[20%] border border-white/5 rounded-full" />
        
        {/* Crosshair Lines */}
        <div className="absolute w-full h-px bg-white/5" />
        <div className="absolute h-full w-px bg-white/5" />
      </div>

      {/* Scanning Sweep */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 w-full h-full bg-gradient-to-tr from-neon-cyan/20 to-transparent origin-center"
        style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 50%)' }}
      />

      {/* Center Point */}
      <div className="relative z-10 w-3 h-3 bg-neon-cyan shadow-[0_0_15px_#0be4ec] transform rotate-45" />

      {/* Threat Markers */}
      {threats.map((threat) => {
        const x = 50 + (threat.distance / 2) * Math.cos((threat.angle * Math.PI) / 180)
        const y = 50 + (threat.distance / 2) * Math.sin((threat.angle * Math.PI) / 180)

        return (
          <motion.div
            key={threat.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute group cursor-help"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <div className={`w-2 h-2 rounded-full ${getSeverityColor(threat.severity)} shadow-[0_0_10px_currentColor] animate-pulse`} />
            
            {/* Tooltip */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
              <div className="bg-dark-card border border-white/10 px-2 py-1 whitespace-nowrap">
                <p className="text-[10px] font-orbitron text-white uppercase">{threat.name}</p>
                <p className="text-[8px] font-mono text-gray-400">SEVERITY: {threat.severity.toUpperCase()}</p>
              </div>
            </div>
          </motion.div>
        )
      })}

      {/* HUD Info */}
      <div className="absolute top-2 left-2 flex flex-col gap-1">
        <div className="flex items-center gap-1 text-[8px] font-mono text-neon-cyan">
          <Target className="w-2 h-2" />
          <span>RADAR_ACTIVE</span>
        </div>
        <div className="text-[8px] font-mono text-gray-500">
          SCAN_FREQ: 2.4GHz
        </div>
      </div>

      <div className="absolute bottom-2 right-2 flex items-center gap-1 text-[8px] font-mono text-red-500">
        <AlertTriangle className="w-2 h-2" />
        <span>{threats.length} THREATS_DETECTED</span>
      </div>
    </div>
  )
}
