"use client"

import { motion } from "framer-motion"
import { Crown, Sparkles } from "lucide-react"

interface LoadingProps {
  size?: "sm" | "md" | "lg"
  variant?: "skull" | "crown" | "boss"
  text?: string
  className?: string
}

export function Loading({ 
  size = "md", 
  variant = "skull", 
  text = "Loading your empire...",
  className = "" 
}: LoadingProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  }

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  }

  const skullVariants = {
    animate: {
      rotate: [0, 10, -10, 0],
      scale: [1, 1.1, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  const crownVariants = {
    animate: {
      rotate: [0, 5, -5, 0],
      scale: [1, 1.05, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  const bossVariants = {
    animate: {
      rotate: [0, 15, -15, 0],
      scale: [1, 1.15, 1],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  const renderIcon = () => {
    switch (variant) {
      case "skull":
        return (
          <motion.div
            variants={skullVariants}
            animate="animate"
            className={`${sizeClasses[size]} flex items-center justify-center`}
          >
            <span className="text-4xl animate-pulse">💀</span>
          </motion.div>
        )
      case "crown":
        return (
          <motion.div
            variants={crownVariants}
            animate="animate"
            className={`${sizeClasses[size]} flex items-center justify-center`}
          >
            <Crown className="w-full h-full text-yellow-500" />
          </motion.div>
        )
      case "boss":
        return (
          <motion.div
            variants={bossVariants}
            animate="animate"
            className={`${sizeClasses[size]} flex items-center justify-center relative`}
          >
            <span className="text-4xl animate-pulse">💀</span>
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Crown className="w-6 h-6 text-yellow-500" />
            </motion.div>
          </motion.div>
        )
      default:
        return null
    }
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      <div className="relative">
        {renderIcon()}
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 rounded-full gradient-empowerment opacity-20"
        />
      </div>
      
      {text && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`text-center ${textSizes[size]} font-medium text-gradient`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>{text}</span>
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
        </motion.div>
      )}
      
      {/* Shimmer effect */}
      <motion.div
        animate={{
          x: [-100, 100],
          opacity: [0, 1, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-32 h-1 gradient-primary rounded-full"
      />
    </div>
  )
}

// Full screen loading overlay
export function LoadingOverlay({ 
  variant = "boss",
  text = "Preparing your empire..." 
}: Omit<LoadingProps, "size" | "className">) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center gradient-background">
      <div className="text-center">
        <Loading 
          size="lg" 
          variant={variant} 
          text={text}
          className="mb-8"
        />
        
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-sm text-gray-600 dark:text-gray-400"
        >
          Bad ass girl boss mode activated 💪
        </motion.div>
      </div>
    </div>
  )
}

// Inline loading spinner
export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  }

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
      className={`${sizeClasses[size]} border-2 border-purple-200 border-t-purple-600 rounded-full`}
    />
  )
}