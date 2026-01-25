"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Settings, Lightbulb, Zap, Target, FileText, MessageCircle, TrendingUp } from "lucide-react"
import { logInfo } from "@/lib/logger"

interface TipSettingsProps {
  open: boolean
  onClose: () => void
}

export function TipSettings({ open, onClose }: TipSettingsProps) {
  const [preferences, setPreferences] = useState({
    tipsEnabled: true,
    tipFrequency: "medium" as "low" | "medium" | "high",
    categories: {
      productivity: true,
      ai: true,
      goals: true,
      tasks: true,
      navigation: true,
      features: true
    }
  })

  // Load preferences on mount
  useEffect(() => {
    const saved = localStorage.getItem('smart-tip-preferences')
    if (saved) {
      try {
        setPreferences(JSON.parse(saved))
      } catch (error) {
        logInfo('Failed to load tip preferences:', error)
      }
    }
  }, [])

  // Save preferences when they change
  useEffect(() => {
    localStorage.setItem('smart-tip-preferences', JSON.stringify(preferences))
  }, [preferences])

  const handleToggleCategory = (category: keyof typeof preferences.categories) => {
    setPreferences(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: !prev.categories[category]
      }
    }))
  }

  const handleReset = () => {
    setPreferences({
      tipsEnabled: true,
      tipFrequency: "medium",
      categories: {
        productivity: true,
        ai: true,
        goals: true,
        tasks: true,
        navigation: true,
        features: true
      }
    })
  }

  const categoryInfo = [
    { key: 'productivity', label: 'Productivity Tips', icon: Zap, color: 'bg-neon-cyan' },
    { key: 'ai', label: 'AI Assistance', icon: MessageCircle, color: 'bg-neon-purple' },
    { key: 'goals', label: 'Goal Setting', icon: Target, color: 'bg-neon-lime' },
    { key: 'tasks', label: 'Task Management', icon: FileText, color: 'bg-neon-orange' },
    { key: 'navigation', label: 'Navigation', icon: TrendingUp, color: 'bg-gray-600' },
    { key: 'features', label: 'Features', icon: Lightbulb, color: 'bg-neon-magenta' }
  ]

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="border-2 border-neon-cyan shadow-[0_0_30px_rgba(11,228,236,0.3)]">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-sm bg-neon-cyan/20 border border-neon-cyan flex items-center justify-center">
                    <Settings className="h-4 w-4 text-neon-cyan" />
                  </div>
                  Smart Tip Settings
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0 text-gray-500 hover:text-neon-cyan"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Main toggle */}
              <div className="flex items-center justify-between p-4 border-2 border-gray-700 hover:border-neon-cyan rounded-sm transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-sm bg-neon-purple/20 border border-neon-purple flex items-center justify-center">
                    <Lightbulb className="h-5 w-5 text-neon-purple" />
                  </div>
                  <div>
                    <h3 className="font-mono font-semibold text-white">Enable Smart Tips</h3>
                    <p className="text-sm font-mono text-gray-400">
                      Get contextual advice when you might need help
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences.tipsEnabled}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, tipsEnabled: checked }))
                  }
                />
              </div>

              {preferences.tipsEnabled && (
                <>
                  {/* Frequency setting */}
                  <div className="space-y-3">
                    <Label>Tip Frequency</Label>
                    <Select
                      value={preferences.tipFrequency}
                      onValueChange={(value: "low" | "medium" | "high") =>
                        setPreferences(prev => ({ ...prev, tipFrequency: value }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">
                          <div className="flex items-center gap-2">
                            <Badge variant="cyan" className="text-xs">Low</Badge>
                            <span>1-2 tips per hour</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="medium">
                          <div className="flex items-center gap-2">
                            <Badge variant="orange" className="text-xs">Medium</Badge>
                            <span>2-3 tips per hour</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="high">
                          <div className="flex items-center gap-2">
                            <Badge variant="magenta" className="text-xs">High</Badge>
                            <span>3-5 tips per hour</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Category toggles */}
                  <div className="space-y-4">
                    <Label>Tip Categories</Label>
                    <div className="grid gap-3">
                      {categoryInfo.map((category) => (
                        <div
                          key={category.key}
                          className="flex items-center justify-between p-3 border-2 border-gray-700 hover:border-neon-cyan rounded-sm transition-all duration-200"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-sm ${category.color} flex items-center justify-center`}>
                              <category.icon className="h-4 w-4 text-dark-bg" />
                            </div>
                            <div>
                              <h4 className="font-mono font-medium text-sm text-white">{category.label}</h4>
                              <p className="text-xs font-mono text-gray-500">
                                {category.key === 'productivity' && 'Time management and efficiency tips'}
                                {category.key === 'ai' && 'AI usage and optimization advice'}
                                {category.key === 'goals' && 'Goal setting and achievement strategies'}
                                {category.key === 'tasks' && 'Task organization and completion tips'}
                                {category.key === 'navigation' && 'App navigation and feature discovery'}
                                {category.key === 'features' && 'Hidden features and advanced functionality'}
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={preferences.categories[category.key as keyof typeof preferences.categories]}
                            onCheckedChange={() => handleToggleCategory(category.key as keyof typeof preferences.categories)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  size="sm"
                >
                  Reset to Defaults
                </Button>
                <Button
                  onClick={onClose}
                  variant="cyan"
                  size="sm"
                >
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
