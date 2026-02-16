"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Crown, Sparkles, Zap } from "lucide-react"

/**
 * BossButton component following Cyberpunk Design System v3
 * Uses neon colors, dark backgrounds, and glow effects
 */
export interface BossButtonProps {
  children: ReactNode
  variant?: "cyan" | "magenta" | "lime" | "purple" | "orange" | "outline" | "secondary" | "destructive" | "ghost" | "link" | "empowerment" | "accent"
  size?: "sm" | "md" | "lg"
  icon?: ReactNode
  iconPosition?: "left" | "right"
  shimmer?: boolean
  glow?: boolean
  crown?: boolean
  className?: string
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
}

export function BossButton({
  children,
  variant = "cyan",
  size = "md",
  icon,
  iconPosition = "left",
  shimmer = true,
  glow = true,
  crown = false,
  className = "",
  onClick,
  disabled = false,
  loading = false,
  fullWidth = false
}: BossButtonProps) {
  const baseClasses = "relative overflow-hidden font-mono font-bold uppercase tracking-wider rounded-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg disabled:opacity-50 disabled:cursor-not-allowed"
  
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  }

  const variantClasses = {
    cyan: "border-2 border-neon-cyan bg-neon-cyan/10 text-neon-cyan focus:ring-neon-cyan hover:bg-neon-cyan/20 hover:shadow-[0_0_20px_rgba(11,228,236,0.5)]",
    magenta: "border-2 border-neon-magenta bg-neon-magenta/10 text-neon-magenta focus:ring-neon-magenta hover:bg-neon-magenta/20 hover:shadow-[0_0_20px_rgba(255,0,110,0.5)]",
    lime: "border-2 border-neon-lime bg-neon-lime/10 text-neon-lime focus:ring-neon-lime hover:bg-neon-lime/20 hover:shadow-[0_0_20px_rgba(57,255,20,0.5)]",
    purple: "border-2 border-neon-purple bg-neon-purple/10 text-neon-purple focus:ring-neon-purple hover:bg-neon-purple/20 hover:shadow-[0_0_20px_rgba(179,0,255,0.5)]",
    orange: "border-2 border-neon-orange bg-neon-orange/10 text-neon-orange focus:ring-neon-orange hover:bg-neon-orange/20 hover:shadow-[0_0_20px_rgba(255,102,0,0.5)]",
    outline: "border-2 border-gray-700 bg-transparent text-gray-300 hover:border-neon-cyan hover:text-neon-cyan focus:ring-neon-cyan",
    secondary: "border-2 border-gray-600 bg-gray-800/50 text-gray-200 hover:bg-gray-700 hover:border-gray-500 focus:ring-gray-500",
    destructive: "border-2 border-red-600 bg-red-600/10 text-red-500 hover:bg-red-600/20 hover:shadow-[0_0_20px_rgba(220,38,38,0.5)] focus:ring-red-500",
    ghost: "border-2 border-transparent bg-transparent text-gray-400 hover:text-white hover:bg-white/5 focus:ring-gray-500",
    link: "border-0 bg-transparent text-neon-cyan underline-offset-4 hover:underline focus:ring-0 px-0",
    empowerment: "border-2 border-neon-purple bg-gradient-to-r from-neon-purple/20 to-neon-magenta/20 text-white hover:shadow-[0_0_20px_rgba(179,0,255,0.5)] focus:ring-neon-purple",
    accent: "border-2 border-neon-cyan bg-gradient-to-r from-neon-cyan/20 to-neon-lime/20 text-white hover:shadow-[0_0_20px_rgba(11,228,236,0.5)] focus:ring-neon-cyan"
  }

  const widthClass = fullWidth ? "w-full" : ""

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  }

  const shimmerVariants = {
    initial: { x: "-100%" },
    animate: { 
      x: "100%",
      transition: {
        duration: 2,
        repeat: Infinity
      }
    }
  }

  const glowVariants = {
    initial: { opacity: 0 },
    hover: { 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  }

  return (
    <motion.button
      variants={buttonVariants}
      initial="initial"
      whileHover={!disabled && !loading ? "hover" : "initial"}
      whileTap={!disabled && !loading ? "tap" : "initial"}
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        widthClass,
        glow && "hover-glow",
        className
      )}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {/* Shimmer effect */}
      {shimmer && !disabled && !loading && (
        <motion.div
          variants={shimmerVariants}
          initial="initial"
          animate="animate"
          className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-cyan/20 to-transparent"
        />
      )}
      
      {/* Glow effect */}
      {glow && (
        <motion.div
          variants={glowVariants}
          initial="initial"
          whileHover="hover"
          className="absolute inset-0 rounded-sm blur-xl bg-neon-cyan/30 opacity-0"
        />
      )}
      
      {/* Content */}
      <div className="relative flex items-center justify-center space-x-2">
        {loading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
            />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {crown && (
              <motion.div
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
              >
                <Crown className="w-4 h-4 text-yellow-300" />
              </motion.div>
            )}
            
            {icon && iconPosition === "left" && (
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                {icon}
              </motion.div>
            )}
            
            <span>{children}</span>
            
            {icon && iconPosition === "right" && (
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                {icon}
              </motion.div>
            )}
            
            {/* Sparkle effect */}
            <motion.div
              animate={{
                opacity: [0, 1, 0],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 2,
                repeat: Infinity
              }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles className="w-3 h-3 text-yellow-300" />
            </motion.div>
          </>
        )}
      </div>
    </motion.button>
  )
}

// Specialized button variants following Cyberpunk Design System v3
export function CyanButton({ children, ...props }: Omit<BossButtonProps, "variant">) {
  return (
    <BossButton variant="cyan" crown shimmer glow {...props}>
      {children}
    </BossButton>
  )
}

export function MagentaButton({ children, ...props }: Omit<BossButtonProps, "variant">) {
  return (
    <BossButton variant="magenta" {...props}>
      {children}
    </BossButton>
  )
}

export function LimeButton({ children, ...props }: Omit<BossButtonProps, "variant">) {
  return (
    <BossButton variant="lime" {...props}>
      {children}
    </BossButton>
  )
}

// Icon button variants
export function IconBossButton({ 
  icon, 
  children, 
  ...props 
}: BossButtonProps & { icon: ReactNode }) {
  return (
    <BossButton icon={icon} shimmer glow {...props}>
      {children}
    </BossButton>
  )
}

export function ZapButton({ children, ...props }: Omit<BossButtonProps, "icon">) {
  return (
    <BossButton 
      icon={<Zap className="w-4 h-4" />} 
      variant="cyan"
      shimmer 
      glow 
      {...props}
    >
      {children}
    </BossButton>
  )
}
