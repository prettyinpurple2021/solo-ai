import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Common gradient styles used throughout the app
 */
export const gradientVariants = cva("", {
  variants: {
    variant: {
      "purple-pink": "bg-gradient-to-r from-purple-500 to-pink-500",
      "purple-pink-text": "bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent",
      "teal-purple": "bg-gradient-to-r from-teal-500 to-purple-500",
      "pink-purple": "bg-gradient-to-r from-pink-500 to-purple-500", 
      "purple-teal": "bg-gradient-to-r from-purple-500 to-teal-500",
      "teal-pink": "bg-gradient-to-r from-teal-500 to-pink-500",
      "pink-teal": "bg-gradient-to-r from-pink-500 to-teal-500",
    },
  },
  defaultVariants: {
    variant: "purple-pink",
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
      purple: "border-2 border-purple-100 hover:border-purple-300",
      boss: "boss-card",
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
export function getGradient(variant: keyof typeof gradientVariants.defaultVariants.variant = "purple-pink") {
  return gradientVariants({ variant })
}

/**
 * Utility function to get animation classes  
 */
export function getAnimation(hover: keyof typeof animationVariants.defaultVariants.hover = "scale") {
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