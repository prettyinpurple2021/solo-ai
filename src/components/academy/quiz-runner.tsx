"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export interface Question {
  id: string
  text: string
  options: { id: string; text: string }[]
  correctOptionId: string
  explanation?: string
}

interface QuizRunnerProps {
  title: string
  questions: Question[]
  onComplete: (score: number, passed: boolean) => void
  passingThreshold?: number // Default 70%
}

export function QuizRunner({ title, questions, onComplete, passingThreshold = 70 }: QuizRunnerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

  const handleAnswer = (optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestionIndex].id]: optionId
    }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      calculateResults()
    }
  }

  const handlePrevious = () => {
     if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(prev => prev - 1)
     }
  }

  const calculateResults = () => {
    let correctCount = 0
    questions.forEach(q => {
      if (answers[q.id] === q.correctOptionId) {
        correctCount++
      }
    })

    const finalScore = Math.round((correctCount / questions.length) * 100)
    setScore(finalScore)
    setShowResults(true)
    
    // Determine if passed
    const passed = finalScore >= passingThreshold
    onComplete(finalScore, passed)
  }

  const resetQuiz = () => {
      setAnswers({})
      setCurrentQuestionIndex(0)
      setShowResults(false)
      setScore(0)
  }

  // Results View
  if (showResults) {
      const passed = score >= passingThreshold
      return (
          <Card className="w-full max-w-2xl mx-auto">
              <CardHeader className="text-center">
                  <div className="mx-auto mb-4">
                      {passed ? (
                          <CheckCircle className="w-16 h-16 text-green-500" />
                      ) : (
                          <XCircle className="w-16 h-16 text-red-500" />
                      )}
                  </div>
                  <CardTitle className="text-2xl">
                      {passed ? "Quiz Passed!" : "Quiz Failed"}
                  </CardTitle>
                  <p className="text-muted-foreground">
                      You scored {score}% ({questions.filter(q => answers[q.id] === q.correctOptionId).length}/{questions.length} correct)
                  </p>
              </CardHeader>
              <CardContent className="space-y-6">
                  {/* Review Answers */}
                  <div className="space-y-4">
                      {questions.map((q, idx) => {
                          const isCorrect = answers[q.id] === q.correctOptionId
                          return (
                              <div key={q.id} className={`p-4 rounded-lg border ${isCorrect ? 'border-green-200 bg-green-50 dark:bg-green-900/10' : 'border-red-200 bg-red-50 dark:bg-red-900/10'}`}>
                                  <div className="flex items-start gap-2">
                                      {isCorrect ? <CheckCircle className="w-4 h-4 text-green-600 mt-1" /> : <XCircle className="w-4 h-4 text-red-600 mt-1" />}
                                      <div className="flex-1">
                                          <p className="font-medium text-sm">Q{idx+1}: {q.text}</p>
                                          <p className="text-sm mt-1 text-muted-foreground">
                                              Your Answer: {q.options.find(o => o.id === answers[q.id])?.text}
                                          </p>
                                          {!isCorrect && (
                                              <p className="text-sm mt-1 font-semibold text-green-700">
                                                  Correct Answer: {q.options.find(o => o.id === q.correctOptionId)?.text}
                                              </p>
                                          )}
                                          {q.explanation && (
                                              <p className="text-xs mt-2 italic opacity-80">{q.explanation}</p>
                                          )}
                                      </div>
                                  </div>
                              </div>
                          )
                      })}
                  </div>
              </CardContent>
              <CardFooter className="justify-center gap-4">
                  {!passed && (
                      <Button onClick={resetQuiz} variant="outline">Try Again</Button>
                  )}
                  {passed && (
                      <Button disabled variant="outline" className="text-green-600 border-green-200 bg-green-50">
                          Module Completed
                      </Button>
                  )}
              </CardFooter>
          </Card>
      )
  }

  // Question Runner View
  const question = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex) / questions.length) * 100

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-sm">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono text-muted-foreground">QUESTION {currentQuestionIndex + 1} OF {questions.length}</span>
            <span className="text-xs font-mono text-muted-foreground">{Math.round(progress)}% COMPLETE</span>
        </div>
        <Progress value={progress} className="h-1 mb-4" />
        <CardTitle className="text-lg leading-relaxed">{question.text}</CardTitle>
      </CardHeader>
      
      <CardContent>
        <RadioGroup 
            value={answers[question.id] || ""} 
            onValueChange={handleAnswer} 
            className="space-y-3"
        >
          {question.options.map((option) => (
            <div key={option.id} className={`flex items-center space-x-2 border rounded-lg p-4 transition-colors ${answers[question.id] === option.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
              <RadioGroupItem value={option.id} id={option.id} />
              <Label htmlFor={option.id} className="flex-1 cursor-pointer font-normal text-base">{option.text}</Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>

      <CardFooter className="flex justify-between pt-4">
        <Button 
            variant="ghost" 
            onClick={handlePrevious} 
            disabled={currentQuestionIndex === 0}
        >
            Previous
        </Button>
        <Button 
            onClick={handleNext} 
            disabled={!answers[question.id]}
        >
            {currentQuestionIndex === questions.length - 1 ? "Submit Quiz" : "Next Question"}
        </Button>
      </CardFooter>
    </Card>
  )
}
