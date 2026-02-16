// @ts-nocheck
'use client'

import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import React, { useState, useEffect } from 'react'
import { Save, Star, Crown, Heart, Sparkles } from 'lucide-react'
import { briefcaseAutoSaver } from '@/utils/briefcase-auto-save'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Progress } from '@/components/ui/progress'


interface TemplateSaveIntegrationProps {
  templateSlug: string
  templateTitle: string
  templateData: any
  progress?: number
  className?: string
  autoSave?: boolean
  onSave?: (title: string) => void
}

export const TemplateSaveIntegration: React.FC<TemplateSaveIntegrationProps> = ({
  templateSlug,
  templateTitle,
  templateData,
  progress = 0,
  className = '',
  autoSave = false, // Templates are usually saved manually
  onSave
}) => {
  const [saveTitle, setSaveTitle] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [lastSavedData, setLastSavedData] = useState<string>('')
  const [showAutoSaveIndicator, setShowAutoSaveIndicator] = useState(false)
  const { toast } = useToast()

  // Generate default title
  useEffect(() => {
    if (!saveTitle) {
      const currentDate = new Date().toLocaleDateString()
      setSaveTitle(`${templateTitle} - ${currentDate}`)
    }
  }, [templateTitle, saveTitle])

  // Auto-save functionality (when enabled)
  useEffect(() => {
    if (!autoSave || !templateData) return

    const currentDataString = JSON.stringify(templateData)
    
    // Only auto-save if data has changed and we have meaningful content
    if (currentDataString !== lastSavedData && Object.keys(templateData).length > 0) {
      setShowAutoSaveIndicator(true)
      
      // Auto-save after a delay
      const timeoutId = setTimeout(() => {
        handleAutoSave()
        setShowAutoSaveIndicator(false)
      }, 3000)

      return () => clearTimeout(timeoutId)
    }
  }, [templateData, autoSave, lastSavedData])

  const handleAutoSave = async () => {
    if (!templateData || Object.keys(templateData).length === 0) return

    try {
      await briefcaseAutoSaver.saveTemplateProgress(
        templateSlug,
        saveTitle,
        templateData,
        progress
      )
      
      setLastSavedData(JSON.stringify(templateData))
    } catch (error) {
      logError('Auto-save error:', error)
    }
  }

  const handleManualSave = async () => {
    if (!templateData || Object.keys(templateData).length === 0) {
      toast({
        title: "Nothing to save, queen! 👑",
        description: "Fill out some template fields first to save your progress.",
        variant: "default"
      })
      return
    }

    if (!saveTitle.trim()) {
      toast({
        title: "Title needed, babe! ✨",
        description: "Please enter a title for your template save.",
        variant: "destructive"
      })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/unified-briefcase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(typeof window !== 'undefined' && localStorage.getItem('authToken')
            ? { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
            : {})
        },
        body: JSON.stringify({
          type: 'template_save',
          title: `${saveTitle.trim()} (${progress}% complete)`,
          content: templateData,
          metadata: { 
            templateSlug,
            progress,
            autoSaved: false,
            originalTitle: templateTitle
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save template')
      }

      toast({
        title: "Template saved! ✨",
        description: `Your progress on "${templateTitle}" has been saved to your briefcase.`
      })
      
      setLastSavedData(JSON.stringify(templateData))
      onSave?.(saveTitle.trim())
      
    } catch (error) {
      logError('Save error:', error)
      toast({
        title: "Save failed 💔",
        description: "Failed to save your template progress. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const calculateProgress = () => {
    if (progress > 0) return progress

    if (!templateData || typeof templateData !== 'object') return 0

    const totalFields = Object.keys(templateData).length
    const filledFields = Object.values(templateData).filter(value => 
      value !== null && value !== undefined && value !== ''
    ).length

    return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0
  }

  const currentProgress = calculateProgress()

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Progress Indicator */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-700 flex items-center gap-2">
              <Star size={14} className="text-purple-600" />
              Template Progress
            </span>
            <span className="text-sm font-bold text-purple-700">{currentProgress}%</span>
          </div>
          <Progress 
            value={currentProgress} 
            className="h-2 bg-purple-100"
            // Custom styling for the progress bar
          />
        </div>
        
        {/* Auto-save indicator */}
        {showAutoSaveIndicator && (
          <div className="flex items-center gap-2 text-xs text-purple-600/70 font-medium">
            <Sparkles size={12} className="text-teal-500 animate-pulse" />
            <span>Auto-saving...</span>
          </div>
        )}
      </div>

      {/* Save Controls */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Input
            value={saveTitle}
            onChange={(e) => setSaveTitle(e.target.value)}
            placeholder="Enter save title..."
            className="border-purple-200 focus:ring-purple-400 focus:border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-900 placeholder-purple-500/70"
          />
        </div>
        
        <Button
          onClick={handleManualSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600 text-white rounded-full px-6 py-2 font-bold transition-all duration-300 hover:scale-105 shadow-lg"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-b-transparent"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save size={14} />
              <span>Save Progress</span>
              <Crown size={12} className="opacity-70" />
            </>
          )}
        </Button>
      </div>

      {/* Template Info */}
      <div className="flex items-center gap-2 text-xs text-purple-600/70 font-medium">
        <Heart size={12} className="text-pink-500" />
        <span>Template: {templateTitle}</span>
        <span>•</span>
        <span>{Object.keys(templateData || {}).length} fields</span>
      </div>
    </div>
  )
}

export default TemplateSaveIntegration
