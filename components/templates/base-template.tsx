"use client"

import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { BossButton } from "@/components/ui/boss-button"
import { BossCard } from "@/components/ui/boss-card"
import { Progress } from "@/components/ui/progress"

import { motion, AnimatePresence } from "framer-motion"
import { 
  Download, 
  Share2, 
  Bookmark, 
  ArrowLeft, 
  Sparkles,
  Crown,
  Save,
  RefreshCw
} from "lucide-react"
import Link from "next/link"

export interface TemplateData {
  title: string
  description: string
  category: string
  slug: string
  isInteractive: boolean
  requiredRole: string
}

export interface BaseTemplateProps {
  template: TemplateData
  children: React.ReactNode
  currentStep?: number
  totalSteps?: number
  onSave?: (data: any) => void
  onExport?: (format: 'json' | 'pdf' | 'csv') => void
  onReset?: () => void
  showProgress?: boolean
  className?: string
}

export default function BaseTemplate({
  template,
  children,
  currentStep = 1,
  totalSteps = 1,
  onSave,
  onExport,
  onReset: _onReset,
  showProgress = false,
  className = ""
}: BaseTemplateProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)

  const handleSave = async (_data: any) => {
    if (!onSave) return
    
    setIsSaving(true)
    try {
      await onSave(data)
      setLastSaved(new Date())
    } catch (error) {
      console.error('Failed to save template data:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleExport = (format: 'json' | 'pdf' | 'csv') => {
    if (onExport) {
      onExport(format)
    }
  }

  const progressPercentage = showProgress ? (currentStep / totalSteps) * 100 : 0

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 ${className}`}>
      {/* Header Section */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Back & Title */}
            <div className="flex items-center gap-4">
              <Link href="/templates">
                <BossButton variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
                  Templates
                </BossButton>
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {template.title}
                </h1>
                <p className="text-sm text-gray-600">{template.category}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="hidden sm:flex">
                {template.requiredRole.replace('_', ' ')}
              </Badge>
              
              <BossButton
                variant="ghost"
                size="sm"
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={isBookmarked ? "text-yellow-500" : ""}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </BossButton>

              {onSave && (
                <BossButton
                  variant="outline"
                  size="sm"
                  onClick={() => handleSave({})}
                  loading={isSaving}
                  icon={<Save className="w-4 h-4" />}
                >
                  <span className="hidden sm:inline">Save</span>
                </BossButton>
              )}

              <BossButton
                variant="empowerment"
                size="sm"
                crown
                onClick={() => handleExport('json')}
                icon={<Download className="w-4 h-4" />}
              >
                <span className="hidden sm:inline">Export</span>
              </BossButton>
            </div>
          </div>

          {/* Progress Bar */}
          {showProgress && totalSteps > 1 && (
            <motion.div 
              className="mt-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Step {currentStep} of {totalSteps}</span>
                <span>{Math.round(progressPercentage)}% Complete</span>
              </div>
              <Progress 
                value={progressPercentage} 
                className="h-2 bg-gradient-to-r from-purple-200 to-pink-200"
              />
            </motion.div>
          )}

          {/* Save Status */}
          {lastSaved && (
            <motion.p 
              className="text-xs text-green-600 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Sparkles className="w-3 h-3 inline mr-1" />
              Last saved: {lastSaved.toLocaleTimeString()}
            </motion.p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Template Description Card */}
          <BossCard className="mb-8" variant="empowerment">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {template.description}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={template.isInteractive ? 'default' : 'secondary'}>
                      {template.isInteractive ? 'Interactive' : 'Static'}
                    </Badge>
                    <Badge variant="outline">
                      Category: {template.category}
                    </Badge>
                  </div>
                </div>
                <motion.div
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1] 
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="ml-4"
                >
                  <Crown className="w-8 h-8 text-purple-500" />
                </motion.div>
              </div>
            </div>
          </BossCard>

          {/* Template Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>

          {/* Quick Actions */}
          {(onReset || onExport) && (
            <motion.div 
              className="mt-8 flex justify-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {onReset && (
                <BossButton
                  variant="outline"
                  onClick={onReset}
                  icon={<RefreshCw className="w-4 h-4" />}
                >
                  Reset Template
                </BossButton>
              )}
              
              {onExport && (
                <div className="flex gap-2">
                  <BossButton
                    variant="accent"
                    size="sm"
                    onClick={() => handleExport('json')}
                  >
                    Export JSON
                  </BossButton>
                  <BossButton
                    variant="accent"
                    size="sm"
                    onClick={() => handleExport('pdf')}
                  >
                    Export PDF
                  </BossButton>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
