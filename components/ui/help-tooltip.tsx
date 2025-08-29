"use client"

import { useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  HelpCircle, 
  Lightbulb, 
  Zap, 
  Star, 
  ArrowRight,
  Play,
  BookOpen,
  Video,
  ExternalLink
} from "lucide-react"

interface HelpTooltipProps {
  children: React.ReactNode
  title: string
  description: string
  tips?: string[]
  videoUrl?: string
  docsUrl?: string
  examples?: string[]
  difficulty?: "beginner" | "intermediate" | "advanced"
  category?: string
  className?: string
}

export function HelpTooltip({ 
  children, 
  title, 
  description, 
  tips = [], 
  videoUrl, 
  docsUrl, 
  examples = [],
  difficulty = "beginner",
  category,
  className 
}: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "beginner": return "bg-green-100 text-green-800"
      case "intermediate": return "bg-yellow-100 text-yellow-800"
      case "advanced": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getDifficultyIcon = (diff: string) => {
    switch (diff) {
      case "beginner": return "🌱"
      case "intermediate": return "🚀"
      case "advanced": return "⚡"
      default: return "💡"
    }
  }

  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center gap-1 ${className}`}>
            {children}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 text-muted-foreground hover:text-purple-600"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsOpen(!isOpen)
              }}
            >
              <HelpCircle className="h-3 w-3" />
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          align="center" 
          className="w-80 p-0 border-2 border-purple-200 bg-white shadow-xl"
        >
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-purple-600" />
                    {title}
                  </CardTitle>
                  {category && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      {category}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Badge className={`text-xs ${getDifficultyColor(difficulty)}`}>
                    {getDifficultyIcon(difficulty)} {difficulty}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <p className="text-sm text-gray-600">{description}</p>
              
              {tips.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <Zap className="h-3 w-3 text-yellow-500" />
                    Pro Tips
                  </h4>
                  <ul className="space-y-1">
                    {tips.map((tip, index) => (
                      <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                        <Star className="h-3 w-3 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {examples.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">Examples</h4>
                  <div className="space-y-1">
                    {examples.map((example, index) => (
                      <div key={index} className="text-xs bg-gray-50 p-2 rounded border-l-2 border-purple-300">
                        "{example}"
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(videoUrl || docsUrl) && (
                <div className="flex gap-2 pt-2 border-t">
                  {videoUrl && (
                    <Button size="sm" variant="outline" className="text-xs h-7">
                      <Video className="h-3 w-3 mr-1" />
                      Watch
                    </Button>
                  )}
                  {docsUrl && (
                    <Button size="sm" variant="outline" className="text-xs h-7">
                      <BookOpen className="h-3 w-3 mr-1" />
                      Docs
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Quick help tooltip for simple cases
export function QuickHelp({ children, text }: { children: React.ReactNode; text: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-1">
            {children}
            <HelpCircle className="h-3 w-3 text-muted-foreground hover:text-purple-600 cursor-help" />
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Feature highlight tooltip
export function FeatureHighlight({ 
  children, 
  feature, 
  benefit 
}: { 
  children: React.ReactNode; 
  feature: string; 
  benefit: string 
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-1">
            {children}
            <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse" />
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <p className="text-sm font-medium text-purple-600">{feature}</p>
            <p className="text-xs text-gray-600">{benefit}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
