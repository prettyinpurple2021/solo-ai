'use client'


import { cn } from '@/lib/utils'

interface ProgressBarProps {
  progress?: number
  variant?: 'cyan' | 'magenta' | 'lime' | 'purple' | 'orange'
  animated?: boolean
  label?: boolean
  className?: string
}

export const ProgressBar = ({ 
  progress = 0,
  variant = 'cyan',
  animated = true,
  label = false,
  className = ''
}: ProgressBarProps) => {
  // Theme not available during static generation - use defaults
  const theme = undefined
  
  const colorClasses = {
    cyan: 'bg-gradient-to-r from-neon-cyan to-cyan-500 shadow-[0_0_20px_rgba(11,228,236,0.6)]',
    magenta: 'bg-gradient-to-r from-neon-magenta to-pink-600 shadow-[0_0_20px_rgba(255,0,110,0.6)]',
    lime: 'bg-gradient-to-r from-neon-lime to-green-500 shadow-[0_0_20px_rgba(57,255,20,0.6)]',
    purple: 'bg-gradient-to-r from-neon-purple to-purple-700 shadow-[0_0_20px_rgba(179,0,255,0.6)]',
    orange: 'bg-gradient-to-r from-neon-orange to-orange-600 shadow-[0_0_20px_rgba(255,102,0,0.6)]',
  }
  
  const textColorClasses = {
    cyan: 'text-neon-cyan',
    magenta: 'text-neon-magenta',
    lime: 'text-neon-lime',
    purple: 'text-neon-purple',
    orange: 'text-neon-orange',
  }
  
  return (
    <div className={cn('w-full', className)}>
      <div className={cn(
        'border-2 border-gray-700 bg-dark-card',
        theme === 'aggressive' ? 'rounded-none' : 'rounded-sm',
        'overflow-hidden h-2'
      )}>
        <div
          className={cn(
            'h-full',
            colorClasses[variant],
            'transition-all duration-300 ease-out',
            animated && 'animate-progress-pulse'
          )}
          style={{ width: `${Math.min(progress, 100)}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {label && (
        <div className={cn(textColorClasses[variant], 'text-sm font-mono mt-2 text-right')}>
          {progress}%
        </div>
      )}
    </div>
  )
}
