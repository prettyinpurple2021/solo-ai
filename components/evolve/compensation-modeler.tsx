"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TrendingUp, DollarSign, Calculator, Save, TrendingDown, Users } from "lucide-react"

interface BusinessMetrics {
  monthlyRevenue: number
  monthlyExpenses: number
  currentCash: number
  burnRate: number
  runway: number
}

interface CompensationPackage {
  baseSalary: number
  equityPercentage: number
  benefits: number
  bonuses: number
  totalAnnualCost: number
  monthlyCost: number
}

interface EquityValuation {
  companyValuation: number
  equityValue: number
  vestingSchedule: string
  cliffPeriod: number
  totalValue: number
}

interface FinancialImpact {
  newRunway: number
  runwayChange: number
  monthlyBurnRate: number
  breakEvenMonths: number
  revenueNeeded: number
}

export function CompensationModeler() {
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics>({
    monthlyRevenue: 25000,
    monthlyExpenses: 15000,
    currentCash: 100000,
    burnRate: 15000,
    runway: 6.7
  })

  const [compensationPackage, setCompensationPackage] = useState<CompensationPackage>({
    baseSalary: 60000,
    equityPercentage: 1.0,
    benefits: 6000,
    bonuses: 5000,
    totalAnnualCost: 71000,
    monthlyCost: 5917
  })

  const [equityValuation, setEquityValuation] = useState<EquityValuation>({
    companyValuation: 1000000,
    equityValue: 10000,
    vestingSchedule: "4 years with 1-year cliff",
    cliffPeriod: 12,
    totalValue: 71000
  })

  const [financialImpact, setFinancialImpact] = useState<FinancialImpact>({
    newRunway: 5.6,
    runwayChange: -1.1,
    monthlyBurnRate: 20917,
    breakEvenMonths: 8,
    revenueNeeded: 35917
  })

  const updateBusinessMetrics = (field: keyof BusinessMetrics, value: number) => {
    const newMetrics = { ...businessMetrics, [field]: value }
    
    // Recalculate derived values
    newMetrics.burnRate = newMetrics.monthlyExpenses - newMetrics.monthlyRevenue
    newMetrics.runway = newMetrics.currentCash / newMetrics.burnRate
    
    setBusinessMetrics(newMetrics)
    calculateFinancialImpact(newMetrics, compensationPackage)
  }

  const updateCompensationPackage = (field: keyof CompensationPackage, value: number) => {
    const newPackage = { ...compensationPackage, [field]: value }
    
    // Recalculate total costs
    newPackage.totalAnnualCost = newPackage.baseSalary + newPackage.benefits + newPackage.bonuses
    newPackage.monthlyCost = newPackage.totalAnnualCost / 12
    
    setCompensationPackage(newPackage)
    calculateFinancialImpact(businessMetrics, newPackage)
    calculateEquityValue(newPackage.equityPercentage)
  }

  const calculateEquityValue = (equityPercentage: number) => {
    const equityValue = (equityValuation.companyValuation * equityPercentage) / 100
    const totalValue = compensationPackage.baseSalary + compensationPackage.benefits + compensationPackage.bonuses + equityValue
    
    setEquityValuation({
      ...equityValuation,
      equityPercentage,
      equityValue,
      totalValue
    })
  }

  const calculateFinancialImpact = (metrics: BusinessMetrics, comp: CompensationPackage) => {
    const newMonthlyExpenses = metrics.monthlyExpenses + comp.monthlyCost
    const newBurnRate = newMonthlyExpenses - metrics.monthlyRevenue
    const newRunway = metrics.currentCash / newBurnRate
    const runwayChange = newRunway - metrics.runway
    
    // Calculate break-even
    const breakEvenMonths = comp.totalAnnualCost / (metrics.monthlyRevenue * 12) * 12
    const revenueNeeded = newMonthlyExpenses
    
    setFinancialImpact({
      newRunway,
      runwayChange,
      monthlyBurnRate: newBurnRate,
      breakEvenMonths,
      revenueNeeded
    })
  }

  const getRunwayColor = (runway: number) => {
    if (runway >= 12) return "text-green-600"
    if (runway >= 6) return "text-yellow-600"
    return "text-red-600"
  }

  const getRunwayStatus = (runway: number) => {
    if (runway >= 12) return "Excellent"
    if (runway >= 6) return "Good"
    if (runway >= 3) return "Concerning"
    return "Critical"
  }

  const saveModel = () => {
    const modelData = {
      businessMetrics,
      compensationPackage,
      equityValuation,
      financialImpact,
      completedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(modelData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `compensation-model-${new Date().toISOString().split('T')[0]}.json`
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
            <Calculator className="w-5 h-5 text-purple-600" />
            Compensation & Equity Modeler
          </CardTitle>
          <CardDescription>
            Model the financial impact of hiring and experiment with different compensation structures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="business" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="business">Business Metrics</TabsTrigger>
              <TabsTrigger value="compensation">Compensation</TabsTrigger>
              <TabsTrigger value="impact">Financial Impact</TabsTrigger>
            </TabsList>

            {/* Business Metrics Tab */}
            <TabsContent value="business" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="revenue">Monthly Revenue</Label>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <Input
                        id="revenue"
                        type="number"
                        value={businessMetrics.monthlyRevenue}
                        onChange={(e) => updateBusinessMetrics('monthlyRevenue', parseInt(e.target.value) || 0)}
                        placeholder="25000"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="expenses">Monthly Expenses</Label>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <Input
                        id="expenses"
                        type="number"
                        value={businessMetrics.monthlyExpenses}
                        onChange={(e) => updateBusinessMetrics('monthlyExpenses', parseInt(e.target.value) || 0)}
                        placeholder="15000"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cash">Current Cash</Label>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <Input
                        id="cash"
                        type="number"
                        value={businessMetrics.currentCash}
                        onChange={(e) => updateBusinessMetrics('currentCash', parseInt(e.target.value) || 0)}
                        placeholder="100000"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Burn Rate:</span>
                          <span className="font-semibold">${businessMetrics.burnRate.toLocaleString()}/month</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Current Runway:</span>
                          <span className={`font-semibold ${getRunwayColor(businessMetrics.runway)}`}>
                            {businessMetrics.runway.toFixed(1)} months
                          </span>
                        </div>
                        <Badge className={getRunwayColor(businessMetrics.runway).replace('text-', 'bg-').replace('-600', '-100')}>
                          {getRunwayStatus(businessMetrics.runway)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Alert>
                    <TrendingDown className="h-4 w-4" />
                    <AlertDescription>
                      Your current burn rate is ${businessMetrics.burnRate.toLocaleString()}/month. 
                      Adding a new hire will increase your monthly expenses.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </TabsContent>

            {/* Compensation Tab */}
            <TabsContent value="compensation" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="salary">Base Salary (Annual)</Label>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <Input
                        id="salary"
                        type="number"
                        value={compensationPackage.baseSalary}
                        onChange={(e) => updateCompensationPackage('baseSalary', parseInt(e.target.value) || 0)}
                        placeholder="60000"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Equity Percentage</Label>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>0%</span>
                        <span>{compensationPackage.equityPercentage}%</span>
                        <span>5%</span>
                      </div>
                      <Slider
                        value={[compensationPackage.equityPercentage]}
                        onValueChange={(value) => updateCompensationPackage('equityPercentage', value[0])}
                        max={5}
                        step={0.1}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="benefits">Benefits (Annual)</Label>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <Input
                        id="benefits"
                        type="number"
                        value={compensationPackage.benefits}
                        onChange={(e) => updateCompensationPackage('benefits', parseInt(e.target.value) || 0)}
                        placeholder="6000"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bonuses">Bonuses (Annual)</Label>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <Input
                        id="bonuses"
                        type="number"
                        value={compensationPackage.bonuses}
                        onChange={(e) => updateCompensationPackage('bonuses', parseInt(e.target.value) || 0)}
                        placeholder="5000"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Compensation Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>Base Salary:</span>
                        <span>${compensationPackage.baseSalary.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Benefits:</span>
                        <span>${compensationPackage.benefits.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bonuses:</span>
                        <span>${compensationPackage.bonuses.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Equity Value:</span>
                        <span>${equityValuation.equityValue.toLocaleString()}</span>
                      </div>
                      <hr />
                      <div className="flex justify-between font-semibold">
                        <span>Total Annual Cost:</span>
                        <span>${compensationPackage.totalAnnualCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly Cost:</span>
                        <span>${compensationPackage.monthlyCost.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Equity Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>Company Valuation:</span>
                        <span>${equityValuation.companyValuation.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Equity Value:</span>
                        <span>${equityValuation.equityValue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Vesting Schedule:</span>
                        <span>{equityValuation.vestingSchedule}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cliff Period:</span>
                        <span>{equityValuation.cliffPeriod} months</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Financial Impact Tab */}
            <TabsContent value="impact" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Runway Impact</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>Current Runway:</span>
                        <span className="font-semibold">{businessMetrics.runway.toFixed(1)} months</span>
                      </div>
                      <div className="flex justify-between">
                        <span>New Runway:</span>
                        <span className={`font-semibold ${getRunwayColor(financialImpact.newRunway)}`}>
                          {financialImpact.newRunway.toFixed(1)} months
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Change:</span>
                        <span className={`font-semibold ${financialImpact.runwayChange < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {financialImpact.runwayChange > 0 ? '+' : ''}{financialImpact.runwayChange.toFixed(1)} months
                        </span>
                      </div>
                      <Badge className={getRunwayColor(financialImpact.newRunway).replace('text-', 'bg-').replace('-600', '-100')}>
                        {getRunwayStatus(financialImpact.newRunway)}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Financial Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>New Monthly Burn:</span>
                        <span className="font-semibold">${financialImpact.monthlyBurnRate.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Revenue Needed:</span>
                        <span className="font-semibold">${financialImpact.revenueNeeded.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Break-even Months:</span>
                        <span className="font-semibold">{financialImpact.breakEvenMonths.toFixed(1)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Key Insights:</strong>
                      <ul className="mt-2 space-y-1">
                        <li>• Your runway will decrease by {Math.abs(financialImpact.runwayChange).toFixed(1)} months</li>
                        <li>• You'll need ${financialImpact.revenueNeeded.toLocaleString()}/month to break even</li>
                        <li>• Consider revenue growth to offset the increased burn rate</li>
                      </ul>
                    </AlertDescription>
                  </Alert>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {financialImpact.newRunway < 6 && (
                        <div className="p-2 bg-red-50 rounded border border-red-200">
                          <strong>⚠️ Low Runway Warning:</strong> Consider raising additional funding or reducing costs.
                        </div>
                      )}
                      {financialImpact.newRunway >= 6 && financialImpact.newRunway < 12 && (
                        <div className="p-2 bg-yellow-50 rounded border border-yellow-200">
                          <strong>📈 Growth Opportunity:</strong> Focus on revenue growth to extend runway.
                        </div>
                      )}
                      {financialImpact.newRunway >= 12 && (
                        <div className="p-2 bg-green-50 rounded border border-green-200">
                          <strong>✅ Strong Position:</strong> You have sufficient runway for this hire.
                        </div>
                      )}
                      <div className="p-2 bg-blue-50 rounded border border-blue-200">
                        <strong>💡 Tip:</strong> Consider performance-based equity vesting to align incentives.
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end mt-6">
            <Button onClick={saveModel} variant="outline">
              <Save className="w-4 h-4 mr-2" />
              Save Model
            </Button>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Calculator className="h-4 w-4" />
        <AlertDescription>
          <strong>Compensation Modeling Tip:</strong> Balance cash compensation with equity to manage cash flow while 
          providing meaningful ownership. Consider vesting schedules and performance metrics to align incentives.
        </AlertDescription>
      </Alert>
    </div>
  )
} 