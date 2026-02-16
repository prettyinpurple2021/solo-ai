"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Brain, TrendingUp, TrendingDown, Shield, Save } from "lucide-react"
import { cn } from "@/lib/utils"

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



  const removeOption = (id: string) => {
    setOptions(options.filter(option => option.id !== id))
  }



  const sortedOptions = useMemo(() => {
    return [...options].sort((a, b) => {
      const scoreA = a.benefitScore - a.costScore
      const scoreB = b.benefitScore - b.costScore
      return scoreB - scoreA
    })
  }, [options])

  const analyzeDecision = () => {
    const totalOptions = options.length
    if (totalOptions === 0) {
      setAnalysis("")
      return
    }

    const avgCostScore = options.reduce((sum, opt) => sum + opt.costScore, 0) / totalOptions
    const avgBenefitScore = options.reduce((sum, opt) => sum + opt.benefitScore, 0) / totalOptions

    const ranked = [...options]
      .map((opt) => ({
        ...opt,
        netScore: opt.benefitScore - opt.costScore,
      }))
      .sort((a, b) => b.netScore - a.netScore)

    const top = ranked[0]
    const analysisText = [
      `Decision: ${decision || "(unnamed decision)"}`,
      context.trim() ? `Context: ${context.trim()}` : "",
      "",
      "Key Findings:",
      `- ${totalOptions} option(s) evaluated`,
      `- Average cost score: ${avgCostScore.toFixed(1)}/10`,
      `- Average benefit score: ${avgBenefitScore.toFixed(1)}/10`,
      "",
      "Ranked Options (benefit - cost):",
      ...ranked.map((opt) => `- ${opt.name}: ${opt.netScore >= 0 ? "+" : ""}${opt.netScore} (risk: ${opt.riskLevel})`),
      "",
      "Risks & Mitigations:",
      ...ranked.map((opt) => {
        const mitigations = opt.mitigations.filter((m) => m.trim().length > 0)
        return `- ${opt.name}: ${mitigations.length ? mitigations.join("; ") : "No mitigations listed yet"}`
      }),
      "",
      top
        ? `Suggested Next Step: If you want a default pick, start by stress-testing "${top.name}" (highest net score) against your worst-case risk scenario.`
        : "",
    ]
      .filter(Boolean)
      .join("\n")

    setAnalysis(analysisText)
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-dark-card border border-neon-lime text-neon-lime"
      case "medium":
        return "bg-dark-card border border-neon-orange text-neon-orange"
      case "high":
        return "bg-dark-card border border-neon-magenta text-neon-magenta"
      default:
        return "bg-dark-card border border-gray-700 text-gray-300"
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
      <Card className="bg-dark-card border border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-neon-purple" />
            <span className="font-orbitron font-bold uppercase tracking-wider text-white">Cost-Benefit-Mitigation Matrix</span>
          </CardTitle>
          <CardDescription className="font-mono text-gray-300">
            Structured decision-making framework to evaluate options, assess risks, and identify mitigation strategies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Decision Context */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="decision" className="font-mono text-gray-300">Strategic Decision</Label>
              <Input
                id="decision"
                placeholder="e.g., Should we raise our prices by 20%?"
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="context" className="font-mono text-gray-300">Context & Background</Label>
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
          <Card className="bg-dark-card border border-gray-700">
            <CardHeader>
              <CardTitle className="font-orbitron font-bold uppercase tracking-wider text-white">Add Decision Option</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="option-name" className="font-mono text-gray-300">Option Name</Label>
                  <Input
                    id="option-name"
                    placeholder="e.g., Raise prices by 20%"
                    value={currentOption.name || ""}
                    onChange={(e) => setCurrentOption({...currentOption, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="option-description" className="font-mono text-gray-300">Description</Label>
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
                  <Label className="font-mono text-gray-300">Cost Score (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={currentOption.costScore || 5}
                    onChange={(e) => setCurrentOption({...currentOption, costScore: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label className="font-mono text-gray-300">Benefit Score (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={currentOption.benefitScore || 5}
                    onChange={(e) => setCurrentOption({...currentOption, benefitScore: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label className="font-mono text-gray-300">Risk Level</Label>
                  <select
                    className="w-full p-2 border border-gray-700 rounded-sm bg-dark-card text-gray-300 font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
                    value={currentOption.riskLevel || "medium"}
                    onChange={(e) => setCurrentOption({...currentOption, riskLevel: e.target.value as "low" | "medium" | "high"})}
                    aria-label="Select risk level"
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
            <Card className="bg-dark-card border border-gray-700">
              <CardHeader>
                <CardTitle className="font-orbitron font-bold uppercase tracking-wider text-white">Decision Options</CardTitle>
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
                            <div className="font-mono text-gray-300">{option.name}</div>
                            <div className="text-sm font-mono text-gray-500">{option.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TrendingDown className="w-4 h-4 text-neon-magenta" />
                            <span className="font-mono text-gray-300">{option.costScore}/10</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-neon-lime" />
                            <span className="font-mono text-gray-300">{option.benefitScore}/10</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("font-mono", getRiskColor(option.riskLevel))}>
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
                className="bg-neon-purple hover:bg-neon-purple/80"
              >
                Analyze Decision
              </Button>
              <Button variant="outline" onClick={saveMatrix}>
                <Save className="w-4 h-4 mr-2" />
                Save Matrix
              </Button>
            </div>
          )}

          {/* Analysis Results */}
          {analysis && (
            <Card className="bg-dark-card border border-gray-700">
              <CardHeader>
                <CardTitle className="font-orbitron font-bold uppercase tracking-wider text-white">Analysis Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-dark-card p-4 rounded-sm border border-gray-700">
                    <pre className="whitespace-pre-wrap text-sm font-mono text-gray-300">{analysis}</pre>
                  </div>
                  
                  <div>
                    <Label htmlFor="recommendation" className="font-mono text-gray-300">Final Recommendation</Label>
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

      <Alert className="bg-dark-card border border-neon-cyan/40">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Decision Framework Tip:</strong> This matrix helps you systematically evaluate options by considering costs, 
          benefits, and mitigation strategies. Always consider second-order effects and unintended consequences of your decisions.
        </AlertDescription>
      </Alert>
    </div>
  )
} 
