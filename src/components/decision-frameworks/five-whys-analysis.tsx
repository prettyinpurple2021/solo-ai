"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Brain, Search, Target, Save, Lightbulb } from "lucide-react"


interface WhyStep {
  question: string
  answer: string
  insights: string[]
  potentialSolutions: string[]
}

interface _FiveWhysAnalysis {
  problem: string
  context: string
  whySteps: WhyStep[]
  rootCause: string
  solutions: string[]
  implementationPlan: string
}

export function FiveWhysAnalysis() {
  const [problem, setProblem] = useState("")
  const [context, setContext] = useState("")
  const [whySteps, setWhySteps] = useState<WhyStep[]>([])
  const [rootCause, setRootCause] = useState("")
  const [solutions, setSolutions] = useState<string[]>([])
  const [implementationPlan, setImplementationPlan] = useState("")

  const addWhyStep = () => {
    const stepNumber = whySteps.length + 1
    const newStep: WhyStep = {
      question: `Why ${stepNumber}:`,
      answer: "",
      insights: [],
      potentialSolutions: []
    }
    setWhySteps([...whySteps, newStep])
  }

  const updateWhyStep = (index: number, field: keyof WhyStep, value: string | string[]) => {
    const newSteps = [...whySteps]
    newSteps[index] = { ...newSteps[index], [field]: value }
    setWhySteps(newSteps)
  }

  const addArrayItem = (stepIndex: number, field: keyof WhyStep, item: string) => {
    const step = whySteps[stepIndex]
    const currentArray = step[field] as string[]
    updateWhyStep(stepIndex, field, [...currentArray, item])
  }

  const removeArrayItem = (stepIndex: number, field: keyof WhyStep, itemIndex: number) => {
    const step = whySteps[stepIndex]
    const currentArray = step[field] as string[]
    updateWhyStep(stepIndex, field, currentArray.filter((_, i) => i !== itemIndex))
  }

  const derivedRootCause = useMemo(() => {
    const lastNonEmpty = [...whySteps].reverse().find((s) => s.answer.trim().length > 0)
    return lastNonEmpty?.answer.trim() || ""
  }, [whySteps])

  const derivedSolutions = useMemo(() => {
    const collected: string[] = []
    for (const step of whySteps) {
      for (const s of step.potentialSolutions) {
        const trimmed = s.trim()
        if (trimmed) collected.push(trimmed)
      }
    }
    // Dedupe preserving order
    const seen = new Set<string>()
    return collected.filter((s) => {
      if (seen.has(s.toLowerCase())) return false
      seen.add(s.toLowerCase())
      return true
    })
  }, [whySteps])

  const analyzeRootCause = () => {
    // Deterministic analysis from user input (no simulated delays / placeholders)
    setRootCause(derivedRootCause || "Root cause not yet identified")
    setSolutions(derivedSolutions)
  }

  const saveAnalysis = () => {
    const analysisData: _FiveWhysAnalysis = {
      problem,
      context,
      whySteps,
      rootCause,
      solutions,
      implementationPlan
    }
    
    const blob = new Blob([JSON.stringify(analysisData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `five-whys-analysis-${problem.replace(/\s+/g, '-').toLowerCase()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card className="bg-dark-card border border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-neon-purple" />
            <span className="font-orbitron font-bold uppercase tracking-wider text-white">Five Whys Root Cause Analysis</span>
          </CardTitle>
          <CardDescription className="font-mono text-gray-300">
            Systematic problem-solving technique to drill down to the root cause of issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Problem Definition */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="problem" className="font-mono text-gray-300">Problem Statement</Label>
              <Input
                id="problem"
                placeholder="e.g., Customer satisfaction scores are declining"
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="context" className="font-mono text-gray-300">Context & Background</Label>
              <Textarea
                id="context"
                placeholder="Provide context about when this problem occurs, who it affects, and its impact..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Five Whys Steps */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-lg font-orbitron font-bold uppercase tracking-wider text-white">The Five Whys</Label>
              <Button onClick={addWhyStep} variant="outline" disabled={whySteps.length >= 5}>
                Add Why Step
              </Button>
            </div>

            {whySteps.map((step, index) => (
              <Card key={index} className="bg-dark-card border border-gray-700 border-l-4 border-neon-purple">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-neon-purple" />
                    <span className="font-orbitron font-bold uppercase tracking-wider text-white">Why {index + 1}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor={`why-${index}`} className="font-mono text-gray-300">Why is this happening?</Label>
                    <Textarea
                      id={`why-${index}`}
                      placeholder={`Why ${index + 1}: ${index === 0 ? problem : whySteps[index - 1]?.answer || ''}`}
                      value={step.answer}
                      onChange={(e) => updateWhyStep(index, 'answer', e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="font-mono text-gray-300">Key Insights</Label>
                      <div className="space-y-2">
                        {step.insights.map((insight, insightIndex) => (
                          <div key={insightIndex} className="flex gap-2">
                            <Input
                              value={insight}
                              onChange={(e) => {
                                const newInsights = [...step.insights]
                                newInsights[insightIndex] = e.target.value
                                updateWhyStep(index, 'insights', newInsights)
                              }}
                              placeholder="Enter insight..."
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeArrayItem(index, 'insights', insightIndex)}
                              aria-label={`Remove insight ${insightIndex + 1} from why ${index + 1}`}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addArrayItem(index, 'insights', '')}
                          aria-label={`Add insight to why ${index + 1}`}
                        >
                          Add Insight
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="font-mono text-gray-300">Potential Solutions</Label>
                      <div className="space-y-2">
                        {step.potentialSolutions.map((solution, solutionIndex) => (
                          <div key={solutionIndex} className="flex gap-2">
                            <Input
                              value={solution}
                              onChange={(e) => {
                                const newSolutions = [...step.potentialSolutions]
                                newSolutions[solutionIndex] = e.target.value
                                updateWhyStep(index, 'potentialSolutions', newSolutions)
                              }}
                              placeholder="Enter potential solution..."
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeArrayItem(index, 'potentialSolutions', solutionIndex)}
                              aria-label={`Remove potential solution ${solutionIndex + 1} from why ${index + 1}`}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addArrayItem(index, 'potentialSolutions', '')}
                          aria-label={`Add potential solution to why ${index + 1}`}
                        >
                          Add Solution
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Analysis Button */}
          {whySteps.length >= 3 && (
            <div className="flex gap-4">
              <Button 
                onClick={analyzeRootCause}
                className="bg-neon-purple hover:bg-neon-purple/80"
                aria-label="Analyze root cause"
              >
                Analyze Root Cause
              </Button>
              <Button variant="outline" onClick={saveAnalysis}>
                <Save className="w-4 h-4 mr-2" />
                Save Analysis
              </Button>
            </div>
          )}

          {/* Root Cause & Solutions */}
          {(rootCause || solutions.length > 0) && (
            <div className="space-y-4">
              <Card className="bg-dark-card border border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-neon-magenta" />
                    <span className="font-orbitron font-bold uppercase tracking-wider text-white">Identified Root Cause</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-dark-card p-4 rounded-sm border border-neon-magenta/60">
                    <p className="text-gray-300 font-mono">{rootCause}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-dark-card border border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-neon-orange" />
                    <span className="font-orbitron font-bold uppercase tracking-wider text-white">Recommended Solutions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {solutions.map((solution, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-dark-card border border-gray-700 rounded-sm">
                        <Badge variant="outline" className="mt-1 bg-dark-card border border-neon-orange text-neon-orange font-mono">
                          {index + 1}
                        </Badge>
                        <span className="text-gray-300 font-mono">{solution}</span>
                      </div>
                    ))}
                    {solutions.length === 0 && (
                      <div className="text-sm font-mono text-gray-500">
                        Add “Potential Solutions” in any Why step, then run “Analyze Root Cause”.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-dark-card border border-gray-700">
                <CardHeader>
                  <CardTitle className="font-orbitron font-bold uppercase tracking-wider text-white">Implementation Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Outline the steps to implement the recommended solutions..."
                    value={implementationPlan}
                    onChange={(e) => setImplementationPlan(e.target.value)}
                    rows={4}
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      <Alert className="bg-dark-card border border-neon-cyan/40">
        <Brain className="h-4 w-4" />
        <AlertDescription>
          <strong>Five Whys Tip:</strong> Keep asking &quot;why&quot; until you reach the root cause. The goal is to identify 
          the fundamental issue, not just symptoms. Usually, 5 iterations are sufficient, but you may need more or fewer.
        </AlertDescription>
      </Alert>
    </div>
  )
} 
