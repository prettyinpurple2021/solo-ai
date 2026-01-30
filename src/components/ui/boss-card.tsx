"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Crown, Sparkles } from "lucide-react"

/**
 * BossCard component following Cyberpunk Design System v3
 * Uses neon colors, dark backgrounds, and glow effects
 */
interface BossCardProps {
  children: ReactNode
  variant?: "default" | "cyan" | "lime" | "orange" | "magenta" | "purple" | "empowerment" | "accent" | "secondary" | "destructive" | "ghost" | "outline"
  size?: "sm" | "md" | "lg"
  shimmer?: boolean
  glow?: boolean
  crown?: boolean
  className?: string
  onClick?: () => void
  interactive?: boolean
  fullWidth?: boolean
  header?: ReactNode
  footer?: ReactNode
}

export function BossCard({
  children,
  variant = "default",
  size = "md",
  shimmer = true,
  glow = true,
  crown = false,
  className = "",
  onClick,
  interactive = false,
  fullWidth = false,
  header,
  footer
}: BossCardProps) {
  const baseClasses = "relative overflow-hidden rounded-sm transition-all duration-300 bg-dark-card"
  
  const sizeClasses = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8"
  }

  const variantClasses = {
    default: "border-2 border-gray-700",
    cyan: "border-2 border-neon-cyan shadow-[0_0_15px_rgba(11,228,236,0.2)]",
    lime: "border-2 border-neon-lime shadow-[0_0_15px_rgba(57,255,20,0.2)]",
    orange: "border-2 border-neon-orange shadow-[0_0_15px_rgba(255,102,0,0.2)]",
    magenta: "border-2 border-neon-magenta shadow-[0_0_15px_rgba(255,0,110,0.2)]",
    purple: "border-2 border-neon-purple shadow-[0_0_15px_rgba(179,0,255,0.2)]",
    empowerment: "border-2 border-neon-purple bg-gradient-to-br from-dark-card to-neon-purple/10 shadow-[0_0_15px_rgba(179,0,255,0.2)]",
    accent: "border-2 border-neon-cyan bg-gradient-to-br from-dark-card to-neon-cyan/10 shadow-[0_0_15px_rgba(11,228,236,0.2)]",
    secondary: "border-2 border-gray-600 bg-gray-800/50",
    destructive: "border-2 border-red-600 bg-red-900/20 shadow-[0_0_15px_rgba(220,38,38,0.2)]",
    ghost: "border-0 bg-transparent shadow-none",
    outline: "border-2 border-gray-500 bg-transparent"
  }

  const widthClass = fullWidth ? "w-full" : ""
  const interactiveClass = interactive ? "cursor-pointer hover-lift" : ""

  const cardVariants = {
    initial: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5
      }
    },
    hover: interactive ? {
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.3
      }
    } : {}
  }

  const shimmerVariants = {
    initial: { x: "-100%" },
    animate: { 
      x: "100%",
      transition: {
        duration: 3,
        repeat: Infinity
      }
    }
  }

  const crownVariants = {
    animate: {
      rotate: [0, 5, -5, 0],
      scale: [1, 1.1, 1],
      transition: {
        duration: 2,
        repeat: Infinity
      }
    }
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover={interactive ? "hover" : "animate"}
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        widthClass,
        interactiveClass,
        className
      )}
      onClick={onClick}
    >
      {/* Shimmer effect */}
      {shimmer && (
        <motion.div
          variants={shimmerVariants}
          initial="initial"
          animate="animate"
          className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-cyan/10 to-transparent pointer-events-none"
        />
      )}
      
      {/* Glow effect */}
      {glow && (
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 rounded-sm blur-xl bg-neon-cyan/20 pointer-events-none"
        />
      )}
      
      {/* Crown indicator */}
      {crown && (
        <motion.div
          variants={crownVariants}
          animate="animate"
          className="absolute top-4 right-4 z-10"
        >
          <Crown className="w-6 h-6 text-neon-orange" />
        </motion.div>
      )}
      
      {/* Purple badge */}
      {variant === "purple" && (
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{
            duration: 2,
            repeat: Infinity
          }}
          className="absolute top-4 left-4 z-10"
        >
          <div className="px-2 py-1 text-xs font-mono font-bold uppercase tracking-wider bg-neon-purple/20 border border-neon-purple text-neon-purple rounded-sm">
            Premium
          </div>
        </motion.div>
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        {header && (
          <div className="mb-4">
            {header}
          </div>
        )}
        
        {/* Main content */}
        <div className="space-y-4">
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="mt-6 pt-4 border-t border-gray-700">
            {footer}
          </div>
        )}
      </div>
      
      {/* Sparkle effects */}
      <motion.div
        animate={{
          opacity: [0, 1, 0],
          scale: [0.8, 1.2, 0.8]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-2 right-2"
      >
        <Sparkles className="w-4 h-4 text-neon-cyan" />
      </motion.div>
      
      <motion.div
        animate={{
          opacity: [0, 1, 0],
          scale: [0.8, 1.2, 0.8]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5
        }}
        className="absolute bottom-2 left-2"
      >
        <Sparkles className="w-4 h-4 text-neon-magenta" />
      </motion.div>
    </motion.div>
  )
}

// Specialized card variants following Cyberpunk Design System v3
export function CyanCard({ children, ...props }: Omit<BossCardProps, "variant">) {
  return (
    <BossCard variant="cyan" crown shimmer glow {...props}>
      {children}
    </BossCard>
  )
}

export function LimeCard({ children, ...props }: Omit<BossCardProps, "variant">) {
  return (
    <BossCard variant="lime" shimmer glow {...props}>
      {children}
    </BossCard>
  )
}

export function OrangeCard({ children, ...props }: Omit<BossCardProps, "variant">) {
  return (
    <BossCard variant="orange" shimmer glow {...props}>
      {children}
    </BossCard>
  )
}

export function MagentaCard({ children, ...props }: Omit<BossCardProps, "variant">) {
  return (
    <BossCard variant="magenta" shimmer glow {...props}>
      {children}
    </BossCard>
  )
}

export function PurpleCard({ children, ...props }: Omit<BossCardProps, "variant">) {
  return (
    <BossCard variant="purple" crown shimmer glow {...props}>
      {children}
    </BossCard>
  )
}

// Interactive card wrapper
export function InteractiveBossCard({ children, ...props }: BossCardProps) {
  return (
    <BossCard interactive shimmer glow {...props}>
      {children}
    </BossCard>
  )
}

// Stats card following Cyberpunk Design System v3
export function StatsCard({ 
  title, 
  value, 
  icon, 
  trend, 
  ...props 
}: Omit<BossCardProps, 'children'> & {
  title: string
  value: string | number
  icon?: ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
}) {
  return (
    <BossCard variant="cyan" shimmer glow {...props}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-mono font-medium text-gray-400">{title}</p>
          <p className="text-2xl font-orbitron font-bold text-neon-cyan">{value}</p>
          {trend && (
            <p className={`text-sm font-mono ${trend.isPositive ? 'text-neon-lime' : 'text-neon-magenta'}`}>
              {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {icon && (
          <div className="p-3 rounded-sm bg-neon-cyan/10 border border-neon-cyan text-neon-cyan">
            {icon}
          </div>
        )}
      </div>
    </BossCard>
  )
}
export const EmpowermentCard = CyanCard;
