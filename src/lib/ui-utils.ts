import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Common gradient styles used throughout the app
 * Updated to use Cyberpunk Design System v3 neon colors
 */
export const gradientVariants = cva("", {
  variants: {
    variant: {
      "cyan-purple": "bg-gradient-to-r from-neon-cyan to-neon-purple",
      "cyan-purple-text": "bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent",
      "purple-magenta": "bg-gradient-to-r from-neon-purple to-neon-magenta",
      "magenta-purple": "bg-gradient-to-r from-neon-magenta to-neon-purple", 
      "cyan-magenta": "bg-gradient-to-r from-neon-cyan to-neon-magenta",
      "lime-cyan": "bg-gradient-to-r from-neon-lime to-neon-cyan",
      "orange-purple": "bg-gradient-to-r from-neon-orange to-neon-purple",
      // Legacy support - map old variants to new colors
      "purple-pink": "bg-gradient-to-r from-neon-purple to-neon-magenta",
      "purple-pink-text": "bg-gradient-to-r from-neon-purple to-neon-magenta bg-clip-text text-transparent",
      "teal-purple": "bg-gradient-to-r from-neon-cyan to-neon-purple",
      "pink-purple": "bg-gradient-to-r from-neon-magenta to-neon-purple", 
      "purple-teal": "bg-gradient-to-r from-neon-purple to-neon-cyan",
      "teal-pink": "bg-gradient-to-r from-neon-cyan to-neon-magenta",
      "pink-teal": "bg-gradient-to-r from-neon-magenta to-neon-cyan",
    },
  },
  defaultVariants: {
    variant: "cyan-purple",
  },
})

/**
 * Common animation classes
 */
export const animationVariants = cva("", {
  variants: {
    hover: {
      scale: "hover:scale-105 transition-all duration-200",
      bounce: "bounce-on-hover",
      glow: "hover:shadow-lg transition-shadow duration-200",
    },
  },
})

/**
 * Common card styles
 */
export const cardVariants = cva("", {
  variants: {
    variant: {
      default: "border border-gray-200",
      purple: "border-2 border-neon-purple/30 hover:border-neon-purple/60",
      founder: "cyber-card",
    },
    animation: {
      none: "",
      hover: "hover:scale-105 transition-all duration-200",
      bounce: "bounce-on-hover",
    },
  },
  defaultVariants: {
    variant: "default",
    animation: "none",
  },
})

/**
 * Utility function to get gradient classes
 */
export function getGradient(
  variant: 
    | "cyan-purple" | "cyan-purple-text" | "purple-magenta" | "magenta-purple" 
    | "cyan-magenta" | "lime-cyan" | "orange-purple"
    // Legacy variants (mapped to new colors)
    | "purple-pink" | "purple-pink-text" | "teal-purple" | "pink-purple" 
    | "purple-teal" | "teal-pink" | "pink-teal" 
  = "cyan-purple"
) {
  return gradientVariants({ variant })
}

/**
 * Utility function to get animation classes  
 */
export function getAnimation(hover: "scale" | "bounce" | "glow" = "scale") {
  return animationVariants({ hover })
}

/**
 * Utility function to get card classes
 */
export function getCardClasses(
  variant: VariantProps<typeof cardVariants>["variant"] = "default",
  animation: VariantProps<typeof cardVariants>["animation"] = "none",
  className?: string
) {
  return cn(cardVariants({ variant, animation }), className)
}
