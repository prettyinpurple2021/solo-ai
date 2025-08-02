"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Brain, Users, Target, CheckCircle, Save, AlertTriangle } from "lucide-react"

interface SpadeStep {
  setting: {
    context: string
    objectives: string[]
    constraints: string[]
    timeline: string
  }
  people: {
    stakeholders: string[]
    decisionMaker: string
    advisors: string[]
    affectedParties: string[]
  }
  alternatives: {
    options: string[]
    pros: Record<string, string[]>
    cons: Record<string, string[]>
    feasibility: Record<string, "high" | "medium" | "low">
  }
  decide: {
    selectedOption: string
    rationale: string
    implementationPlan: string
    successMetrics: string[]
  }
  explain: {
    communicationPlan: string
    stakeholderMessages: Record<string, string>
    timeline: string
    feedbackMechanism: string
  }
}

export function SpadeFramework() {
  const [decision, setDecision] = useState("")
  const [currentStep, setCurrentStep] = useState(0)
  const [spadeData, setSpadeData] = useState<SpadeStep>({
    setting: {
      context: "",
      objectives: [],
      constraints: [],
      timeline: ""
    },
    people: {
      stakeholders: [],
      decisionMaker: "",
      advisors: [],
      affectedParties: []
    },
    alternatives: {
      options: [],
      pros: {},
      cons: {},
      feasibility: {}
    },
    decide: {
      selectedOption: "",
      rationale: "",
      implementationPlan: "",
      successMetrics: []
    },
    explain: {
      communicationPlan: "",
      stakeholderMessages: {},
      timeline: "",
      feedbackMechanism: ""
    }
  })

  const steps = [
    { id: "setting", title: "Setting", icon: Target },
    { id: "people", title: "People", icon: Users },
    { id: "alternatives", title: "Alternatives", icon: Brain },
    { id: "decide", title: "Decide", icon: CheckCircle },
    { id: "explain", title: "Explain", icon: AlertTriangle }
  ]

  const updateSpadeData = (step: keyof SpadeStep, field: string, value: any) => {
    setSpadeData(prev => ({
      ...prev,
      [step]: {
        ...prev[step],
        [field]: value
      }
    }))
  }

  const addArrayItem = (step: keyof SpadeStep, field: string, item: string) => {
    const currentArray = spadeData[step][field as keyof typeof spadeData[typeof step]] as string[]
    updateSpadeData(step, field, [...currentArray, item])
  }

  const removeArrayItem = (step: keyof SpadeStep, field: string, index: number) => {
    const currentArray = spadeData[step][field as keyof typeof spadeData[typeof step]] as string[]
    updateSpadeData(step, field, currentArray.filter((_, i) => i !== index))
  }

  const addAlternative = () => {
    const newOption = `Option ${spadeData.alternatives.options.length + 1}`
    updateSpadeData("alternatives", "options", [...spadeData.alternatives.options, newOption])
    updateSpadeData("alternatives", "pros", { ...spadeData.alternatives.pros, [newOption]: [] })
    updateSpadeData("alternatives", "cons", { ...spadeData.alternatives.cons, [newOption]: [] })
    updateSpadeData("alternatives", "feasibility", { ...spadeData.alternatives.feasibility, [newOption]: "medium" })
  }

  const getFeasibilityColor = (feasibility: string) => {
    switch (feasibility) {
      case "high": return "bg-green-100 text-green-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "low": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const saveSpadeAnalysis = () => {
    const analysisData = {
      decision,
      spadeData,
      completedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(analysisData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `spade-analysis-${decision.replace(/\s+/g, '-').toLowerCase()}.json`
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
            SPADE Framework for Type 1 Decisions
          </CardTitle>
          <CardDescription>
            Structured framework for making irreversible decisions: Setting, People, Alternatives, Decide, Explain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Decision Context */}
          <div>
            <Label htmlFor="decision">Type 1 Decision</Label>
            <Input
              id="decision"
              placeholder="e.g., Should we pivot our business model?"
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
            />
          </div>

          {/* SPADE Steps */}
          <Tabs value={steps[currentStep].id} onValueChange={(value) => {
            const index = steps.findIndex(step => step.id === value)
            setCurrentStep(index)
          }}>
            <TabsList className="grid w-full grid-cols-5">
              {steps.map((step, index) => (
                <TabsTrigger key={step.id} value={step.id} className="flex items-center gap-2">
                  <step.icon className="w-4 h-4" />
                  {step.title}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Setting Tab */}
            <TabsContent value="setting" className="space-y-4">
              <div>
                <Label htmlFor="context">Context & Background</Label>
                <Textarea
                  id="context"
                  placeholder="Describe the current situation and why this decision is needed..."
                  value={spadeData.setting.context}
                  onChange={(e) => updateSpadeData("setting", "context", e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label>Objectives</Label>
                <div className="space-y-2">
                  {spadeData.setting.objectives.map((objective, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={objective}
                        onChange={(e) => {
                          const newObjectives = [...spadeData.setting.objectives]
                          newObjectives[index] = e.target.value
                          updateSpadeData("setting", "objectives", newObjectives)
                        }}
                        placeholder="Enter objective..."
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem("setting", "objectives", index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => addArrayItem("setting", "objectives", "")}
                  >
                    Add Objective
                  </Button>
                </div>
              </div>

              <div>
                <Label>Constraints</Label>
                <div className="space-y-2">
                  {spadeData.setting.constraints.map((constraint, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={constraint}
                        onChange={(e) => {
                          const newConstraints = [...spadeData.setting.constraints]
                          newConstraints[index] = e.target.value
                          updateSpadeData("setting", "constraints", newConstraints)
                        }}
                        placeholder="Enter constraint..."
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem("setting", "constraints", index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => addArrayItem("setting", "constraints", "")}
                  >
                    Add Constraint
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="timeline">Timeline</Label>
                <Input
                  id="timeline"
                  placeholder="e.g., Decision needed within 30 days"
                  value={spadeData.setting.timeline}
                  onChange={(e) => updateSpadeData("setting", "timeline", e.target.value)}
                />
              </div>
            </TabsContent>

            {/* People Tab */}
            <TabsContent value="people" className="space-y-4">
              <div>
                <Label htmlFor="decision-maker">Decision Maker</Label>
                <Input
                  id="decision-maker"
                  placeholder="Who has the final authority to make this decision?"
                  value={spadeData.people.decisionMaker}
                  onChange={(e) => updateSpadeData("people", "decisionMaker", e.target.value)}
                />
              </div>

              <div>
                <Label>Stakeholders</Label>
                <div className="space-y-2">
                  {spadeData.people.stakeholders.map((stakeholder, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={stakeholder}
                        onChange={(e) => {
                          const newStakeholders = [...spadeData.people.stakeholders]
                          newStakeholders[index] = e.target.value
                          updateSpadeData("people", "stakeholders", newStakeholders)
                        }}
                        placeholder="Enter stakeholder..."
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem("people", "stakeholders", index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => addArrayItem("people", "stakeholders", "")}
                  >
                    Add Stakeholder
                  </Button>
                </div>
              </div>

              <div>
                <Label>Advisors</Label>
                <div className="space-y-2">
                  {spadeData.people.advisors.map((advisor, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={advisor}
                        onChange={(e) => {
                          const newAdvisors = [...spadeData.people.advisors]
                          newAdvisors[index] = e.target.value
                          updateSpadeData("people", "advisors", newAdvisors)
                        }}
                        placeholder="Enter advisor..."
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem("people", "advisors", index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => addArrayItem("people", "advisors", "")}
                  >
                    Add Advisor
                  </Button>
                </div>
              </div>

              <div>
                <Label>Affected Parties</Label>
                <div className="space-y-2">
                  {spadeData.people.affectedParties.map((party, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={party}
                        onChange={(e) => {
                          const newParties = [...spadeData.people.affectedParties]
                          newParties[index] = e.target.value
                          updateSpadeData("people", "affectedParties", newParties)
                        }}
                        placeholder="Enter affected party..."
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem("people", "affectedParties", index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => addArrayItem("people", "affectedParties", "")}
                  >
                    Add Affected Party
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Alternatives Tab */}
            <TabsContent value="alternatives" className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Decision Alternatives</Label>
                <Button onClick={addAlternative} variant="outline">
                  Add Alternative
                </Button>
              </div>

              {spadeData.alternatives.options.map((option, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{option}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Feasibility</Label>
                      <select
                        className="w-full p-2 border rounded"
                        value={spadeData.alternatives.feasibility[option] || "medium"}
                        onChange={(e) => {
                          const newFeasibility = { ...spadeData.alternatives.feasibility }
                          newFeasibility[option] = e.target.value as "high" | "medium" | "low"
                          updateSpadeData("alternatives", "feasibility", newFeasibility)
                        }}
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Pros</Label>
                        <div className="space-y-2">
                          {(spadeData.alternatives.pros[option] || []).map((pro, proIndex) => (
                            <div key={proIndex} className="flex gap-2">
                              <Input
                                value={pro}
                                onChange={(e) => {
                                  const newPros = { ...spadeData.alternatives.pros }
                                  newPros[option] = [...(newPros[option] || [])]
                                  newPros[option][proIndex] = e.target.value
                                  updateSpadeData("alternatives", "pros", newPros)
                                }}
                                placeholder="Enter pro..."
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newPros = { ...spadeData.alternatives.pros }
                                  newPros[option] = (newPros[option] || []).filter((_, i) => i !== proIndex)
                                  updateSpadeData("alternatives", "pros", newPros)
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newPros = { ...spadeData.alternatives.pros }
                              newPros[option] = [...(newPros[option] || []), ""]
                              updateSpadeData("alternatives", "pros", newPros)
                            }}
                          >
                            Add Pro
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label>Cons</Label>
                        <div className="space-y-2">
                          {(spadeData.alternatives.cons[option] || []).map((con, conIndex) => (
                            <div key={conIndex} className="flex gap-2">
                              <Input
                                value={con}
                                onChange={(e) => {
                                  const newCons = { ...spadeData.alternatives.cons }
                                  newCons[option] = [...(newCons[option] || [])]
                                  newCons[option][conIndex] = e.target.value
                                  updateSpadeData("alternatives", "cons", newCons)
                                }}
                                placeholder="Enter con..."
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newCons = { ...spadeData.alternatives.cons }
                                  newCons[option] = (newCons[option] || []).filter((_, i) => i !== conIndex)
                                  updateSpadeData("alternatives", "cons", newCons)
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newCons = { ...spadeData.alternatives.cons }
                              newCons[option] = [...(newCons[option] || []), ""]
                              updateSpadeData("alternatives", "cons", newCons)
                            }}
                          >
                            Add Con
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Decide Tab */}
            <TabsContent value="decide" className="space-y-4">
              <div>
                <Label htmlFor="selected-option">Selected Option</Label>
                <select
                  id="selected-option"
                  className="w-full p-2 border rounded"
                  value={spadeData.decide.selectedOption}
                  onChange={(e) => updateSpadeData("decide", "selectedOption", e.target.value)}
                >
                  <option value="">Select an option...</option>
                  {spadeData.alternatives.options.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="rationale">Decision Rationale</Label>
                <Textarea
                  id="rationale"
                  placeholder="Explain why this option was chosen..."
                  value={spadeData.decide.rationale}
                  onChange={(e) => updateSpadeData("decide", "rationale", e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="implementation">Implementation Plan</Label>
                <Textarea
                  id="implementation"
                  placeholder="Outline the steps to implement this decision..."
                  value={spadeData.decide.implementationPlan}
                  onChange={(e) => updateSpadeData("decide", "implementationPlan", e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label>Success Metrics</Label>
                <div className="space-y-2">
                  {spadeData.decide.successMetrics.map((metric, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={metric}
                        onChange={(e) => {
                          const newMetrics = [...spadeData.decide.successMetrics]
                          newMetrics[index] = e.target.value
                          updateSpadeData("decide", "successMetrics", newMetrics)
                        }}
                        placeholder="Enter success metric..."
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem("decide", "successMetrics", index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => addArrayItem("decide", "successMetrics", "")}
                  >
                    Add Success Metric
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Explain Tab */}
            <TabsContent value="explain" className="space-y-4">
              <div>
                <Label htmlFor="communication-plan">Communication Plan</Label>
                <Textarea
                  id="communication-plan"
                  placeholder="How will you communicate this decision to stakeholders?"
                  value={spadeData.explain.communicationPlan}
                  onChange={(e) => updateSpadeData("explain", "communicationPlan", e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="timeline">Communication Timeline</Label>
                <Input
                  id="timeline"
                  placeholder="When and how will you communicate this decision?"
                  value={spadeData.explain.timeline}
                  onChange={(e) => updateSpadeData("explain", "timeline", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="feedback-mechanism">Feedback Mechanism</Label>
                <Textarea
                  id="feedback-mechanism"
                  placeholder="How will you collect and address feedback on this decision?"
                  value={spadeData.explain.feedbackMechanism}
                  onChange={(e) => updateSpadeData("explain", "feedbackMechanism", e.target.value)}
                  rows={3}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Navigation and Save */}
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              <Button
                onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                disabled={currentStep === steps.length - 1}
              >
                Next
              </Button>
            </div>
            <Button onClick={saveSpadeAnalysis} variant="outline">
              <Save className="w-4 h-4 mr-2" />
              Save Analysis
            </Button>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Brain className="h-4 w-4" />
        <AlertDescription>
          <strong>SPADE Framework Tip:</strong> This framework is designed for Type 1 (irreversible) decisions. 
          Take your time with each step to ensure thorough analysis and build true conviction before proceeding.
        </AlertDescription>
      </Alert>
    </div>
  )
} 