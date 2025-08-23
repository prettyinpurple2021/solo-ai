"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Crown, Sparkles, Zap } from "lucide-react"

interface BossButtonProps {
  children: ReactNode
  variant?: "primary" | "secondary" | "accent" | "empowerment" | "danger" | "success"
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
  variant = "primary",
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
  const baseClasses = "relative overflow-hidden font-bold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
  
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  }

  const variantClasses = {
    primary: "gradient-primary text-white focus:ring-purple-500",
    secondary: "gradient-secondary text-white focus:ring-pink-500",
    accent: "gradient-accent text-white focus:ring-cyan-500",
    empowerment: "gradient-empowerment text-white focus:ring-purple-500",
    danger: "gradient-danger text-white focus:ring-red-500",
    success: "gradient-success text-white focus:ring-green-500"
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
        repeat: Infinity,
        ease: "easeInOut"
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
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-empowerment opacity-0 hover:opacity-20 transition-opacity duration-300" />
      
      {/* Shimmer effect */}
      {shimmer && !disabled && !loading && (
        <motion.div
          variants={shimmerVariants}
          initial="initial"
          animate="animate"
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />
      )}
      
      {/* Glow effect */}
      {glow && (
        <motion.div
          variants={glowVariants}
          initial="initial"
          whileHover="hover"
          className="absolute inset-0 rounded-xl blur-xl gradient-empowerment opacity-0"
        />
      )}
      
      {/* Content */}
      <div className="relative flex items-center justify-center space-x-2">
        {loading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
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
                  repeat: Infinity,
                  ease: "easeInOut"
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
            
            <span className="font-boss">{children}</span>
            
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
                repeat: Infinity,
                ease: "easeInOut"
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

// Specialized button variants
export function EmpowermentButton({ children, ...props }: Omit<BossButtonProps, "variant">) {
  return (
    <BossButton variant="empowerment" crown shimmer glow {...props}>
      {children}
    </BossButton>
  )
}

export function DangerButton({ children, ...props }: Omit<BossButtonProps, "variant">) {
  return (
    <BossButton variant="danger" {...props}>
      {children}
    </BossButton>
  )
}

export function SuccessButton({ children, ...props }: Omit<BossButtonProps, "variant">) {
  return (
    <BossButton variant="success" {...props}>
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
      variant="empowerment"
      shimmer 
      glow 
      {...props}
    >
      {children}
    </BossButton>
  )
}