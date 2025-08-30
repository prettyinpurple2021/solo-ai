"use client"

import { useState } from "react"
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
  const [isAnalyzing, setIsAnalyzing] = useState(false)

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

  const analyzeRootCause = async () => {
    setIsAnalyzing(true)
    
    // Simulate AI analysis
    setTimeout(() => {
      const lastStep = whySteps[whySteps.length - 1]
      const identifiedRootCause = lastStep.answer || "Root cause not yet identified"
      setRootCause(identifiedRootCause)
      
      // Generate potential solutions based on the analysis
      const potentialSolutions = [
        "Implement systematic process improvements",
        "Add training and skill development programs",
        "Establish clear communication protocols",
        "Create accountability and monitoring systems",
        "Develop contingency plans and backup procedures"
      ]
      setSolutions(potentialSolutions)
      
      setIsAnalyzing(false)
    }, 2000)
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Five Whys Root Cause Analysis
          </CardTitle>
          <CardDescription>
            Systematic problem-solving technique to drill down to the root cause of issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Problem Definition */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="problem">Problem Statement</Label>
              <Input
                id="problem"
                placeholder="e.g., Customer satisfaction scores are declining"
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="context">Context & Background</Label>
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
              <Label className="text-lg font-semibold">The Five Whys</Label>
              <Button onClick={addWhyStep} variant="outline" disabled={whySteps.length >= 5}>
                Add Why Step
              </Button>
            </div>

            {whySteps.map((step, index) => (
              <Card key={index} className="border-l-4 border-purple-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-purple-600" />
                    Why {index + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor={`why-${index}`}>Why is this happening?</Label>
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
                      <Label>Key Insights</Label>
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
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addArrayItem(index, 'insights', '')}
                        >
                          Add Insight
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label>Potential Solutions</Label>
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
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addArrayItem(index, 'potentialSolutions', '')}
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
                disabled={isAnalyzing}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Root Cause"}
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-red-600" />
                    Identified Root Cause
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <p className="text-red-800 font-medium">{rootCause}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-600" />
                    Recommended Solutions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {solutions.map((solution, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                        <Badge variant="outline" className="mt-1">{index + 1}</Badge>
                        <span className="text-yellow-800">{solution}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Implementation Plan</CardTitle>
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

      <Alert>
        <Brain className="h-4 w-4" />
        <AlertDescription>
          <strong>Five Whys Tip:</strong> Keep asking &quot;why&quot; until you reach the root cause. The goal is to identify 
          the fundamental issue, not just symptoms. Usually, 5 iterations are sufficient, but you may need more or fewer.
        </AlertDescription>
      </Alert>
    </div>
  )
} 