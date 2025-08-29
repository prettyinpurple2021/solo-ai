"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Eye, 
  EyeOff, 
  Volume2, 
  VolumeX, 
  Keyboard, 
  MousePointer,
  Accessibility,
  Settings,
  Sun,
  Moon,
  Contrast
} from "lucide-react"

interface AccessibilityContextType {
  highContrast: boolean
  toggleHighContrast: () => void
  reducedMotion: boolean
  toggleReducedMotion: () => void
  screenReader: boolean
  toggleScreenReader: () => void
  fontSize: "small" | "medium" | "large"
  setFontSize: (size: "small" | "medium" | "large") => void
  focusVisible: boolean
  setFocusVisible: (visible: boolean) => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [highContrast, setHighContrast] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [screenReader, setScreenReader] = useState(false)
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">("medium")
  const [focusVisible, setFocusVisible] = useState(false)

  useEffect(() => {
    // Load accessibility preferences from localStorage
    const savedHighContrast = localStorage.getItem("accessibility-highContrast") === "true"
    const savedReducedMotion = localStorage.getItem("accessibility-reducedMotion") === "true"
    const savedScreenReader = localStorage.getItem("accessibility-screenReader") === "true"
    const savedFontSize = localStorage.getItem("accessibility-fontSize") as "small" | "medium" | "large" || "medium"

    setHighContrast(savedHighContrast)
    setReducedMotion(savedReducedMotion)
    setScreenReader(savedScreenReader)
    setFontSize(savedFontSize)
  }, [])

  useEffect(() => {
    // Apply accessibility settings to document
    const root = document.documentElement
    
    if (highContrast) {
      root.classList.add("high-contrast")
    } else {
      root.classList.remove("high-contrast")
    }

    if (reducedMotion) {
      root.classList.add("reduced-motion")
    } else {
      root.classList.remove("reduced-motion")
    }

    root.style.fontSize = fontSize === "small" ? "14px" : fontSize === "large" ? "18px" : "16px"

    // Save to localStorage
    localStorage.setItem("accessibility-highContrast", highContrast.toString())
    localStorage.setItem("accessibility-reducedMotion", reducedMotion.toString())
    localStorage.setItem("accessibility-screenReader", screenReader.toString())
    localStorage.setItem("accessibility-fontSize", fontSize)
  }, [highContrast, reducedMotion, fontSize])

  const toggleHighContrast = () => setHighContrast(!highContrast)
  const toggleReducedMotion = () => setReducedMotion(!reducedMotion)
  const toggleScreenReader = () => setScreenReader(!screenReader)

  return (
    <AccessibilityContext.Provider value={{
      highContrast,
      toggleHighContrast,
      reducedMotion,
      toggleReducedMotion,
      screenReader,
      toggleScreenReader,
      fontSize,
      setFontSize,
      focusVisible,
      setFocusVisible
    }}>
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider")
  }
  return context
}

// Accessibility settings panel
export function AccessibilityPanel() {
  const {
    highContrast,
    toggleHighContrast,
    reducedMotion,
    toggleReducedMotion,
    screenReader,
    toggleScreenReader,
    fontSize,
    setFontSize,
    focusVisible,
    setFocusVisible
  } = useAccessibility()

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Accessibility className="h-5 w-5" />
          Accessibility Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* High Contrast Mode */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="high-contrast" className="text-sm font-medium">
              High Contrast Mode
            </Label>
            <p className="text-xs text-muted-foreground">
              Increases contrast for better visibility
            </p>
          </div>
          <Switch
            id="high-contrast"
            checked={highContrast}
            onCheckedChange={toggleHighContrast}
            aria-label="Toggle high contrast mode"
          />
        </div>

        {/* Reduced Motion */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="reduced-motion" className="text-sm font-medium">
              Reduced Motion
            </Label>
            <p className="text-xs text-muted-foreground">
              Reduces animations and transitions
            </p>
          </div>
          <Switch
            id="reduced-motion"
            checked={reducedMotion}
            onCheckedChange={toggleReducedMotion}
            aria-label="Toggle reduced motion"
          />
        </div>

        {/* Screen Reader Mode */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="screen-reader" className="text-sm font-medium">
              Screen Reader Mode
            </Label>
            <p className="text-xs text-muted-foreground">
              Enhanced ARIA labels and navigation
            </p>
          </div>
          <Switch
            id="screen-reader"
            checked={screenReader}
            onCheckedChange={toggleScreenReader}
            aria-label="Toggle screen reader mode"
          />
        </div>

        {/* Font Size */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Font Size</Label>
          <div className="flex gap-2">
            {(["small", "medium", "large"] as const).map((size) => (
              <Button
                key={size}
                variant={fontSize === size ? "default" : "outline"}
                size="sm"
                onClick={() => setFontSize(size)}
                aria-label={`Set font size to ${size}`}
              >
                {size === "small" && "A"}
                {size === "medium" && "A"}
                {size === "large" && "A"}
              </Button>
            ))}
          </div>
        </div>

        {/* Focus Indicator */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="focus-visible" className="text-sm font-medium">
              Enhanced Focus Indicators
            </Label>
            <p className="text-xs text-muted-foreground">
              Makes focus states more visible
            </p>
          </div>
          <Switch
            id="focus-visible"
            checked={focusVisible}
            onCheckedChange={setFocusVisible}
            aria-label="Toggle enhanced focus indicators"
          />
        </div>
      </CardContent>
    </Card>
  )
}

// Keyboard navigation component
export function KeyboardNavigation() {
  const [showHelp, setShowHelp] = useState(false)

  const keyboardShortcuts = [
    { key: "Tab", description: "Navigate between elements" },
    { key: "Enter/Space", description: "Activate buttons and links" },
    { key: "Escape", description: "Close modals and dialogs" },
    { key: "Arrow Keys", description: "Navigate lists and menus" },
    { key: "Ctrl + K", description: "Open search" },
    { key: "Ctrl + /", description: "Show keyboard shortcuts" },
    { key: "Ctrl + M", description: "Toggle accessibility menu" },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Keyboard className="h-5 w-5" />
          Keyboard Navigation
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowHelp(!showHelp)}
          aria-expanded={showHelp}
          aria-controls="keyboard-help"
        >
          {showHelp ? "Hide" : "Show"} Shortcuts
        </Button>
      </div>

      {showHelp && (
        <div id="keyboard-help" className="space-y-2">
          {keyboardShortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <kbd className="px-2 py-1 text-sm font-mono bg-white border rounded shadow-sm">
                {shortcut.key}
              </kbd>
              <span className="text-sm text-muted-foreground">{shortcut.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ARIA live region for announcements
export function LiveRegion({ 
  message, 
  priority = "polite" 
}: { 
  message: string
  priority?: "polite" | "assertive" 
}) {
  const ariaLiveValue = priority === "polite" ? "polite" : "assertive"
  return (
    <div
      aria-live="polite"
      aria-atomic="true" 
      className="sr-only"
      role="status"
    >
      {message}
    </div>
  )
}

// Skip to main content link
export function SkipToMain() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
    >
      Skip to main content
    </a>
  )
}

// Focus trap for modals
export function FocusTrap({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        const focusableElements = document.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return <>{children}</>
}

// Screen reader only text
export function SrOnly({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>
}

// Accessible button with proper ARIA attributes
export function AccessibleButton({
  children,
  onClickAction,
  disabled = false,
  loading = false,
  icon,
  ...props
}: {
  children: React.ReactNode
  onClickAction: () => void
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
  [key: string]: any
}) {
  return (
    <Button
      onClick={onClickAction}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && <div className="animate-spin mr-2">⏳</div>}
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </Button>
  )
}

// CSS for accessibility features
export const accessibilityStyles = `
  /* High contrast mode */
  .high-contrast {
    --background: #000000;
    --foreground: #ffffff;
    --primary: #ffff00;
    --primary-foreground: #000000;
    --secondary: #ffffff;
    --secondary-foreground: #000000;
    --muted: #333333;
    --muted-foreground: #cccccc;
    --accent: #ffff00;
    --accent-foreground: #000000;
    --destructive: #ff0000;
    --destructive-foreground: #ffffff;
    --border: #ffffff;
    --input: #ffffff;
    --ring: #ffff00;
  }

  /* Reduced motion */
  .reduced-motion *,
  .reduced-motion *::before,
  .reduced-motion *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  /* Enhanced focus indicators */
  .focus-visible:focus {
    outline: 3px solid #6366f1;
    outline-offset: 2px;
  }

  /* Screen reader only */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`
