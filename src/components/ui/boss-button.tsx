import * as React from "react"
import { Button, PrimaryButton } from "./button"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface BossButtonProps extends React.ComponentPropsWithoutRef<typeof PrimaryButton> {
  crown?: boolean
  icon?: React.ReactNode
  loading?: boolean
}

/**
 * BossButton - A high-impact button with enhanced glow and optional crown/icon
 */
const BossButton = React.forwardRef<HTMLButtonElement, BossButtonProps>(
  ({ className, crown, icon, loading, children, ...props }, ref) => (
    <PrimaryButton
      ref={ref}
      className={cn(
        "relative border-neon-cyan shadow-[0_0_15px_rgba(11,228,236,0.3)]",
        "hover:shadow-[0_0_25px_rgba(11,228,236,0.5)] hover:scale-105",
        crown && "border-yellow-400 text-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)] hover:shadow-[0_0_25px_rgba(250,204,21,0.5)]",
        className
      )}
      variant={crown ? "orange" : props.variant || "cyan"}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          icon && <span>{icon}</span>
        )}
        {children}
        {crown && <span className="ml-1 text-xs">👑</span>}
      </div>
    </PrimaryButton>
  )
)
BossButton.displayName = "BossButton"

/**
 * ZapButton - A fast-action button with magenta theme
 */
const ZapButton = React.forwardRef<HTMLButtonElement, BossButtonProps>(
  ({ className, icon, loading, children, ...props }, ref) => (
    <PrimaryButton
      ref={ref}
      className={cn(
        "border-neon-magenta shadow-[0_0_15px_rgba(255,0,110,0.3)]",
        "hover:shadow-[0_0_25px_rgba(255,0,110,0.5)] hover:scale-105",
        className
      )}
      variant="magenta"
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          icon && <span>{icon}</span>
        )}
        {children}
      </div>
    </PrimaryButton>
  )
)
ZapButton.displayName = "ZapButton"

export { BossButton, ZapButton }
