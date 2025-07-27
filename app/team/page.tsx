"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Mic, MicOff, Volume2, VolumeX, MessageCircle, Send, Users, ArrowLeft } from "lucide-react"
import { aiAgents } from "@/lib/landing-data"
import { useAIChat } from "@/hooks/use-ai-chat"
import Link from "next/link"

export default function TeamPage() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const [message, setMessage] = useState("")

  const selectedAgentData = selectedAgent ? aiAgents.find((agent) => agent.id === selectedAgent) : null

  const { chatHistory, sendMessage, isLoading } = useAIChat({
    memberId: selectedAgent || "roxy",
    initialHistory: [],
  })

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedAgent) return

    await sendMessage(message)
    setMessage("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <div className="flex items-center space-x-3">
                <Image
                  src="/images/soloboss-logo.png"
                  alt="SoloBoss AI"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <h1 className="text-2xl font-bold gradient-text-primary">AI Squad Command Center</h1>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{aiAgents.length} Agents Ready</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Agent Selection Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="gradient-text-primary">Your AI Squad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selectedAgent === agent.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedAgent(agent.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full gradient-primary p-0.5">
                          <Image
                            src={agent.image || "/placeholder.svg"}
                            alt={agent.name}
                            width={48}
                            height={48}
                            className="w-full h-full rounded-full object-cover"
                          />
                        </div>
                        {agent.voiceEnabled && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <Mic className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm gradient-text-primary">{agent.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">{agent.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2">
            {selectedAgentData ? (
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="border-b border-border/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full gradient-primary p-0.5">
                        <Image
                          src={selectedAgentData.image || "/placeholder.svg"}
                          alt={selectedAgentData.name}
                          width={48}
                          height={48}
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold gradient-text-primary">{selectedAgentData.name}</h2>
                        <p className="text-sm text-muted-foreground">{selectedAgentData.role}</p>
                      </div>
                    </div>

                    {selectedAgentData.voiceEnabled && (
                      <div className="flex items-center space-x-2">
                        <Button
                          variant={isVoiceActive ? "default" : "outline"}
                          size="sm"
                          onClick={() => setIsVoiceActive(!isVoiceActive)}
                          className={isVoiceActive ? "gradient-primary text-white" : ""}
                        >
                          {isVoiceActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant={isSpeakerOn ? "default" : "outline"}
                          size="sm"
                          onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                          className={isSpeakerOn ? "gradient-primary text-white" : ""}
                        >
                          {isSpeakerOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {selectedAgentData.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>

                {/* Chat Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatHistory.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">Start chatting with {selectedAgentData.name}</p>
                      <p className="text-sm">{selectedAgentData.description}</p>
                    </div>
                  ) : (
                    chatHistory.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            msg.sender === "user" ? "gradient-primary text-white" : "bg-muted text-foreground"
                          }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                          <p className="text-xs opacity-70 mt-1">{msg.timestamp}</p>
                        </div>
                      </div>
                    ))
                  )}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted text-foreground p-3 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                          <div
                            className="w-2 h-2 bg-current rounded-full animate-pulse"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-current rounded-full animate-pulse"
                            style={{ animationDelay: "0.4s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>

                {/* Message Input */}
                <div className="border-t border-border/40 p-4">
                  <div className="flex space-x-2">
                    <Textarea
                      placeholder={`Message ${selectedAgentData.name}...`}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 min-h-[44px] max-h-32 resize-none"
                      rows={1}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!message.trim() || isLoading}
                      className="gradient-primary text-white hover:opacity-90"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>

                  {isVoiceActive && (
                    <div className="mt-2 flex items-center justify-center">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span>Voice chat active - Speak now</span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="h-[600px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">Select an AI Agent</h3>
                  <p>Choose an agent from your squad to start chatting</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
