"use client"

import { useMemo } from 'react'
import { motion } from 'framer-motion'

interface DataPoint {
  label: string
  value: number
  isPrediction?: boolean
}

interface PredictiveChartProps {
  data: DataPoint[]
  height?: number
  color?: string
  label?: string
}

export function PredictiveChart({ data, height = 200, color = "#0be4ec", label }: PredictiveChartProps) {
  const max = useMemo(() => Math.max(...data.map(d => d.value), 1), [data])
  
  return (
    <div className="w-full space-y-4">
      {label && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-orbitron font-bold text-gray-500 uppercase tracking-widest">
            {label}
          </span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-neon-cyan opacity-50" />
              <span className="text-[8px] font-mono text-gray-500 uppercase">Actual</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 border border-dashed border-neon-cyan opacity-80" />
              <span className="text-[8px] font-mono text-gray-500 uppercase">Projected</span>
            </div>
          </div>
        </div>
      )}

      <div className="relative flex items-end gap-1 px-2" style={{ height: `${height}px` }}>
        {/* Y-Axis Guideline */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-full h-px bg-white" />
          ))}
        </div>

        {data.map((point, index) => {
          const barHeight = (point.value / max) * 100
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center group relative h-full justify-end">
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                <div className="bg-dark-card border border-neon-cyan/30 px-2 py-1 shadow-lg">
                  <p className="text-[10px] font-mono text-white whitespace-nowrap">
                    {point.label}: <span className="text-neon-cyan">${point.value.toLocaleString()}</span>
                  </p>
                  {point.isPrediction && (
                    <p className="text-[8px] font-mono text-neon-purple uppercase">AI Projection</p>
                  )}
                </div>
              </div>

              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${barHeight}%` }}
                transition={{ duration: 1, delay: index * 0.05, ease: "easeOut" }}
                className={`w-full relative transition-all duration-300 group-hover:brightness-125 ${
                  point.isPrediction 
                    ? 'border border-dashed border-neon-cyan/60 bg-neon-cyan/5' 
                    : 'bg-gradient-to-t from-neon-cyan/20 to-neon-cyan/60'
                }`}
              >
                {/* Glow Effect for Actuals */}
                {!point.isPrediction && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-neon-cyan shadow-[0_0_10px_#0be4ec]" />
                )}
                
                {/* Animation Pulse for Predictions */}
                {point.isPrediction && (
                  <motion.div 
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-neon-purple/10"
                  />
                )}
              </motion.div>
              
              <span className="text-[8px] font-mono text-gray-600 mt-2 rotate-45 origin-left whitespace-nowrap">
                {point.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
