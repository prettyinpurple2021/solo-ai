"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Brain, TrendingUp, TrendingDown, Shield, Save, Download } from "lucide-react"

interface DecisionOption {
  id: string
  name: string
  description: string
  costs: string[]
  benefits: string[]
  mitigations: string[]
  costScore: number
  benefitScore: number
  riskLevel: "low" | "medium" | "high"
  recommendation: string
}

interface DecisionMatrix {
  decision: string
  context: string
  options: DecisionOption[]
  analysis: string
  finalRecommendation: string
}

export function CostBenefitMatrix() {
  const [decision, setDecision] = useState("")
  const [context, setContext] = useState("")
  const [options, setOptions] = useState<DecisionOption[]>([])
  const [currentOption, setCurrentOption] = useState<Partial<DecisionOption>>({})
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState("")
  const [finalRecommendation, setFinalRecommendation] = useState("")

  const addOption = () => {
    if (currentOption.name && currentOption.description) {
      const newOption: DecisionOption = {
        id: Date.now().toString(),
        name: currentOption.name || "",
        description: currentOption.description || "",
        costs: currentOption.costs || [],
        benefits: currentOption.benefits || [],
        mitigations: currentOption.mitigations || [],
        costScore: currentOption.costScore || 5,
        benefitScore: currentOption.benefitScore || 5,
        riskLevel: currentOption.riskLevel || "medium",
        recommendation: currentOption.recommendation || ""
      }
      setOptions([...options, newOption])
      setCurrentOption({})
    }
  }

  const updateOption = (id: string, field: keyof DecisionOption, value: any) => {
    setOptions(options.map(option => 
      option.id === id ? { ...option, [field]: value } : option
    ))
  }

  const removeOption = (id: string) => {
    setOptions(options.filter(option => option.id !== id))
  }

  const addArrayItem = (optionId: string, field: keyof DecisionOption, item: string) => {
    const option = options.find(o => o.id === optionId)
    if (option) {
      const currentArray = option[field] as string[]
      updateOption(optionId, field, [...currentArray, item])
    }
  }

  const removeArrayItem = (optionId: string, field: keyof DecisionOption, index: number) => {
    const option = options.find(o => o.id === optionId)
    if (option) {
      const currentArray = option[field] as string[]
      updateOption(optionId, field, currentArray.filter((_, i) => i !== index))
    }
  }

  const analyzeDecision = async () => {
    setIsAnalyzing(true)
    
    // Simulate AI analysis
    setTimeout(() => {
      const totalOptions = options.length
      const avgCostScore = options.reduce((sum, opt) => sum + opt.costScore, 0) / totalOptions
      const avgBenefitScore = options.reduce((sum, opt) => sum + opt.benefitScore, 0) / totalOptions
      
      const analysisText = `Analysis of ${decision}:

Key Findings:
- ${totalOptions} options evaluated
- Average cost score: ${avgCostScore.toFixed(1)}/10
- Average benefit score: ${avgBenefitScore.toFixed(1)}/10

Risk Assessment:
${options.map(opt => `- ${opt.name}: ${opt.riskLevel} risk level`).join('\n')}

Second-Order Effects:
- Consider long-term implications of each option
- Evaluate impact on team morale and company culture
- Assess potential market reactions and competitive responses

Mitigation Strategies:
${options.map(opt => `- ${opt.name}: ${opt.mitigations.join(', ')}`).join('\n')}`

      setAnalysis(analysisText)
      setIsAnalyzing(false)
    }, 3000)
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "bg-green-100 text-green-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "high": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const saveMatrix = () => {
    const matrixData: DecisionMatrix = {
      decision,
      context,
      options,
      analysis,
      finalRecommendation
    }
    
    const blob = new Blob([JSON.stringify(matrixData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `decision-matrix-${decision.replace(/\s+/g, '-').toLowerCase()}.json`
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
            Cost-Benefit-Mitigation Matrix
          </CardTitle>
          <CardDescription>
            Structured decision-making framework to evaluate options, assess risks, and identify mitigation strategies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Decision Context */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="decision">Strategic Decision</Label>
              <Input
                id="decision"
                placeholder="e.g., Should we raise our prices by 20%?"
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="context">Context & Background</Label>
              <Textarea
                id="context"
                placeholder="Provide context about the decision, current situation, and key factors..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Add New Option */}
          <Card>
            <CardHeader>
              <CardTitle>Add Decision Option</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="option-name">Option Name</Label>
                  <Input
                    id="option-name"
                    placeholder="e.g., Raise prices by 20%"
                    value={currentOption.name || ""}
                    onChange={(e) => setCurrentOption({...currentOption, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="option-description">Description</Label>
                  <Input
                    id="option-description"
                    placeholder="Brief description of this option"
                    value={currentOption.description || ""}
                    onChange={(e) => setCurrentOption({...currentOption, description: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Cost Score (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={currentOption.costScore || 5}
                    onChange={(e) => setCurrentOption({...currentOption, costScore: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>Benefit Score (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={currentOption.benefitScore || 5}
                    onChange={(e) => setCurrentOption({...currentOption, benefitScore: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>Risk Level</Label>
                  <select
                    className="w-full p-2 border rounded"
                    value={currentOption.riskLevel || "medium"}
                    onChange={(e) => setCurrentOption({...currentOption, riskLevel: e.target.value as any})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <Button onClick={addOption} className="w-full">
                Add Option
              </Button>
            </CardContent>
          </Card>

          {/* Options Table */}
          {options.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Decision Options</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Option</TableHead>
                      <TableHead>Cost Score</TableHead>
                      <TableHead>Benefit Score</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {options.map((option) => (
                      <TableRow key={option.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{option.name}</div>
                            <div className="text-sm text-gray-600">{option.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TrendingDown className="w-4 h-4 text-red-500" />
                            {option.costScore}/10
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            {option.benefitScore}/10
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRiskColor(option.riskLevel)}>
                            {option.riskLevel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeOption(option.id)}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Analysis Button */}
          {options.length >= 2 && (
            <div className="flex gap-4">
              <Button 
                onClick={analyzeDecision}
                disabled={isAnalyzing}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Decision"}
              </Button>
              <Button variant="outline" onClick={saveMatrix}>
                <Save className="w-4 h-4 mr-2" />
                Save Matrix
              </Button>
            </div>
          )}

          {/* Analysis Results */}
          {analysis && (
            <Card>
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm">{analysis}</pre>
                  </div>
                  
                  <div>
                    <Label htmlFor="recommendation">Final Recommendation</Label>
                    <Textarea
                      id="recommendation"
                      placeholder="Based on the analysis, what's your final recommendation?"
                      value={finalRecommendation}
                      onChange={(e) => setFinalRecommendation(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Decision Framework Tip:</strong> This matrix helps you systematically evaluate options by considering costs, 
          benefits, and mitigation strategies. Always consider second-order effects and unintended consequences of your decisions.
        </AlertDescription>
      </Alert>
    </div>
  )
} 