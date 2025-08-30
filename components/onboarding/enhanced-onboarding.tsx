"use client"

import { useState } from "react"
import { OnboardingWizard } from "./onboarding-wizard"
import { InteractiveTutorial } from "./interactive-tutorial"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Lightbulb
} from "lucide-react"

interface EnhancedOnboardingProps {
  open: boolean
  onComplete: (data: Record<string, unknown>) => void
  onSkip: () => void
  userData?: Record<string, unknown>
}

export function EnhancedOnboarding({ open, onComplete, onSkip, userData: _userData }: EnhancedOnboardingProps) {
  const [currentPhase, setCurrentPhase] = useState<"wizard" | "tutorial" | "complete">("wizard")
  const [onboardingData, setOnboardingData] = useState<any>(null)
  const [tutorialType, setTutorialType] = useState<"dashboard" | "ai-agents" | "tasks" | "goals" | "files" | "complete">("dashboard")
  const [completedTutorials, setCompletedTutorials] = useState<string[]>([])
  const [showTutorial, setShowTutorial] = useState(false)

  const totalPhases = 3
  const currentPhaseIndex = currentPhase === "wizard" ? 0 : currentPhase === "tutorial" ? 1 : 2
  const _progress = ((currentPhaseIndex + 1) / totalPhases) * 100

  const tutorialOrder = ["dashboard", "ai-agents", "tasks", "goals", "files", "complete"]

  const handleWizardComplete = (data: Record<string, unknown>) => {
    setOnboardingData(data)
    setCurrentPhase("tutorial")
    setShowTutorial(true)
  }

  const handleTutorialComplete = () => {
    setCompletedTutorials(prev => [...prev, tutorialType])
    
    const currentIndex = tutorialOrder.indexOf(tutorialType)
    const nextTutorial = tutorialOrder[currentIndex + 1]
    
    if (nextTutorial) {
      setTutorialType(nextTutorial as any)
      // Small delay to show completion before next tutorial
      setTimeout(() => {
        setShowTutorial(true)
      }, 500)
    } else {
      setCurrentPhase("complete")
      setShowTutorial(false)
    }
  }

  const handleTutorialSkip = () => {
    setShowTutorial(false)
    setCurrentPhase("complete")
  }

  const handleComplete = () => {
    const finalData = {
      ...onboardingData,
      completedTutorials,
      onboardingCompleted: true,
      completionDate: new Date().toISOString()
    }
    onComplete(finalData)
  }

  const getTutorialProgress = () => {
    return (completedTutorials.length / (tutorialOrder.length - 1)) * 100 // -1 for "complete"
  }

  const renderTutorialProgress = () => {
    if (currentPhase !== "tutorial") return null

    return (
      <div className="fixed top-4 right-4 z-50">
        <Card className="w-64 border-2 border-purple-200 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-purple-600" />
              Tutorial Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={getTutorialProgress()} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{completedTutorials.length} of {tutorialOrder.length - 1} completed</span>
              <span>{Math.round(getTutorialProgress())}%</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {tutorialOrder.slice(0, -1).map((tutorial) => (
                <div
                  key={tutorial}
                  className={`flex items-center gap-1 p-1 rounded ${
                    completedTutorials.includes(tutorial)
                      ? "bg-green-50 text-green-700"
                      : tutorialType === tutorial
                      ? "bg-purple-50 text-purple-700"
                      : "bg-gray-50 text-gray-500"
                  }`}
                >
                  {completedTutorials.includes(tutorial) ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : tutorialType === tutorial ? (
                    <Play className="h-3 w-3" />
                  ) : (
                    <div className="h-3 w-3 rounded-full bg-gray-300" />
                  )}
                  <span className="capitalize">{tutorial.replace("-", " ")}</span>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTutorialSkip}
              className="w-full text-xs"
            >
              <SkipForward className="h-3 w-3 mr-1" />
              Skip All Tutorials
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderCompletion = () => {
    return (
      <div className="space-y-6 text-center">
        <div className="w-24 h-24 mx-auto bg-gradient-to-r from-purple-500 via-pink-500 to-teal-500 rounded-full flex items-center justify-center">
          <Rocket className="h-12 w-12 text-white" />
        </div>
        
        <div>
          <h2 className="text-3xl font-bold boss-heading mb-2">Welcome to Your Empire! 👑</h2>
          <p className="text-lg text-muted-foreground mb-6">
            You've completed the onboarding and tutorials. Your SoloBoss AI platform is ready to help you dominate your industry!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="boss-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-purple-600" />
                Your Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Business Type:</span>
                <Badge variant="outline">{onboardingData?.personalInfo?.businessType}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Goals Set:</span>
                <Badge variant="outline">{onboardingData?.goals?.primaryGoals?.length || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">AI Agents:</span>
                <Badge variant="outline">{onboardingData?.aiTeam?.selectedAgents?.length || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Tutorials Completed:</span>
                <Badge variant="outline">{completedTutorials.length}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="boss-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-pink-600" />
                Welcome Bonus
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                <p className="text-sm font-medium">🎉 Free Premium Trial</p>
                <p className="text-xs text-muted-foreground">7 days of all features</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg">
                <p className="text-sm font-medium">🚀 AI Agent Credits</p>
                <p className="text-xs text-muted-foreground">100 bonus conversations</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
                <p className="text-sm font-medium">📚 Premium Templates</p>
                <p className="text-xs text-muted-foreground">Access to 50+ templates</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold">What's Next?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-semibold mb-1">Chat with AI</h4>
              <p className="text-sm text-muted-foreground">Start a conversation with your AI squad</p>
            </div>
            <div className="p-4 bg-pink-50 rounded-lg">
              <Target className="h-8 w-8 text-pink-600 mx-auto mb-2" />
              <h4 className="font-semibold mb-1">Create Tasks</h4>
              <p className="text-sm text-muted-foreground">Set up your first tasks and goals</p>
            </div>
            <div className="p-4 bg-teal-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-teal-600 mx-auto mb-2" />
              <h4 className="font-semibold mb-1">Track Progress</h4>
              <p className="text-sm text-muted-foreground">Monitor your productivity metrics</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-lg font-semibold empowering-text">
          <Sparkles className="h-5 w-5" />
          Ready to dominate your industry!
          <Sparkles className="h-5 w-5" />
        </div>

        <Button
          onClick={handleComplete}
          className="punk-button text-white text-lg px-8 py-4"
          size="lg"
        >
          <Rocket className="h-5 w-5 mr-2" />
          Launch Your Empire!
        </Button>
      </div>
    )
  }

  if (!open) return null

  return (
    <>
      {currentPhase === "wizard" && (
        <OnboardingWizard
          open={open}
          onComplete={handleWizardComplete}
          onSkip={onSkip}
        />
      )}

      {currentPhase === "tutorial" && (
        <InteractiveTutorial
          open={showTutorial}
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialSkip}
          tutorialType={tutorialType}
        />
      )}

      {currentPhase === "complete" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto boss-card border-2 border-purple-200">
            <CardContent className="p-8">
              {renderCompletion()}
            </CardContent>
          </Card>
        </div>
      )}

      {renderTutorialProgress()}
    </>
  )
}
