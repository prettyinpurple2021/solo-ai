"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Save } from "lucide-react"

interface SelfAnalysis {
  strengths: string[]
  weaknesses: string[]
  timeSpent: Record<string, number>
  businessGaps: string[]
  priorities: string[]
}

interface RoleProfile {
  title: string
  description: string
  responsibilities: string[]
  requirements: string[]
  skills: string[]
  experience: string
  salary: {
    min: number
    max: number
    equity: number
  }
  impact: string
  successMetrics: string[]
}

interface InterviewScorecard {
  criteria: string[]
  questions: Record<string, string[]>
  evaluationMetrics: string[]
}

export function FirstHireArchitect() {
  const [currentStep, setCurrentStep] = useState(0)
  const [selfAnalysis, setSelfAnalysis] = useState<SelfAnalysis>({
    strengths: [],
    weaknesses: [],
    timeSpent: {},
    businessGaps: [],
    priorities: []
  })
  const [roleProfile, setRoleProfile] = useState<RoleProfile>({
    title: "",
    description: "",
    responsibilities: [],
    requirements: [],
    skills: [],
    experience: "",
    salary: { min: 50000, max: 80000, equity: 1 },
    impact: "",
    successMetrics: []
  })
  const [interviewScorecard, setInterviewScorecard] = useState<InterviewScorecard>({
    criteria: [],
    questions: {},
    evaluationMetrics: []
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const strengthOptions = [
    "Strategic thinking and planning",
    "Sales and business development",
    "Product development and design",
    "Marketing and brand building",
    "Financial management",
    "Customer service and support",
    "Technical development",
    "Content creation",
    "Operations and logistics",
    "Team leadership"
  ]

  const weaknessOptions = [
    "Administrative tasks and organization",
    "Accounting and bookkeeping",
    "Graphic design and creative work",
    "Technical development",
    "Customer support",
    "Marketing execution",
    "Sales prospecting",
    "Legal and compliance",
    "HR and recruitment",
    "Data analysis"
  ]

  const timeSpentCategories = [
    "Product Development",
    "Sales & Marketing",
    "Customer Support",
    "Administrative Tasks",
    "Financial Management",
    "Strategic Planning",
    "Content Creation",
    "Technical Tasks"
  ]

  const businessGapOptions = [
    "Sales and revenue generation",
    "Marketing and customer acquisition",
    "Product development and technical work",
    "Customer support and success",
    "Operations and process management",
    "Financial management and accounting",
    "Administrative and organizational tasks",
    "Content creation and design",
    "Strategic planning and analysis",
    "Team management and leadership"
  ]

  const updateSelfAnalysis = (field: keyof SelfAnalysis, value: string[] | Record<string, number>) => {
    setSelfAnalysis(prev => ({ ...prev, [field]: value }))
  }

  const toggleArrayItem = (field: keyof SelfAnalysis, item: string) => {
    const currentArray = selfAnalysis[field] as string[]
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item]
    updateSelfAnalysis(field, newArray)
  }

  const updateRoleProfile = (field: keyof RoleProfile, value: string | string[] | { min: number; max: number; equity: number }) => {
    setRoleProfile(prev => ({ ...prev, [field]: value }))
  }

  const addArrayItem = (field: keyof RoleProfile, item: string) => {
    const currentArray = roleProfile[field] as string[]
    updateRoleProfile(field, [...currentArray, item])
  }

  const removeArrayItem = (field: keyof RoleProfile, index: number) => {
    const currentArray = roleProfile[field] as string[]
    updateRoleProfile(field, currentArray.filter((_, i) => i !== index))
  }

  const generateRoleProfile = async () => {
    setIsGenerating(true)
    
    // Simulate AI analysis
    setTimeout(() => {
      const gaps = selfAnalysis.businessGaps
      
      let suggestedTitle = "Business Operations Manager"
      let suggestedDescription = "A versatile role to support business growth and operational efficiency"
      
      if (gaps.includes("Sales and revenue generation")) {
        suggestedTitle = "Sales Development Representative"
        suggestedDescription = "Focus on lead generation, prospecting, and sales pipeline development"
      } else if (gaps.includes("Marketing and customer acquisition")) {
        suggestedTitle = "Marketing Coordinator"
        suggestedDescription = "Handle marketing execution, content creation, and customer acquisition"
      } else if (gaps.includes("Customer support and success")) {
        suggestedTitle = "Customer Success Manager"
        suggestedDescription = "Ensure customer satisfaction, retention, and success"
      }
      
      const newRoleProfile: RoleProfile = {
        ...roleProfile,
        title: suggestedTitle,
        description: suggestedDescription,
        responsibilities: [
          "Support business operations and growth initiatives",
          "Handle administrative tasks and process management",
          "Assist with customer communication and support",
          "Contribute to marketing and sales efforts",
          "Help with data analysis and reporting"
        ],
        requirements: [
          "2+ years of relevant experience",
          "Strong organizational and communication skills",
          "Ability to work independently and take initiative",
          "Familiarity with business tools and software",
          "Growth mindset and willingness to learn"
        ],
        skills: [
          "Project management",
          "Communication",
          "Problem-solving",
          "Data analysis",
          "Customer service"
        ],
        experience: "2-4 years",
        salary: { min: 45000, max: 65000, equity: 0.5 },
        impact: "This role will free up 20-30 hours per week of your time and directly contribute to business growth",
        successMetrics: [
          "Reduction in founder's administrative time by 50%",
          "Improved customer response times",
          "Increased operational efficiency",
          "Support in achieving quarterly business goals"
        ]
      }
      
      setRoleProfile(newRoleProfile)
      setIsGenerating(false)
    }, 3000)
  }

  const generateInterviewScorecard = () => {
    const newScorecard: InterviewScorecard = {
      criteria: [
        "Technical Skills",
        "Cultural Fit",
        "Problem Solving",
        "Communication",
        "Initiative & Drive"
      ],
      questions: {
        "Technical Skills": [
          "What relevant experience do you have in this field?",
          "How do you stay updated with industry trends?",
          "Can you walk me through a challenging project you worked on?"
        ],
        "Cultural Fit": [
          "What's your ideal work environment?",
          "How do you handle ambiguity and change?",
          "What motivates you in your work?"
        ],
        "Problem Solving": [
          "Describe a time you solved a complex problem",
          "How do you approach new challenges?",
          "What's your decision-making process?"
        ],
        "Communication": [
          "How do you communicate with different stakeholders?",
          "Tell me about a time you had to explain something complex",
          "How do you handle difficult conversations?"
        ],
        "Initiative & Drive": [
          "What have you accomplished that you're most proud of?",
          "How do you take initiative in your work?",
          "What are your career goals?"
        ]
      },
      evaluationMetrics: [
        "1-5 scale for each criterion",
        "Overall recommendation (Hire/Maybe/No)",
        "Specific strengths and areas for development",
        "Cultural fit assessment",
        "Technical competency evaluation"
      ]
    }
    
    setInterviewScorecard(newScorecard)
  }

  const saveAnalysis = () => {
    const analysisData = {
      selfAnalysis,
      roleProfile,
      interviewScorecard,
      completedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(analysisData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `first-hire-analysis-${new Date().toISOString().split('T')[0]}.json`
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
            <Users className="w-5 h-5 text-purple-600" />
            First Hire Role Architect
          </CardTitle>
          <CardDescription>
            Self-analysis tool to identify business gaps and design the perfect first hire role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={currentStep.toString()} onValueChange={(value) => setCurrentStep(parseInt(value))}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="0">Self Analysis</TabsTrigger>
              <TabsTrigger value="1">Role Design</TabsTrigger>
              <TabsTrigger value="2">Interview Prep</TabsTrigger>
            </TabsList>

            {/* Self Analysis Tab */}
            <TabsContent value="0" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-lg font-semibold">Your Strengths</Label>
                  <div className="space-y-2 mt-2">
                    {strengthOptions.map((strength) => (
                      <div key={strength} className="flex items-center space-x-2">
                        <Checkbox
                          id={strength}
                          checked={selfAnalysis.strengths.includes(strength)}
                          onCheckedChange={() => toggleArrayItem('strengths', strength)}
                        />
                        <Label htmlFor={strength} className="text-sm">{strength}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold">Areas for Support</Label>
                  <div className="space-y-2 mt-2">
                    {weaknessOptions.map((weakness) => (
                      <div key={weakness} className="flex items-center space-x-2">
                        <Checkbox
                          id={weakness}
                          checked={selfAnalysis.weaknesses.includes(weakness)}
                          onCheckedChange={() => toggleArrayItem('weaknesses', weakness)}
                        />
                        <Label htmlFor={weakness} className="text-sm">{weakness}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-lg font-semibold">Time Allocation (Hours per Week)</Label>
                <div className="space-y-4 mt-2">
                  {timeSpentCategories.map((category) => (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between">
                        <Label>{category}</Label>
                        <span>{selfAnalysis.timeSpent[category] || 0} hours</span>
                      </div>
                      <Slider
                        value={[selfAnalysis.timeSpent[category] || 0]}
                        onValueChange={(value) => {
                          const newTimeSpent = { ...selfAnalysis.timeSpent }
                          newTimeSpent[category] = value[0]
                          updateSelfAnalysis('timeSpent', newTimeSpent)
                        }}
                        max={40}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-lg font-semibold">Critical Business Gaps</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {businessGapOptions.map((gap) => (
                    <div key={gap} className="flex items-center space-x-2">
                      <Checkbox
                        id={gap}
                        checked={selfAnalysis.businessGaps.includes(gap)}
                        onCheckedChange={() => toggleArrayItem('businessGaps', gap)}
                      />
                      <Label htmlFor={gap} className="text-sm">{gap}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-lg font-semibold">Business Priorities (Next 6 Months)</Label>
                <div className="space-y-2 mt-2">
                  {selfAnalysis.priorities.map((priority, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={priority}
                        onChange={(e) => {
                          const newPriorities = [...selfAnalysis.priorities]
                          newPriorities[index] = e.target.value
                          updateSelfAnalysis('priorities', newPriorities)
                        }}
                        placeholder="Enter priority..."
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newPriorities = selfAnalysis.priorities.filter((_, i) => i !== index)
                          updateSelfAnalysis('priorities', newPriorities)
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newPriorities = [...selfAnalysis.priorities, ""]
                      updateSelfAnalysis('priorities', newPriorities)
                    }}
                  >
                    Add Priority
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Role Design Tab */}
            <TabsContent value="1" className="space-y-6">
              <div className="flex justify-between items-center">
                <Label className="text-lg font-semibold">Role Profile</Label>
                <Button 
                  onClick={generateRoleProfile}
                  disabled={isGenerating}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isGenerating ? "Generating..." : "Generate Role Profile"}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={roleProfile.title}
                    onChange={(e) => updateRoleProfile('title', e.target.value)}
                    placeholder="e.g., Business Operations Manager"
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Experience Level</Label>
                  <Input
                    id="experience"
                    value={roleProfile.experience}
                    onChange={(e) => updateRoleProfile('experience', e.target.value)}
                    placeholder="e.g., 2-4 years"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Role Description</Label>
                <Textarea
                  id="description"
                  value={roleProfile.description}
                  onChange={(e) => updateRoleProfile('description', e.target.value)}
                  placeholder="Describe the role and its purpose..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Key Responsibilities</Label>
                  <div className="space-y-2 mt-2">
                    {roleProfile.responsibilities.map((responsibility, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={responsibility}
                          onChange={(e) => {
                            const newResponsibilities = [...roleProfile.responsibilities]
                            newResponsibilities[index] = e.target.value
                            updateRoleProfile('responsibilities', newResponsibilities)
                          }}
                          placeholder="Enter responsibility..."
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeArrayItem('responsibilities', index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => addArrayItem('responsibilities', '')}
                    >
                      Add Responsibility
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Required Skills</Label>
                  <div className="space-y-2 mt-2">
                    {roleProfile.skills.map((skill, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={skill}
                          onChange={(e) => {
                            const newSkills = [...roleProfile.skills]
                            newSkills[index] = e.target.value
                            updateRoleProfile('skills', newSkills)
                          }}
                          placeholder="Enter skill..."
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeArrayItem('skills', index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => addArrayItem('skills', '')}
                    >
                      Add Skill
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Minimum Salary</Label>
                  <Input
                    type="number"
                    value={roleProfile.salary.min}
                    onChange={(e) => updateRoleProfile('salary', { ...roleProfile.salary, min: parseInt(e.target.value) })}
                    placeholder="50000"
                  />
                </div>
                <div>
                  <Label>Maximum Salary</Label>
                  <Input
                    type="number"
                    value={roleProfile.salary.max}
                    onChange={(e) => updateRoleProfile('salary', { ...roleProfile.salary, max: parseInt(e.target.value) })}
                    placeholder="80000"
                  />
                </div>
                <div>
                  <Label>Equity (%)</Label>
                  <Input
                    type="number"
                    value={roleProfile.salary.equity}
                    onChange={(e) => updateRoleProfile('salary', { ...roleProfile.salary, equity: parseFloat(e.target.value) })}
                    placeholder="1.0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="impact">Expected Impact</Label>
                <Textarea
                  id="impact"
                  value={roleProfile.impact}
                  onChange={(e) => updateRoleProfile('impact', e.target.value)}
                  placeholder="How will this role impact your business?"
                  rows={2}
                />
              </div>
            </TabsContent>

            {/* Interview Prep Tab */}
            <TabsContent value="2" className="space-y-6">
              <div className="flex justify-between items-center">
                <Label className="text-lg font-semibold">Interview Scorecard</Label>
                <Button onClick={generateInterviewScorecard} variant="outline">
                  Generate Scorecard
                </Button>
              </div>

              <div className="space-y-4">
                {interviewScorecard.criteria.map((criterion, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">{criterion}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Label>Interview Questions</Label>
                        {interviewScorecard.questions[criterion]?.map((question, qIndex) => (
                          <div key={qIndex} className="p-2 bg-gray-50 rounded">
                            {question}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div>
                <Label>Evaluation Metrics</Label>
                <div className="space-y-2 mt-2">
                  {interviewScorecard.evaluationMetrics.map((metric, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Badge variant="outline">{index + 1}</Badge>
                      <span>{metric}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Navigation and Save */}
          <div className="flex justify-between mt-6">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              <Button
                onClick={() => setCurrentStep(Math.min(2, currentStep + 1))}
                disabled={currentStep === 2}
              >
                Next
              </Button>
            </div>
            <Button onClick={saveAnalysis} variant="outline">
              <Save className="w-4 h-4 mr-2" />
              Save Analysis
            </Button>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Users className="h-4 w-4" />
        <AlertDescription>
          <strong>First Hire Tip:</strong> Focus on hiring for the biggest business gap that&apos;s holding you back. 
          The right first hire should free up your time and directly contribute to business growth.
        </AlertDescription>
      </Alert>
    </div>
  )
} 