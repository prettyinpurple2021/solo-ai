"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Crown, Sparkles } from "lucide-react"

interface BossCardProps {
  children: ReactNode
  variant?: "default" | "empowerment" | "success" | "warning" | "danger" | "premium"
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
  const baseClasses = "relative overflow-hidden rounded-2xl transition-all duration-300"
  
  const sizeClasses = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8"
  }

  const variantClasses = {
    default: "card-boss",
    empowerment: "card-boss border-purple-300/50",
    success: "card-boss border-green-300/50",
    warning: "card-boss border-yellow-300/50",
    danger: "card-boss border-red-300/50",
    premium: "card-boss border-yellow-400/50"
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
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: interactive ? {
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    } : {}
  }

  const shimmerVariants = {
    initial: { x: "-100%" },
    animate: { 
      x: "100%",
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  const crownVariants = {
    animate: {
      rotate: [0, 5, -5, 0],
      scale: [1, 1.1, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
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
      {/* Background gradient overlay */}
      <div className="absolute inset-0 gradient-empowerment opacity-5" />
      
      {/* Shimmer effect */}
      {shimmer && (
        <motion.div
          variants={shimmerVariants}
          initial="initial"
          animate="animate"
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
        />
      )}
      
      {/* Glow effect */}
      {glow && (
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 rounded-2xl blur-xl gradient-empowerment opacity-20 pointer-events-none"
        />
      )}
      
      {/* Crown indicator */}
      {crown && (
        <motion.div
          variants={crownVariants}
          animate="animate"
          className="absolute top-4 right-4 z-10"
        >
          <Crown className="w-6 h-6 text-yellow-500" />
        </motion.div>
      )}
      
      {/* Premium badge */}
      {variant === "premium" && (
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-4 left-4 z-10"
        >
          <div className="crown-badge">
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
          <div className="mt-6 pt-4 border-t border-purple-200/20">
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
        <Sparkles className="w-4 h-4 text-purple-400" />
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
        <Sparkles className="w-4 h-4 text-pink-400" />
      </motion.div>
    </motion.div>
  )
}

// Specialized card variants
export function EmpowermentCard({ children, ...props }: Omit<BossCardProps, "variant">) {
  return (
    <BossCard variant="empowerment" crown shimmer glow {...props}>
      {children}
    </BossCard>
  )
}

export function SuccessCard({ children, ...props }: Omit<BossCardProps, "variant">) {
  return (
    <BossCard variant="success" shimmer glow {...props}>
      {children}
    </BossCard>
  )
}

export function WarningCard({ children, ...props }: Omit<BossCardProps, "variant">) {
  return (
    <BossCard variant="warning" shimmer glow {...props}>
      {children}
    </BossCard>
  )
}

export function DangerCard({ children, ...props }: Omit<BossCardProps, "variant">) {
  return (
    <BossCard variant="danger" shimmer glow {...props}>
      {children}
    </BossCard>
  )
}

export function PremiumCard({ children, ...props }: Omit<BossCardProps, "variant">) {
  return (
    <BossCard variant="premium" crown shimmer glow {...props}>
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

// Stats card
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
    <BossCard variant="empowerment" shimmer glow {...props}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gradient">{value}</p>
          {trend && (
            <p className={`text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {icon && (
          <div className="p-3 rounded-full gradient-primary">
            {icon}
          </div>
        )}
      </div>
    </BossCard>
  )
}