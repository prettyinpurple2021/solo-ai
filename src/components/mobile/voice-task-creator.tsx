"use client"

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Send,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoiceTaskCreatorProps {
  isOpen: boolean
  onClose: () => void
  onTaskCreate: (task: {
    title: string
    description?: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    estimatedMinutes?: number
  }) => void
  className?: string
}

interface VoiceState {
  isRecording: boolean
  isProcessing: boolean
  isPlaying: boolean
  transcript: string
  confidence: number
  duration: number
  audioBlob?: Blob
}



const VOICE_COMMANDS = [
  { command: "Create task", description: "Start a new task" },
  { command: "High priority", description: "Mark as high priority" },
  { command: "Due today", description: "Set due date to today" },
  { command: "30 minutes", description: "Set estimated time" },
  { command: "Complete", description: "Finish voice input" }
]

export default function VoiceTaskCreator({
  isOpen,
  onClose,
  onTaskCreate,
  className = ""
}: VoiceTaskCreatorProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isRecording: false,
    isProcessing: false,
    isPlaying: false,
    transcript: '',
    confidence: 0,
    duration: 0,
    audioBlob: undefined
  })

  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    estimatedMinutes: 0
  })

  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<any>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Check for browser support
  useEffect(() => {
    const checkSupport = () => {
      const hasSpeechRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
      const hasMediaRecorder = 'MediaRecorder' in window
      const hasGetUserMedia = 'getUserMedia' in navigator.mediaDevices

      setIsSupported(hasSpeechRecognition && hasMediaRecorder && hasGetUserMedia)

      if (!hasSpeechRecognition) {
        setError('Speech recognition not supported in this browser')
      }
    }

    checkSupport()
  }, [])

  // Initialize speech recognition
  useEffect(() => {
    if (!isSupported || !isOpen) return

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()

      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        setVoiceState(prev => ({ ...prev, isRecording: true, error: null }))
        setError(null)
      }

      recognition.onresult = (event: any) => {
        let finalTranscript = ''
        let interimTranscript = ''
        let confidence = 0

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          if (result.isFinal) {
            finalTranscript += result[0].transcript
            confidence = result[0].confidence
          } else {
            interimTranscript += result[0].transcript
          }
        }

        setVoiceState(prev => ({
          ...prev,
          transcript: finalTranscript || interimTranscript,
          confidence
        }))

        // Process voice commands
        processVoiceCommands(finalTranscript || interimTranscript)
      }

      recognition.onerror = (event: any) => {
        setError(`Speech recognition error: ${event.error}`)
        setVoiceState(prev => ({ ...prev, isRecording: false }))
      }

      recognition.onend = () => {
        setVoiceState(prev => ({ ...prev, isRecording: false }))
      }

      recognitionRef.current = recognition
    } catch (err) {
      setError('Failed to initialize speech recognition')
    }
  }, [isSupported, isOpen])

  // Process voice commands for task creation
  const processVoiceCommands = (transcript: string) => {
    const lowerTranscript = transcript.toLowerCase()

    // Extract task title
    if (lowerTranscript.includes('create task') || lowerTranscript.includes('new task')) {
      const taskMatch = transcript.match(/(?:create task|new task)\s+(.+)/i)
      if (taskMatch) {
        setTaskData(prev => ({ ...prev, title: taskMatch[1].trim() }))
      }
    }

    // Set priority
    if (lowerTranscript.includes('high priority') || lowerTranscript.includes('urgent')) {
      setTaskData(prev => ({ ...prev, priority: 'high' }))
    } else if (lowerTranscript.includes('low priority')) {
      setTaskData(prev => ({ ...prev, priority: 'low' }))
    }

    // Set estimated time
    const timeMatch = transcript.match(/(\d+)\s*(?:minutes?|mins?|hours?|hrs?)/i)
    if (timeMatch) {
      const time = parseInt(timeMatch[1])
      const isHours = lowerTranscript.includes('hour') || lowerTranscript.includes('hr')
      setTaskData(prev => ({
        ...prev,
        estimatedMinutes: isHours ? time * 60 : time
      }))
    }

    // Set description
    if (lowerTranscript.includes('description') || lowerTranscript.includes('details')) {
      const descMatch = transcript.match(/(?:description|details)\s+(.+)/i)
      if (descMatch) {
        setTaskData(prev => ({ ...prev, description: descMatch[1].trim() }))
      }
    }
  }

  const startRecording = async () => {
    if (!recognitionRef.current) return

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true })

      setError(null)
      recognitionRef.current.start()

      // Start duration timer
      intervalRef.current = setInterval(() => {
        setVoiceState(prev => ({ ...prev, duration: prev.duration + 1 }))
      }, 1000)
    } catch (err) {
      setError('Microphone access denied or not available')
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const playRecording = () => {
    if (voiceState.audioBlob && audioRef.current) {
      audioRef.current.play()
      setVoiceState(prev => ({ ...prev, isPlaying: true }))
    }
  }

  const pauseRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setVoiceState(prev => ({ ...prev, isPlaying: false }))
    }
  }

  const handleCreateTask = () => {
    if (!taskData.title.trim()) {
      setError('Task title is required')
      return
    }

    onTaskCreate(taskData)
    setTaskData({ title: '', description: '', priority: 'medium', estimatedMinutes: 0 })
    setVoiceState({
      isRecording: false,
      isProcessing: false,
      isPlaying: false,
      transcript: '',
      confidence: 0,
      duration: 0,
      audioBlob: undefined
    })
    onClose()
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end lg:items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={cn(
            "w-full max-w-md bg-dark-bg border border-gray-800 rounded-sm shadow-[0_0_20px_rgba(11,228,236,0.2)]",
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 font-orbitron uppercase tracking-wider text-white">
                  <Mic className="h-5 w-5 text-neon-purple" />
                  Voice Task Creator
                  <Sparkles className="h-4 w-4 text-neon-purple" />
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Voice Controls */}
              <div className="text-center space-y-4">
                <div className="relative">
                  <motion.div
                    className={cn(
                      "w-24 h-24 mx-auto rounded-full flex items-center justify-center transition-all duration-300",
                      voiceState.isRecording
                        ? "bg-neon-magenta animate-pulse"
                        : "bg-dark-card border border-neon-purple hover:bg-dark-hover"
                    )}
                    animate={voiceState.isRecording ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.5, repeat: voiceState.isRecording ? Infinity : 0 }}
                  >
                    {voiceState.isRecording ? (
                      <Square className="h-8 w-8 text-white" />
                    ) : (
                      <Mic className="h-8 w-8 text-neon-purple" />
                    )}
                  </motion.div>

                  {voiceState.isRecording && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-neon-magenta/50"
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      onClick={voiceState.isRecording ? stopRecording : startRecording}
                      disabled={!isSupported}
                      className={cn(
                        "touch-target",
                        voiceState.isRecording
                          ? "bg-neon-magenta hover:bg-neon-magenta/80"
                          : "bg-neon-purple hover:bg-neon-purple/80",
                        "font-mono font-bold uppercase tracking-wider"
                      )}
                    >
                      {voiceState.isRecording ? (
                        <>
                          <Square className="h-4 w-4 mr-2" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4 mr-2" />
                          Start Recording
                        </>
                      )}
                    </Button>
                  </div>

                  {voiceState.duration > 0 && (
                    <div className="text-sm text-gray-300 font-mono">
                      Duration: {formatDuration(voiceState.duration)}
                    </div>
                  )}
                </div>
              </div>

              {/* Transcript Display */}
              {voiceState.transcript && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Voice Transcript:</label>
                  <div className="p-3 bg-dark-card border border-gray-700 rounded-sm">
                    <div className="text-sm font-mono text-gray-300">{voiceState.transcript}</div>
                    {voiceState.confidence > 0 && (
                      <div className="text-xs text-gray-500 mt-1 font-mono">
                        Confidence: {Math.round(voiceState.confidence * 100)}%
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Task Form */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Task Title *</label>
                  <Input
                    value={taskData.title}
                    onChange={(e) => setTaskData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter task title or speak it..."
                    className="touch-target"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={taskData.description}
                    onChange={(e) => setTaskData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Add task description..."
                    rows={3}
                    className="touch-target"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <select
                      value={taskData.priority}
                      onChange={(e) => setTaskData(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full p-2 border border-gray-700 rounded-sm bg-dark-card text-gray-300 font-mono touch-target focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
                      aria-label="Task priority"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Est. Time (min)</label>
                    <Input
                      type="number"
                      value={taskData.estimatedMinutes}
                      onChange={(e) => setTaskData(prev => ({ ...prev, estimatedMinutes: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                      className="touch-target"
                    />
                  </div>
                </div>
              </div>

              {/* Voice Commands Help */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Voice Commands:</label>
                <div className="grid grid-cols-1 gap-2">
                  {VOICE_COMMANDS.map((cmd, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-gray-300 font-mono">
                      <Badge variant="outline" className="text-xs font-mono">
                        "{cmd.command}"
                      </Badge>
                      <span>{cmd.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-dark-card border border-neon-magenta rounded-sm">
                  <AlertCircle className="h-4 w-4 text-neon-magenta" />
                  <span className="text-sm text-neon-magenta font-mono">{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 touch-target"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTask}
                  disabled={!taskData.title.trim()}
                  className="flex-1 bg-neon-purple hover:bg-neon-purple/80 touch-target font-mono font-bold uppercase tracking-wider"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

