"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mic, Volume2, VolumeX, Square,} from 'lucide-react'
import { cn } from '@/lib/utils'

// Provide minimal fallbacks for browser-only Web Speech API types during Node builds
type SpeechGrammarList = any
type SpeechRecognitionResultList = any

interface VoiceInputProps {
  onTranscript: (text: string) => void
  onFinalTranscript?: (text: string) => void
  placeholder?: string
  className?: string
  language?: string
  continuous?: boolean
  interimResults?: boolean
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  serviceURI: string
  grammars: any // SpeechGrammarList is not widely supported
  start(): void
  stop(): void
  abort(): void
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null
  onend: ((this: SpeechRecognition, ev: Event) => any) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null
}

interface SpeechRecognitionErrorEvent extends Event {
  error: 'no-speech' | 'aborted' | 'audio-capture' | 'network' | 'not-allowed' | 'service-not-allowed' | 'bad-grammar' | 'language-not-supported'
  message: string
}

export default function VoiceInput({
  onTranscript,
  onFinalTranscript,
  placeholder = "Click the microphone and start speaking...",
  className = "",
  language = "en-US",
  continuous = false,
  interimResults = true
}: VoiceInputProps) {
  const [isSupported, setIsSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [confidence, setConfidence] = useState(0)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Check if Speech Recognition is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (SpeechRecognition) {
      setIsSupported(true)

      const recognition = new SpeechRecognition()
      recognition.continuous = continuous
      recognition.interimResults = interimResults
      recognition.lang = language
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        setIsListening(true)
        setError(null)
        setTranscript("")
        setInterimTranscript("")
      }

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = ""
        let finalTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          const transcript = result[0].transcript

          if (result.isFinal) {
            finalTranscript += transcript
            setConfidence(result[0].confidence)
          } else {
            interimTranscript += transcript
          }
        }

        if (interimTranscript) {
          setInterimTranscript(interimTranscript)
          onTranscript(interimTranscript)
        }

        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript)
          setInterimTranscript("")
          onTranscript(finalTranscript)
          onFinalTranscript?.(finalTranscript)
        }
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setError(getErrorMessage(event.error))
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
        setInterimTranscript("")
      }

      recognitionRef.current = recognition
    } else {
      setIsSupported(false)
      setError("Speech recognition is not supported in your browser")
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [language, continuous, interimResults, onTranscript, onFinalTranscript])

  const getErrorMessage = (error: SpeechRecognitionErrorEvent['error']) => {
    switch (error) {
      case 'no-speech':
        return 'No speech detected. Please try speaking again.'
      case 'audio-capture':
        return 'No microphone found. Please check your microphone settings.'
      case 'not-allowed':
        return 'Microphone access denied. Please allow microphone access.'
      case 'network':
        return 'Network error. Please check your internet connection.'
      case 'language-not-supported':
        return 'Language not supported. Please try a different language.'
      default:
        return 'Speech recognition error. Please try again.'
    }
  }

  const startListening = () => {
    if (!recognitionRef.current || isListening) return

    try {
      setError(null)
      recognitionRef.current.start()

      // Auto-stop after 30 seconds of continuous listening
      if (continuous) {
        timeoutRef.current = setTimeout(() => {
          stopListening()
        }, 30000)
      }
    } catch (err) {
      setError('Failed to start speech recognition')
    }
  }

  const stopListening = () => {
    if (!recognitionRef.current) return

    try {
      recognitionRef.current.stop()
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    } catch (err) {
      setError('Failed to stop speech recognition')
    }
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const clearTranscript = () => {
    setTranscript("")
    setInterimTranscript("")
    setError(null)
    setConfidence(0)
  }

  if (!isSupported) {
    return (
      <Card className={cn("border-dashed border-gray-700", className)}>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <VolumeX className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <p className="font-mono font-medium text-gray-400">Voice input not supported</p>
            <p className="text-sm font-mono text-gray-500">Your browser doesn&apos;t support speech recognition</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("relative", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-neon-cyan" />
              Voice Input
            </CardTitle>
            <CardDescription>
              {isListening ? "Listening... speak now" : placeholder}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {confidence > 0 && (
              <Badge variant="cyan" className="text-xs">
                {Math.round(confidence * 100)}% confidence
              </Badge>
            )}
            <Badge
              variant={isListening ? "magenta" : "cyan"}
              className={cn(
                "text-xs transition-colors",
                isListening && "animate-pulse"
              )}
            >
              {isListening ? "Recording" : "Ready"}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Transcript */}
        <div className="min-h-[60px] p-3 border-2 border-gray-700 rounded-sm bg-dark-bg">
          <div className="text-sm font-mono">
            {transcript && (
              <span className="text-neon-purple font-medium">{transcript}</span>
            )}
            {interimTranscript && (
              <span className="text-gray-500 italic"> {interimTranscript}</span>
            )}
            {!transcript && !interimTranscript && (
              <span className="text-gray-600">Your speech will appear here...</span>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="text-sm text-neon-magenta bg-neon-magenta/10 p-2 rounded-sm border border-neon-magenta font-mono">
            {error}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between">
          <Button
            onClick={toggleListening}
            disabled={!isSupported}
            size="sm"
            variant={isListening ? "magenta" : "cyan"}
            className={cn(
              "flex items-center gap-2 transition-all duration-200",
              isListening && "animate-pulse"
            )}
          >
            {isListening ? (
              <>
                <Square className="w-4 h-4" />
                Stop
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                Start Speaking
              </>
            )}
          </Button>

          {(transcript || interimTranscript) && (
            <Button
              onClick={clearTranscript}
              size="sm"
              variant="outline"
            >
              Clear
            </Button>
          )}
        </div>

        {/* Language Info */}
        <div className="text-xs text-gray-500 flex items-center justify-between font-mono">
          <span>Language: {language}</span>
          <span>
            {isListening ? "🎤 Listening..." : "Click 'Start Speaking' to begin"}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}