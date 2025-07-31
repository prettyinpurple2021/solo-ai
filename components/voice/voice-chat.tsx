"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Mic, MicOff, Volume2, Loader2, Sparkles, Headphones, Radio } from "lucide-react"

interface VoiceChatProps {
  agentId: string
  agentName: string
  agentAvatar: string
  onTranscript?: (_text: string) => void
  onResponse?: (_text: string) => void
}

/**
 * VoiceChat component provides voice interaction with AI agents
 * Supports speech recognition and text-to-speech synthesis
 */
export function VoiceChat({ agentId, agentName, agentAvatar, onTranscript, onResponse }: VoiceChatProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [audioLevel, setAudioLevel] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<any>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null)

  useEffect(() => {
    // Initialize speech synthesis
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis
    }

    // Initialize speech recognition
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()

      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = ""
        let interimTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        const fullTranscript = finalTranscript || interimTranscript
        setTranscript(fullTranscript)

        if (finalTranscript && onTranscript) {
          onTranscript(finalTranscript)
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        setError(`Speech recognition error: ${event.error}`)
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (synthRef.current) {
        synthRef.current.cancel()
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [onTranscript])

  const startListening = async () => {
    try {
      setError(null)

      // Request microphone permission and set up audio level monitoring
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream)

      microphoneRef.current.connect(analyserRef.current)
      analyserRef.current.fftSize = 256

      const bufferLength = analyserRef.current.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const updateAudioLevel = () => {
        if (analyserRef.current && isListening) {
          analyserRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / bufferLength
          setAudioLevel(average)
          requestAnimationFrame(updateAudioLevel)
        }
      }

      updateAudioLevel()

      if (recognitionRef.current) {
        recognitionRef.current.start()
        setIsListening(true)
        setIsConnected(true)
      }
    } catch (error) {
      console.error("Microphone setup error:", error)
      setError("Microphone access denied or not available")
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
    setIsConnected(false)
    setAudioLevel(0)
  }

  const speak = (text: string) => {
    if (synthRef.current) {
      synthRef.current.cancel()

      const utterance = new SpeechSynthesisUtterance(text)

      // Try to find a female voice for more personality
      const voices = synthRef.current.getVoices()
      const femaleVoice = voices.find(
        (voice) =>
          voice.name.toLowerCase().includes("female") ||
          voice.name.toLowerCase().includes("woman") ||
          voice.name.toLowerCase().includes("samantha") ||
          voice.name.toLowerCase().includes("karen"),
      )

      if (femaleVoice) {
        utterance.voice = femaleVoice
      }

      utterance.rate = 1.1
      utterance.pitch = 1.1
      utterance.volume = 0.8

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      synthRef.current.speak(utterance)

      if (onResponse) {
        onResponse(text)
      }
    }
  }

  const getAgentGreeting = () => {
    const greetings = {
      roxy: "Hey boss! Ready to organize your empire? Let's chat! 💪",
      blaze: "What's up, money-maker! Ready to scale some serious business? 🔥",
      echo: "Hey creative queen! Let's brainstorm some viral content together! ✨",
      lumi: "Hello there! Need some legal guidance for your empire? I'm here! 🛡️",
      vex: "Tech time! What systems can I help you architect today? ⚙️",
      lexi: "Data-driven decisions incoming! What insights do you need? 📊",
      nova: "Design magic awaits! What beautiful things shall we create? 🎨",
      glitch: "Quality check time! Let's perfect your empire together! 🔍",
    }
    return greetings[agentId as keyof typeof greetings] || "Hey boss! How can I help you today? 💪"
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 punk-button bg-transparent">
          <Headphones className="h-4 w-4" />
          Voice Chat
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] boss-card border-2 border-purple-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 boss-heading">
            <img
              src={agentAvatar || "/placeholder.svg"}
              alt={agentName}
              className="w-8 h-8 rounded-full object-cover punk-shadow"
            />
            Voice Chat with {agentName}
            <Badge className="girlboss-badge ml-auto">
              <Radio className="w-3 h-3 mr-1" />
              LIVE
            </Badge>
          </DialogTitle>
          <DialogDescription className="font-medium">
            Have a natural conversation with your AI squad member! 🎤
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Connection Status */}
          <Card className={`boss-card ${isConnected ? "bg-green-50 border-green-200" : "bg-gray-50"}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
                  />
                  <span className="font-medium">{isConnected ? "Connected & Ready!" : "Ready to Connect"}</span>
                </div>
                {isConnected && (
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <Sparkles className="h-3 w-3" />
                    Live Chat Active
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Audio Visualization */}
          {isListening && (
            <Card className="boss-card">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Audio Level</span>
                    <span className="text-xs text-muted-foreground">Listening...</span>
                  </div>
                  <Progress value={(audioLevel / 255) * 100} className="h-2" />
                  <div className="flex justify-center">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 h-8 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full transition-all duration-150 ${
                            audioLevel > (i * 50) ? "opacity-100" : "opacity-30"
                          }`}
                          style={{
                            transform: audioLevel > i * 50 ? "scaleY(1.5)" : "scaleY(1)",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transcript Display */}
          {transcript && (
            <Card className="boss-card">
              <CardHeader>
                <CardTitle className="text-sm">You said:</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium bg-purple-50 p-3 rounded-lg">"{transcript}"</p>
              </CardContent>
            </Card>
          )}

          {/* Controls */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={isListening ? stopListening : startListening}
              className={`punk-button text-white flex items-center gap-2 ${
                isListening ? "bg-red-500 hover:bg-red-600" : ""
              }`}
              disabled={isSpeaking}
            >
              {isListening ? (
                <>
                  <MicOff className="h-4 w-4" />
                  Stop Listening
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  Start Listening
                </>
              )}
            </Button>

            <Button
              onClick={() => speak(getAgentGreeting())}
              variant="outline"
              className="punk-button border-2 border-purple-200 hover:border-purple-400"
              disabled={isListening || isSpeaking}
            >
              {isSpeaking ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Speaking...
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4" />
                  Test Voice
                </>
              )}
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold empowering-text">Quick Voice Commands:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => speak("What can you help me with today?")}
                className="justify-start text-left h-auto p-2"
                disabled={isSpeaking}
              >
                "What can you help me with?"
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => speak("Tell me about my productivity today")}
                className="justify-start text-left h-auto p-2"
                disabled={isSpeaking}
              >
                "How's my productivity?"
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => speak("Help me plan my day")}
                className="justify-start text-left h-auto p-2"
                disabled={isSpeaking}
              >
                "Help me plan my day"
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => speak("Give me some motivation")}
                className="justify-start text-left h-auto p-2"
                disabled={isSpeaking}
              >
                "Give me motivation"
              </Button>
            </div>
          </div>

          {error && (
            <Card className="boss-card border-red-200 bg-red-50">
              <CardContent className="p-3">
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Status Indicators */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Mic className={`h-3 w-3 ${isListening ? "text-green-500" : "text-gray-400"}`} />
                <span>Microphone {isListening ? "Active" : "Inactive"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Volume2 className={`h-3 w-3 ${isSpeaking ? "text-blue-500" : "text-gray-400"}`} />
                <span>Speaker {isSpeaking ? "Active" : "Inactive"}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-purple-500" />
              <span>AI Voice Chat Beta</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
