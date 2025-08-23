"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mic, MicOff, Loader2, XCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface VoiceInputProps {
  onTranscript: (_text: string) => void
  placeholder?: string
  className?: string
}

export function VoiceInput({ onTranscript, placeholder: _placeholder = "Click to start recording...", className = "" }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const recognitionRef = useRef<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Check if speech recognition is supported
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true)
      initializeSpeechRecognition()
    } else {
      setError('Speech recognition is not supported in this browser')
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    
    recognitionRef.current.continuous = true
    recognitionRef.current.interimResults = true
    recognitionRef.current.lang = 'en-US'

    recognitionRef.current.onstart = () => {
      setIsRecording(true)
      setError(null)
      toast({
        title: "🎤 Recording started",
        description: "Speak clearly to create your task or goal",
      })
    }

    recognitionRef.current.onresult = (event: any) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      setTranscript(finalTranscript + interimTranscript)
    }

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setError(`Speech recognition error: ${event.error}`)
      setIsRecording(false)
      toast({
        title: "❌ Recording error",
        description: "Please try again or use text input",
        variant: "destructive",
      })
    }

    recognitionRef.current.onend = () => {
      setIsRecording(false)
      if (transcript.trim()) {
        setIsProcessing(true)
        // Simulate processing time
        setTimeout(() => {
          onTranscript(transcript.trim())
          setTranscript('')
          setIsProcessing(false)
          toast({
            title: "✅ Voice input processed",
            description: "Your task has been created from voice input",
          })
        }, 1000)
      }
    }
  }

  const startRecording = () => {
    if (recognitionRef.current && !isRecording) {
      try {
        recognitionRef.current.start()
      } catch (error) {
        console.error('Failed to start recording:', error)
        setError('Failed to start recording')
      }
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop()
    }
  }

  const clearTranscript = () => {
    setTranscript('')
    setError(null)
  }

  if (!isSupported) {
    return (
      <Card className={`border-orange-200 bg-orange-50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-orange-800">
            <XCircle className="w-4 h-4" />
            <span className="text-sm">Voice input not supported in this browser</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`${className} ${isRecording ? 'border-purple-300 bg-purple-50' : ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Mic className="w-4 h-4" />
          Voice Input
        </CardTitle>
        <CardDescription className="text-xs">
          {isRecording ? 'Listening... Speak clearly' : 'Click the microphone to start recording'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Status Indicators */}
        <div className="flex items-center gap-2">
          <Badge variant={isRecording ? "default" : "secondary"} className="text-xs">
            {isRecording ? (
              <>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-1" />
                Recording
              </>
            ) : (
              <>
                <Mic className="w-3 h-3 mr-1" />
                Ready
              </>
            )}
          </Badge>
          
          {isProcessing && (
            <Badge variant="outline" className="text-xs">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Processing
            </Badge>
          )}
        </div>

        {/* Transcript Display */}
        {transcript && (
          <div className="bg-white border rounded-lg p-3 min-h-[60px]">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-gray-700 flex-1">{transcript}</p>
              <Button
                size="sm"
                variant="ghost"
                onClick={clearTranscript}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-800">
              <XCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2">
          {!isRecording ? (
            <Button 
              onClick={startRecording} 
              className="flex-1"
              disabled={isProcessing}
            >
              <Mic className="w-4 h-4 mr-2" />
              Start Recording
            </Button>
          ) : (
            <Button 
              onClick={stopRecording} 
              variant="destructive"
              className="flex-1"
            >
              <MicOff className="w-4 h-4 mr-2" />
              Stop Recording
            </Button>
          )}
        </div>

        {/* Tips */}
        <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
          <p className="font-medium mb-1">💡 Voice Tips:</p>
          <ul className="space-y-1">
            <li>• "Create a task to review quarterly goals"</li>
            <li>• "Set a goal to increase revenue by 20%"</li>
            <li>• "Schedule a meeting with the marketing team"</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
