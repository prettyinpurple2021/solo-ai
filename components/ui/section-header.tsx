import * as React from "react"
import { cn } from "@/lib/utils"

interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  icon?: React.ReactNode
  badge?: React.ReactNode
  actions?: React.ReactNode
  variant?: "default" | "gradient" | "subtle" | "empowered"
}

export function SectionHeader({
  title,
  description,
  icon,
  badge,
  actions,
  variant = "default",
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-6",
        variant === "gradient" && "rounded-xl p-[2px] soloboss-gradient animate-gradient",
        variant === "empowered" && "rounded-xl p-[2px] empowerment-gradient animate-gradient",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "flex flex-col md:flex-row md:items-center md:justify-between gap-4",
          (variant === "gradient" || variant === "empowered") && 
            "rounded-xl bg-background/70 backdrop-blur-md border-2 border-purple-200 px-6 py-4"
        )}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {icon && <div className="text-purple-600">{icon}</div>}
            <h2 
              className={cn(
                "text-2xl font-bold",
                variant === "gradient" && "boss-text-gradient",
                variant === "empowered" && "empowerment-text-gradient"
              )}
            >
              {title}
            </h2>
            {badge && <div>{badge}</div>}
          </div>
          {description && (
            <p className="text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}
