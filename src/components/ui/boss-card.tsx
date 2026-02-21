import * as React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"

interface BossCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "purple" | "magenta" | "cyan" | "empowerment"
  interactive?: boolean
  crown?: boolean
  value?: string | number
  trend?: {
    value: number
    isPositive: boolean
  }
  icon?: React.ReactNode
}

/**
 * BossCard - A high-emphasis variant of the standard Card
 */
const BossCard = React.forwardRef<HTMLDivElement, BossCardProps>(
  ({ className, variant = "default", interactive, crown, value, trend, icon, children, ...props }, ref) => {
    const variantStyles = {
      default: "border-neon-cyan shadow-[0_0_20px_rgba(11,228,236,0.1)]",
      cyan: "border-neon-cyan shadow-[0_0_20px_rgba(11,228,236,0.2)]",
      purple: "border-neon-purple shadow-[0_0_20px_rgba(179,0,255,0.2)]",
      magenta: "border-neon-magenta shadow-[0_0_20px_rgba(255,0,110,0.2)]",
      empowerment: "border-neon-magenta border-2 bg-dark-card/80 backdrop-blur-sm shadow-[0_0_25px_rgba(255,0,110,0.2)]"
    }

    return (
      <Card
        ref={ref}
        className={cn(
          variantStyles[variant as keyof typeof variantStyles] || variantStyles.default,
          interactive && "cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
          crown && "border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.2)]",
          className
        )}
        {...props}
      >
        {crown && (
          <div className="absolute -top-3 -right-3 rotate-12 text-2xl z-10">👑</div>
        )}
        <div className="flex flex-col h-full">
          {icon && <div className="px-6 pt-6">{icon}</div>}
          {children}
          {value !== undefined && (
            <div className="px-6 pb-4">
              <div className="text-3xl font-bold font-orbitron">{value}</div>
              {trend && (
                <div className={cn(
                  "flex items-center text-xs mt-1",
                  trend.isPositive ? "text-neon-lime" : "text-neon-magenta"
                )}>
                  {trend.isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {trend.value}%
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    )
  }
)
BossCard.displayName = "BossCard"

/**
 * StatsCard - Optimized for displaying metrics
 */
const StatsCard = React.forwardRef<HTMLDivElement, BossCardProps>(
  ({ className, value, trend, icon, ...props }, ref) => (
    <BossCard
      ref={ref}
      variant="purple"
      value={value}
      trend={trend}
      icon={icon}
      className={cn("border-neon-purple", className)}
      {...props}
    />
  )
)
StatsCard.displayName = "StatsCard"

/**
 * EmpowermentCard - A premium variant with a more intense glow
 */
const EmpowermentCard = React.forwardRef<HTMLDivElement, BossCardProps>(
  ({ className, ...props }, ref) => (
    <BossCard
      ref={ref}
      variant="empowerment"
      className={className}
      {...props}
    />
  )
)
EmpowermentCard.displayName = "EmpowermentCard"

export { BossCard, StatsCard, EmpowermentCard, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
