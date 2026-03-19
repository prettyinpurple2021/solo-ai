'use client'

import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import React, { useState, useEffect } from 'react'
import { Save, Palette, Crown, Heart, Sparkles } from 'lucide-react'
import { briefcaseAutoSaver } from '@/utils/briefcase-auto-save'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'


interface BrandStudioSaveIntegrationProps {
  brandData: any
  className?: string
  autoSave?: boolean
  onSave?: (title: string) => void
}

export const BrandStudioSaveIntegration: React.FC<BrandStudioSaveIntegrationProps> = ({
  brandData,
  className = '',
  autoSave = false, // Brand work is usually saved manually
  onSave
}) => {
  const [saveTitle, setSaveTitle] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const { toast } = useToast()

  // Generate default title based on brand data
  useEffect(() => {
    if (brandData && !saveTitle) {
      const brandName = brandData.name || brandData.companyName || 'Brand'
      const currentDate = new Date().toLocaleDateString()
      setSaveTitle(`${brandName} Brand Identity - ${currentDate}`)
    }
  }, [brandData, saveTitle])

  const handleSave = async () => {
    if (!brandData || Object.keys(brandData).length === 0) {
      toast({
        title: "No data to synchronize.",
        description: "Create some brand work first to save it to your briefcase.",
        variant: "default"
      })
      return
    }

    if (!saveTitle.trim()) {
      toast({
        title: "Identification required. ✨",
        description: "Please enter a title for your brand work.",
        variant: "destructive"
      })
      return
    }

    setIsSaving(true)
    try {
      await briefcaseAutoSaver.saveBrandWork(saveTitle.trim(), brandData)
      
      toast({
        title: "Brand work saved! ✨",
        description: `Your brand identity has been saved to your briefcase.`
      })
      
      onSave?.(saveTitle.trim())
      setShowSaveDialog(false)
      
    } catch (error) {
      logError('Brand save error:', error)
      toast({
        title: "Save failed 💔",
        description: "Failed to save your brand work. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getBrandPreview = () => {
    if (!brandData) return null

    const items = []
    if (brandData.name) items.push(`Name: ${brandData.name}`)
    if (brandData.colors?.primary) items.push(`Primary Color: ${brandData.colors.primary}`)
    if (brandData.fonts?.primary) items.push(`Font: ${brandData.fonts.primary}`)
    if (brandData.tagline) items.push(`Tagline: ${brandData.tagline}`)
    
    return items.slice(0, 3).join(' • ')
  }

  return (
    <div className={className}>
      {/* Save Button */}
      <Button
        onClick={() => setShowSaveDialog(true)}
        variant="outline"
        className="flex items-center gap-2 bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200 hover:border-purple-300 hover:bg-gradient-to-r hover:from-pink-100 hover:to-purple-100 text-purple-700 hover:text-pink-700 transition-all duration-300 rounded-full"
      >
        <Palette size={16} />
        <span>Save Brand Work</span>
        <Crown size={12} className="opacity-70" />
      </Button>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-purple-200 shadow-lg shadow-purple-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-900">
                <Palette className="text-pink-600" size={20} />
                Save Brand Work
                <Sparkles className="text-teal-500" size={16} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Brand Preview */}
              {getBrandPreview() && (
                <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-700 font-medium">Preview:</p>
                  <p className="text-xs text-purple-600/80 mt-1">{getBrandPreview()}</p>
                </div>
              )}

              {/* Title Input */}
              <div>
                <label className="text-sm font-medium text-purple-900 flex items-center gap-2 mb-2">
                  <Heart size={12} className="text-pink-500" />
                  Title for your brand work
                </label>
                <Input
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder="Enter a title..."
                  className="border-purple-200 focus:ring-pink-400 focus:border-pink-400"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowSaveDialog(false)}
                  disabled={isSaving}
                  className="rounded-full"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !saveTitle.trim()}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-full flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-b-transparent"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>Save to Briefcase</span>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default BrandStudioSaveIntegration
