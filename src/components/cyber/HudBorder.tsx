'use client'

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

export interface HudBorderProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'hover' | 'cyan' | 'purple' | 'magenta' | 'lime' | 'orange' | 'outline' | 'secondary'
  onClick?: () => void
}

export function HudBorder({ children, className, variant = 'default', onClick }: HudBorderProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative',
        'bg-dark-card/80',
        'backdrop-blur-md',
        'border border-neon-cyan/30',
        'transition-all duration-500',
        variant === 'hover' && 'hover:border-neon-cyan/60 hover:shadow-[0_0_20px_rgba(11,228,236,0.2)] hover:-translate-y-1',
        'clip-path-hud',
        className
      )}
      style={{
        clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)',
      }}
    >
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-neon-cyan shadow-[0_0_10px_rgba(11,228,236,0.5)]" />
      <div 
        className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-neon-cyan shadow-[0_0_10px_rgba(11,228,236,0.5)]"
        style={{ transform: 'translate(-5px, -5px)' }}
      />
      {/* HUD scanning line */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-cyan/5 to-transparent h-[2px] w-full animate-scanline pointer-events-none opacity-20" />
      {children}
    </div>
  )
}

