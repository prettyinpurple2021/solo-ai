"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Brain, Users, Target, CheckCircle, Save, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

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

  const safeDecisionSlug = useMemo(() => {
    const base = decision.trim() || "decision"
    return base.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-_]/g, "").toLowerCase()
  }, [decision])

  const updateSpadeData = (step: keyof SpadeStep, field: string, value: string | string[]) => {
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
    setSpadeData(prev => ({
      ...prev,
      alternatives: {
        ...prev.alternatives,
        options: [...prev.alternatives.options, newOption],
        pros: { ...prev.alternatives.pros, [newOption]: [] },
        cons: { ...prev.alternatives.cons, [newOption]: [] },
        feasibility: { ...prev.alternatives.feasibility, [newOption]: "medium" }
      }
    }))
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
    a.download = `spade-analysis-${safeDecisionSlug}.json`
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
            <span className="font-orbitron font-bold uppercase tracking-wider text-white">SPADE Framework (Type 1 Decisions)</span>
          </CardTitle>
          <CardDescription className="font-mono text-gray-300">
            Structured framework for making irreversible decisions: Setting, People, Alternatives, Decide, Explain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Decision Context */}
          <div>
            <Label htmlFor="decision" className="font-mono text-gray-300">Type 1 Decision</Label>
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
            <TabsList className="grid w-full grid-cols-5 bg-dark-bg border border-gray-800">
              {steps.map((step) => (
                <TabsTrigger
                  key={step.id}
                  value={step.id}
                  className="flex items-center gap-2 font-mono data-[state=active]:bg-dark-card data-[state=active]:text-neon-cyan"
                >
                  <step.icon className="w-4 h-4" />
                  {step.title}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Setting Tab */}
            <TabsContent value="setting" className="space-y-4">
              <div>
                <Label htmlFor="context" className="font-mono text-gray-300">Context & Background</Label>
                <Textarea
                  id="context"
                  placeholder="Describe the current situation and why this decision is needed..."
                  value={spadeData.setting.context}
                  onChange={(e) => updateSpadeData("setting", "context", e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label className="font-mono text-gray-300">Objectives</Label>
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
                        aria-label={`Remove objective ${index + 1}`}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => addArrayItem("setting", "objectives", "")}
                    aria-label="Add objective"
                  >
                    Add Objective
                  </Button>
                </div>
              </div>

              <div>
                <Label className="font-mono text-gray-300">Constraints</Label>
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
                        aria-label={`Remove constraint ${index + 1}`}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => addArrayItem("setting", "constraints", "")}
                    aria-label="Add constraint"
                  >
                    Add Constraint
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="timeline" className="font-mono text-gray-300">Timeline</Label>
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
                <Label htmlFor="decision-maker" className="font-mono text-gray-300">Decision Maker</Label>
                <Input
                  id="decision-maker"
                  placeholder="Who has the final authority to make this decision?"
                  value={spadeData.people.decisionMaker}
                  onChange={(e) => updateSpadeData("people", "decisionMaker", e.target.value)}
                />
              </div>

              <div>
                <Label className="font-mono text-gray-300">Stakeholders</Label>
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
                        aria-label={`Remove stakeholder ${index + 1}`}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => addArrayItem("people", "stakeholders", "")}
                    aria-label="Add stakeholder"
                  >
                    Add Stakeholder
                  </Button>
                </div>
              </div>

              <div>
                <Label className="font-mono text-gray-300">Advisors</Label>
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
                        aria-label={`Remove advisor ${index + 1}`}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => addArrayItem("people", "advisors", "")}
                    aria-label="Add advisor"
                  >
                    Add Advisor
                  </Button>
                </div>
              </div>

              <div>
                <Label className="font-mono text-gray-300">Affected Parties</Label>
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
                        aria-label={`Remove affected party ${index + 1}`}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => addArrayItem("people", "affectedParties", "")}
                    aria-label="Add affected party"
                  >
                    Add Affected Party
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Alternatives Tab */}
            <TabsContent value="alternatives" className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="font-mono text-gray-300">Decision Alternatives</Label>
                <Button onClick={addAlternative} variant="outline">
                  Add Alternative
                </Button>
              </div>

              {spadeData.alternatives.options.map((option) => (
                <Card key={option} className="bg-dark-card border border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-lg font-orbitron font-bold uppercase tracking-wider text-white">{option}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="font-mono text-gray-300">Feasibility</Label>
                      <select
                        className="w-full p-2 border border-gray-700 rounded-sm bg-dark-card text-gray-300 font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
                        value={spadeData.alternatives.feasibility[option] || "medium"}
                        onChange={(e) => {
                          setSpadeData(prev => ({
                            ...prev,
                            alternatives: {
                              ...prev.alternatives,
                              feasibility: {
                                ...prev.alternatives.feasibility,
                                [option]: e.target.value as "high" | "medium" | "low"
                              }
                            }
                          }))
                        }}
                        aria-label={`Feasibility for ${option}`}
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="font-mono text-gray-300">Pros</Label>
                        <div className="space-y-2">
                          {(spadeData.alternatives.pros[option] || []).map((pro, proIndex) => (
                            <div key={proIndex} className="flex gap-2">
                              <Input
                                value={pro}
                                onChange={(e) => {
                                  setSpadeData(prev => ({
                                    ...prev,
                                    alternatives: {
                                      ...prev.alternatives,
                                      pros: {
                                        ...prev.alternatives.pros,
                                        [option]: (prev.alternatives.pros[option] || []).map((pro, i) => 
                                          i === proIndex ? e.target.value : pro
                                        )
                                      }
                                    }
                                  }))
                                }}
                                placeholder="Enter pro..."
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSpadeData(prev => ({
                                    ...prev,
                                    alternatives: {
                                      ...prev.alternatives,
                                      pros: {
                                        ...prev.alternatives.pros,
                                        [option]: (prev.alternatives.pros[option] || []).filter((_, i) => i !== proIndex)
                                      }
                                    }
                                  }))
                                }}
                                aria-label={`Remove pro ${proIndex + 1} from ${option}`}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSpadeData(prev => ({
                                ...prev,
                                alternatives: {
                                  ...prev.alternatives,
                                  pros: {
                                    ...prev.alternatives.pros,
                                    [option]: [...(prev.alternatives.pros[option] || []), ""]
                                  }
                                }
                              }))
                            }}
                            aria-label={`Add pro to ${option}`}
                          >
                            Add Pro
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label className="font-mono text-gray-300">Cons</Label>
                        <div className="space-y-2">
                          {(spadeData.alternatives.cons[option] || []).map((con, conIndex) => (
                            <div key={conIndex} className="flex gap-2">
                              <Input
                                value={con}
                                onChange={(e) => {
                                  setSpadeData(prev => ({
                                    ...prev,
                                    alternatives: {
                                      ...prev.alternatives,
                                      cons: {
                                        ...prev.alternatives.cons,
                                        [option]: (prev.alternatives.cons[option] || []).map((con, i) => 
                                          i === conIndex ? e.target.value : con
                                        )
                                      }
                                    }
                                  }))
                                }}
                                placeholder="Enter con..."
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSpadeData(prev => ({
                                    ...prev,
                                    alternatives: {
                                      ...prev.alternatives,
                                      cons: {
                                        ...prev.alternatives.cons,
                                        [option]: (prev.alternatives.cons[option] || []).filter((_, i) => i !== conIndex)
                                      }
                                    }
                                  }))
                                }}
                                aria-label={`Remove con ${conIndex + 1} from ${option}`}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSpadeData(prev => ({
                                ...prev,
                                alternatives: {
                                  ...prev.alternatives,
                                  cons: {
                                    ...prev.alternatives.cons,
                                    [option]: [...(prev.alternatives.cons[option] || []), ""]
                                  }
                                }
                              }))
                            }}
                            aria-label={`Add con to ${option}`}
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
                <Label htmlFor="selected-option" className="font-mono text-gray-300">Selected Option</Label>
                <select
                  id="selected-option"
                  className="w-full p-2 border border-gray-700 rounded-sm bg-dark-card text-gray-300 font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
                  value={spadeData.decide.selectedOption}
                  onChange={(e) => updateSpadeData("decide", "selectedOption", e.target.value)}
                  aria-label="Select decision option"
                >
                  <option value="">Select an option...</option>
                  {spadeData.alternatives.options.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="rationale" className="font-mono text-gray-300">Decision Rationale</Label>
                <Textarea
                  id="rationale"
                  placeholder="Explain why this option was chosen..."
                  value={spadeData.decide.rationale}
                  onChange={(e) => updateSpadeData("decide", "rationale", e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="implementation" className="font-mono text-gray-300">Implementation Plan</Label>
                <Textarea
                  id="implementation"
                  placeholder="Outline the steps to implement this decision..."
                  value={spadeData.decide.implementationPlan}
                  onChange={(e) => updateSpadeData("decide", "implementationPlan", e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label className="font-mono text-gray-300">Success Metrics</Label>
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
                        aria-label={`Remove success metric ${index + 1}`}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => addArrayItem("decide", "successMetrics", "")}
                    aria-label="Add success metric"
                  >
                    Add Success Metric
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Explain Tab */}
            <TabsContent value="explain" className="space-y-4">
              <div>
                <Label htmlFor="communication-plan" className="font-mono text-gray-300">Communication Plan</Label>
                <Textarea
                  id="communication-plan"
                  placeholder="How will you communicate this decision to stakeholders?"
                  value={spadeData.explain.communicationPlan}
                  onChange={(e) => updateSpadeData("explain", "communicationPlan", e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="timeline" className="font-mono text-gray-300">Communication Timeline</Label>
                <Input
                  id="timeline"
                  placeholder="When and how will you communicate this decision?"
                  value={spadeData.explain.timeline}
                  onChange={(e) => updateSpadeData("explain", "timeline", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="feedback-mechanism" className="font-mono text-gray-300">Feedback Mechanism</Label>
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
                aria-label="Previous step"
              >
                Previous
              </Button>
              <Button
                onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                disabled={currentStep === steps.length - 1}
                aria-label="Next step"
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

      <Alert className="bg-dark-card border border-neon-cyan/40">
        <Brain className="h-4 w-4" />
        <AlertDescription>
          <strong>SPADE Framework Tip:</strong> This framework is designed for Type 1 (irreversible) decisions. 
          Take your time with each step to ensure thorough analysis and build true conviction before proceeding.
        </AlertDescription>
      </Alert>
    </div>
  )
} 