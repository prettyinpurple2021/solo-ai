"use client"

import { logError,} from '@/lib/logger'
import { useState} from "react"

import { Badge} from "@/components/ui/badge"
import { BossButton} from "@/components/ui/boss-button"
import { BossCard} from "@/components/ui/boss-card"
import { Progress} from "@/components/ui/progress"

import { motion, AnimatePresence} from "framer-motion"
import { 
  Download, Bookmark, ArrowLeft, Sparkles, Crown, Save, RefreshCw} from "lucide-react"
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
  const [lastSaved, setLastSaved] = useState<Date (null)
  const [isBookmarked, setIsBookmarked] = useState(false)

  const handleSave = async (data: any) => {
    if (!onSave) return
    
    setIsSaving(true)
    try {
      await onSave(data)
      setLastSaved(new Date())
    } catch (error) {
      logError('Failed to save template data:', error)
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
    <div className={`min-h-screen bg-dark-bg ${className}`}>
      {/* Header Section */}
      <div className="sticky top-0 z-40 bg-dark-card/80 backdrop-blur-md border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Back & Title */}
            <div className="flex items-center gap-4">
              <Link href="/templates">
                <BossButton variant="secondary" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
                  Templates
                </BossButton>
              </Link>
              <div>
                <h1 className="text-2xl font-orbitron font-bold uppercase tracking-wider text-white">
                  {template.title}
                </h1>
                <p className="text-sm text-gray-500 font-mono">{template.category}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Badge variant="purple" className="hidden sm:flex">
                {template.requiredRole.replace('_', ' ')}
              </Badge>
              
              <BossButton
                variant="secondary"
                size="sm"
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={isBookmarked ? "text-yellow-500" : ""}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </BossButton>

              {onSave && (
                <BossButton
                  variant="secondary"
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
              <div className="flex items-center justify-between text-sm text-gray-500 font-mono mb-2">
                <span>Step {currentStep} of {totalSteps}</span>
                <span>{Math.round(progressPercentage)}% Complete</span>
              </div>
              <Progress 
                value={progressPercentage} 
                className="h-2 bg-gray-800"
              />
            </motion.div>
          )}

          {/* Save Status */}
          {lastSaved && (
            <motion.p 
              className="text-xs text-neon-lime font-mono mt-2"
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
          <BossCard className="mb-8 bg-dark-card border-gray-700" variant="empowerment">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-gray-300 leading-relaxed mb-4 font-mono">
                    {template.description}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={template.isInteractive ? 'cyan' : 'purple'}>
                      {template.isInteractive ? 'Interactive' : 'Static'}
                    </Badge>
                    <Badge variant="purple">
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
                    repeat: Infinity 
                  }}
                  className="ml-4"
                >
                  <Crown className="w-8 h-8 text-neon-purple" />
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
          {(_onReset || onExport) && (
            <motion.div 
              className="mt-8 flex justify-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {_onReset && (
                <BossButton
                  variant="secondary"
                  onClick={_onReset}
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
