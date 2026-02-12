"use client"

import type React from "react"

// Force dynamic rendering to avoid build-time data structure errors
export const dynamic = 'force-dynamic'

import { useState} from "react"
import Image from "next/image"

import { Button} from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import { Badge} from "@/components/ui/badge"
import { Input} from "@/components/ui/input"
import { ScrollArea} from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import { Mic, MicOff, Volume2, VolumeX, Send, Crown, Sparkles, MessageCircle, Users, Zap, Shield, FileText, Search, BarChart3, Brain} from "lucide-react"
import { aiAgents} from "@/lib/landing-data"
import { useAiChat} from "@/hooks/use-ai-chat"
import { GuardianAiDashboard} from "@/components/guardian-ai/guardian-ai-dashboard"
import { ComplianceScanner} from "@/components/guardian-ai/compliance-scanner"
import { PolicyGenerator} from "@/components/guardian-ai/policy-generator"
import { CostBenefitMatrix} from "@/components/decision-frameworks/cost-benefit-matrix"
import { SpadeFramework} from "@/components/decision-frameworks/spade-framework"
import { FiveWhysAnalysis} from "@/components/decision-frameworks/five-whys-analysis"
import { SubscriptionGuard} from "@/components/subscription/subscription-guard"
import { logError, logWarn } from "@/lib/logger"

export default function TeamPage() {
  const [selectedAgent, setSelectedAgent] = useState(aiAgents[0])
  const [message, setMessage] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const {
    messages,
    isLoading,
    append,
    setInput: _setInput,
    input: _input,
  } = useAiChat({ agentId: selectedAgent.id })

  const handleSendMessage = async () => {
    if (!message.trim()) return
    await append({ role: "user", content: message })
    setMessage("")
  }

  const _sendMessage = async (_text: string) => {
    await append({ role: "user", content: _text })
  }

  const clearMessages = () => {
    // This would need to be implemented in the hook or we can work around it
  }

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    // @ts-ignore - separate declaration for browser compatibility
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript);
      // Optional: Auto-send after voice input
      // handleSendMessage(); 
    };

    recognition.onerror = (event: any) => {
      logError('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }

  const stopListening = () => {
    // Logic handled by recognition.stop() usually, or we can manually force stop if we kept the instance ref
    setIsListening(false)
  }

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) {
      logWarn('Text-to-speech not supported');
      return;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    // Try to find a voice that matches the agent's personality/gender if possible
    // For now, we use the default
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSpeakResponse = (text: string) => {
    if (isSpeaking) {
      stopSpeaking()
    } else {
      speak(text)
    }
  }

  return (
    <SubscriptionGuard 
      requiredTier="accelerator" 
      feature="AI Team Collaboration"
    >
      <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <div className="border-b border-gray-700 bg-dark-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Crown className="w-8 h-8 text-neon-cyan" />
              <div>
                <h1 className="text-2xl font-bold font-orbitron text-white uppercase tracking-wider">AI Squad Command Center</h1>
                <p className="text-sm text-gray-400 font-mono">Manage your 8 specialized AI agents</p>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-neon-purple to-neon-magenta text-white border-0">
              <Users className="w-4 h-4 mr-2" />8 Agents Active
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Agent Selection Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center font-orbitron text-white uppercase tracking-wider">
                  <Sparkles className="w-5 h-5 mr-2 text-neon-cyan" />
                  Your AI Squad
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="space-y-2 p-4">
                    {aiAgents.map((agent) => (
                      <Button
                        key={agent.id}
                        variant={selectedAgent.id === agent.id ? "purple" : "ghost"}
                        className={`w-full justify-start p-4 h-auto ${
                          selectedAgent.id === agent.id ? "bg-gradient-to-r from-neon-purple to-neon-magenta text-white shadow-[0_0_15px_rgba(179,0,255,0.3)]" : "hover:bg-dark-hover"
                        }`}
                        onClick={() => setSelectedAgent(agent)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${agent.color} p-0.5`}>
                            <div className="w-full h-full rounded-full bg-dark-bg flex items-center justify-center">
                              <Image
                                src={agent.avatar || "/default-user.svg"}
                                alt={agent.name}
                                width={32}
                                height={32}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            </div>
                          </div>
                          <div className="text-left">
                            <div className="font-medium">{agent.name}</div>
                            <div className="text-xs font-mono text-gray-400 opacity-80">{agent.role}</div>
                            {agent.isVoiceEnabled && (
                              <Badge className="mt-1 bg-neon-lime/20 text-neon-lime border-neon-lime/30 text-xs font-mono">
                                🎤 Voice
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Main Interface */}
          <div className="lg:col-span-3">
            {selectedAgent.id === "lumi" ? (
              // Guardian AI Interface for Lumi
              <Card className="h-[700px] flex flex-col">
                <CardHeader className="border-b border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${selectedAgent.color} p-0.5`}>
                        <div className="w-full h-full rounded-full bg-dark-bg flex items-center justify-center">
                          <Image
                            src={selectedAgent.avatar || "/default-user.svg"}
                            alt={selectedAgent.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        </div>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">{selectedAgent.name}</h2>
                        <p className="text-sm text-primary font-medium">{selectedAgent.role}</p>
                        <p className="text-xs font-mono text-gray-400 hover:text-neon-cyan mt-1">
                          {selectedAgent.specialty}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-neon-purple to-neon-magenta text-white border-0 shadow-[0_0_15px_rgba(179,0,255,0.3)]">
                      <Shield className="w-4 h-4 mr-1" />
                      Guardian AI
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 p-0">
                  <Tabs defaultValue="dashboard" className="h-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="dashboard" className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Dashboard
                      </TabsTrigger>
                      <TabsTrigger value="scanner" className="flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        Scanner
                      </TabsTrigger>
                      <TabsTrigger value="policies" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Policies
                      </TabsTrigger>
                      <TabsTrigger value="chat" className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Chat
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="dashboard" className="h-[600px] overflow-auto">
                      <GuardianAiDashboard />
                    </TabsContent>

                    <TabsContent value="scanner" className="h-[600px] overflow-auto">
                      <ComplianceScanner />
                    </TabsContent>

                    <TabsContent value="policies" className="h-[600px] overflow-auto">
                      <PolicyGenerator />
                    </TabsContent>

                    <TabsContent value="chat" className="h-[600px] flex flex-col">
                      <ScrollArea className="flex-1 p-4">
                        {messages.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${selectedAgent.color} p-1 mb-4`}>
                              <div className="w-full h-full rounded-full bg-dark-bg flex items-center justify-center">
                                <Image
                                  src={selectedAgent.avatar || "/default-user.svg"}
                                  alt={selectedAgent.name}
                                  width={64}
                                  height={64}
                                  className="w-16 h-16 rounded-full object-cover"
                                />
                              </div>
                            </div>
                            <h3 className="text-lg font-semibold font-orbitron text-white mb-2 uppercase tracking-wider">Chat with {selectedAgent.name}</h3>
                            <p className="text-gray-400 font-mono max-w-md">
                              Ask me about compliance, legal requirements, or get help with policy generation.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {messages.map((msg) => (
                              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div
                                  className={`max-w-[80%] rounded-sm p-3 ${
                                    msg.role === "user" ? "bg-gradient-to-r from-neon-cyan to-neon-purple text-white shadow-[0_0_15px_rgba(11,228,236,0.3)]" : "bg-dark-card border border-gray-700"
                                  }`}
                                >
                                  <p className="text-sm">{msg.content}</p>
                                  {msg.role === "assistant" && selectedAgent.isVoiceEnabled && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="mt-2 h-6 px-2 text-xs font-mono text-gray-400 hover:text-neon-cyan"
                                      onClick={() => handleSpeakResponse(msg.content)}
                                    >
                                      {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                            {isLoading && (
                              <div className="flex justify-start">
                                <div className="bg-dark-card rounded-sm p-3 max-w-[80%]">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce delay-100"></div>
                                    <div className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce delay-200"></div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </ScrollArea>

                      <div className="border-t border-gray-700 p-4">
                        <div className="flex items-center space-x-2">
                          <Input
                            placeholder={`Message ${selectedAgent.name}...`}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isLoading}
                            className="flex-1 bg-dark-bg border-gray-700 focus:border-neon-cyan focus:ring-neon-cyan/20 font-mono"
                          />
                          <Button
                            onClick={handleSendMessage}
                            disabled={isLoading || !message.trim()}
                            size="sm"
                            className="gradient-primary text-white hover:opacity-90"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" onClick={clearMessages} className="text-xs font-mono text-gray-400 hover:text-neon-cyan">
                              Clear Chat
                            </Button>
                          </div>

                          <div className="flex items-center space-x-2 text-xs font-mono text-gray-400 hover:text-neon-cyan">
                            <MessageCircle className="w-3 h-3" />
                            <span>{messages.length} messages</span>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : selectedAgent.id === "blaze" ? (
              // Decision Framework Interface for Blaze
              <Card className="h-[700px] flex flex-col">
                <CardHeader className="border-b border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${selectedAgent.color} p-0.5`}>
                        <div className="w-full h-full rounded-full bg-dark-bg flex items-center justify-center">
                          <Image
                            src={selectedAgent.avatar || "/default-user.svg"}
                            alt={selectedAgent.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        </div>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">{selectedAgent.name}</h2>
                        <p className="text-sm text-primary font-medium">{selectedAgent.role}</p>
                        <p className="text-xs font-mono text-gray-400 hover:text-neon-cyan mt-1">
                          {selectedAgent.specialty}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-neon-purple to-neon-magenta text-white border-0 shadow-[0_0_15px_rgba(179,0,255,0.3)]">
                      <Zap className="w-4 h-4 mr-1" />
                      Decision Framework
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 p-0">
                  <Tabs defaultValue="matrix" className="h-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="matrix" className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Decision Matrix
                      </TabsTrigger>
                      <TabsTrigger value="chat" className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Chat
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="matrix" className="h-[600px] overflow-auto">
                      <CostBenefitMatrix />
                    </TabsContent>

                    <TabsContent value="chat" className="h-[600px] flex flex-col">
                      <ScrollArea className="flex-1 p-4">
                        {messages.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${selectedAgent.color} p-1 mb-4`}>
                              <div className="w-full h-full rounded-full bg-dark-bg flex items-center justify-center">
                                <Image
                                  src={selectedAgent.avatar || "/default-user.svg"}
                                  alt={selectedAgent.name}
                                  width={64}
                                  height={64}
                                  className="w-16 h-16 rounded-full object-cover"
                                />
                              </div>
                            </div>
                            <h3 className="text-lg font-semibold font-orbitron text-white mb-2 uppercase tracking-wider">Chat with {selectedAgent.name}</h3>
                            <p className="text-gray-400 font-mono max-w-md">
                              Ask me about strategic decisions, growth strategies, or get help with decision-making frameworks.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {messages.map((msg) => (
                              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div
                                  className={`max-w-[80%] rounded-sm p-3 ${
                                    msg.role === "user" ? "bg-gradient-to-r from-neon-cyan to-neon-purple text-white shadow-[0_0_15px_rgba(11,228,236,0.3)]" : "bg-dark-card border border-gray-700"
                                  }`}
                                >
                                  <p className="text-sm">{msg.content}</p>
                                  {msg.role === "assistant" && selectedAgent.isVoiceEnabled && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="mt-2 h-6 px-2 text-xs font-mono text-gray-400 hover:text-neon-cyan"
                                      onClick={() => handleSpeakResponse(msg.content)}
                                    >
                                      {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                            {isLoading && (
                              <div className="flex justify-start">
                                <div className="bg-dark-card rounded-sm p-3 max-w-[80%]">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce delay-100"></div>
                                    <div className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce delay-200"></div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </ScrollArea>

                      <div className="border-t border-gray-700 p-4">
                        <div className="flex items-center space-x-2">
                          <Input
                            placeholder={`Message ${selectedAgent.name}...`}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isLoading}
                            className="flex-1 bg-dark-bg border-gray-700 focus:border-neon-cyan focus:ring-neon-cyan/20 font-mono"
                          />
                          <Button
                            onClick={handleSendMessage}
                            disabled={isLoading || !message.trim()}
                            size="sm"
                            className="gradient-primary text-white hover:opacity-90"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" onClick={clearMessages} className="text-xs font-mono text-gray-400 hover:text-neon-cyan">
                              Clear Chat
                            </Button>
                          </div>

                          <div className="flex items-center space-x-2 text-xs font-mono text-gray-400 hover:text-neon-cyan">
                            <MessageCircle className="w-3 h-3" />
                            <span>{messages.length} messages</span>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : selectedAgent.id === "roxy" ? (
              // SPADE Framework Interface for Roxy
              <Card className="h-[700px] flex flex-col">
                <CardHeader className="border-b border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${selectedAgent.color} p-0.5`}>
                        <div className="w-full h-full rounded-full bg-dark-bg flex items-center justify-center">
                          <Image
                            src={selectedAgent.avatar || "/default-user.svg"}
                            alt={selectedAgent.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        </div>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">{selectedAgent.name}</h2>
                        <p className="text-sm text-primary font-medium">{selectedAgent.role}</p>
                        <p className="text-xs font-mono text-gray-400 hover:text-neon-cyan mt-1">
                          {selectedAgent.specialty}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-neon-purple to-neon-magenta text-white border-0 shadow-[0_0_15px_rgba(179,0,255,0.3)]">
                      <Brain className="w-4 h-4 mr-1" />
                      SPADE Framework
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 p-0">
                  <Tabs defaultValue="spade" className="h-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="spade" className="flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        SPADE Analysis
                      </TabsTrigger>
                      <TabsTrigger value="chat" className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Chat
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="spade" className="h-[600px] overflow-auto">
                      <SpadeFramework />
                    </TabsContent>

                    <TabsContent value="chat" className="h-[600px] flex flex-col">
                      <ScrollArea className="flex-1 p-4">
                        {messages.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${selectedAgent.color} p-1 mb-4`}>
                              <div className="w-full h-full rounded-full bg-dark-bg flex items-center justify-center">
                                <Image
                                  src={selectedAgent.avatar || "/default-user.svg"}
                                  alt={selectedAgent.name}
                                  width={64}
                                  height={64}
                                  className="w-16 h-16 rounded-full object-cover"
                                />
                              </div>
                            </div>
                            <h3 className="text-lg font-semibold font-orbitron text-white mb-2 uppercase tracking-wider">Chat with {selectedAgent.name}</h3>
                            <p className="text-gray-400 font-mono max-w-md">
                              Ask me about Type 1 decisions, strategic planning, or get help with the SPADE framework for irreversible choices.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {messages.map((msg) => (
                              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div
                                  className={`max-w-[80%] rounded-sm p-3 ${
                                    msg.role === "user" ? "bg-gradient-to-r from-neon-cyan to-neon-purple text-white shadow-[0_0_15px_rgba(11,228,236,0.3)]" : "bg-dark-card border border-gray-700"
                                  }`}
                                >
                                  <p className="text-sm">{msg.content}</p>
                                  {msg.role === "assistant" && selectedAgent.isVoiceEnabled && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="mt-2 h-6 px-2 text-xs font-mono text-gray-400 hover:text-neon-cyan"
                                      onClick={() => handleSpeakResponse(msg.content)}
                                    >
                                      {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                            {isLoading && (
                              <div className="flex justify-start">
                                <div className="bg-dark-card rounded-sm p-3 max-w-[80%]">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce delay-100"></div>
                                    <div className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce delay-200"></div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </ScrollArea>

                      <div className="border-t border-gray-700 p-4">
                        <div className="flex items-center space-x-2">
                          <Input
                            placeholder={`Message ${selectedAgent.name}...`}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isLoading}
                            className="flex-1 bg-dark-bg border-gray-700 focus:border-neon-cyan focus:ring-neon-cyan/20 font-mono"
                          />
                          <Button
                            onClick={handleSendMessage}
                            disabled={isLoading || !message.trim()}
                            size="sm"
                            className="gradient-primary text-white hover:opacity-90"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" onClick={clearMessages} className="text-xs font-mono text-gray-400 hover:text-neon-cyan">
                              Clear Chat
                            </Button>
                          </div>

                          <div className="flex items-center space-x-2 text-xs font-mono text-gray-400 hover:text-neon-cyan">
                            <MessageCircle className="w-3 h-3" />
                            <span>{messages.length} messages</span>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : selectedAgent.id === "glitch" ? (
              // Five Whys Analysis Interface for Glitch
              <Card className="h-[700px] flex flex-col">
                <CardHeader className="border-b border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${selectedAgent.color} p-0.5`}>
                        <div className="w-full h-full rounded-full bg-dark-bg flex items-center justify-center">
                          <Image
                            src={selectedAgent.avatar || "/default-user.svg"}
                            alt={selectedAgent.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        </div>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">{selectedAgent.name}</h2>
                        <p className="text-sm text-primary font-medium">{selectedAgent.role}</p>
                        <p className="text-xs font-mono text-gray-400 hover:text-neon-cyan mt-1">
                          {selectedAgent.specialty}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-neon-purple to-neon-magenta text-white border-0 shadow-[0_0_15px_rgba(179,0,255,0.3)]">
                      <Brain className="w-4 h-4 mr-1" />
                      Five Whys Analysis
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 p-0">
                  <Tabs defaultValue="five-whys" className="h-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="five-whys" className="flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        Root Cause Analysis
                      </TabsTrigger>
                      <TabsTrigger value="chat" className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Chat
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="five-whys" className="h-[600px] overflow-auto">
                      <FiveWhysAnalysis />
                    </TabsContent>

                    <TabsContent value="chat" className="h-[600px] flex flex-col">
                      <ScrollArea className="flex-1 p-4">
                        {messages.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${selectedAgent.color} p-1 mb-4`}>
                              <div className="w-full h-full rounded-full bg-dark-bg flex items-center justify-center">
                                <Image
                                  src={selectedAgent.avatar || "/default-user.svg"}
                                  alt={selectedAgent.name}
                                  width={64}
                                  height={64}
                                  className="w-16 h-16 rounded-full object-cover"
                                />
                              </div>
                            </div>
                            <h3 className="text-lg font-semibold font-orbitron text-white mb-2 uppercase tracking-wider">Chat with {selectedAgent.name}</h3>
                            <p className="text-gray-400 font-mono max-w-md">
                              Ask me about problem-solving, root cause analysis, or get help with the Five Whys methodology for systematic investigation.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {messages.map((msg) => (
                              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div
                                  className={`max-w-[80%] rounded-sm p-3 ${
                                    msg.role === "user" ? "bg-gradient-to-r from-neon-cyan to-neon-purple text-white shadow-[0_0_15px_rgba(11,228,236,0.3)]" : "bg-dark-card border border-gray-700"
                                  }`}
                                >
                                  <p className="text-sm">{msg.content}</p>
                                  {msg.role === "assistant" && selectedAgent.isVoiceEnabled && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="mt-2 h-6 px-2 text-xs font-mono text-gray-400 hover:text-neon-cyan"
                                      onClick={() => handleSpeakResponse(msg.content)}
                                    >
                                      {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                            {isLoading && (
                              <div className="flex justify-start">
                                <div className="bg-dark-card rounded-sm p-3 max-w-[80%]">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce delay-100"></div>
                                    <div className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce delay-200"></div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </ScrollArea>

                      <div className="border-t border-gray-700 p-4">
                        <div className="flex items-center space-x-2">
                          <Input
                            placeholder={`Message ${selectedAgent.name}...`}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isLoading}
                            className="flex-1 bg-dark-bg border-gray-700 focus:border-neon-cyan focus:ring-neon-cyan/20 font-mono"
                          />
                          <Button
                            onClick={handleSendMessage}
                            disabled={isLoading || !message.trim()}
                            size="sm"
                            className="gradient-primary text-white hover:opacity-90"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" onClick={clearMessages} className="text-xs font-mono text-gray-400 hover:text-neon-cyan">
                              Clear Chat
                            </Button>
                          </div>

                          <div className="flex items-center space-x-2 text-xs font-mono text-gray-400 hover:text-neon-cyan">
                            <MessageCircle className="w-3 h-3" />
                            <span>{messages.length} messages</span>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              // Regular Chat Interface for other agents
              <Card className="h-[700px] flex flex-col">
                {/* Agent Header */}
                <CardHeader className="border-b border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${selectedAgent.color} p-0.5`}>
                        <div className="w-full h-full rounded-full bg-dark-bg flex items-center justify-center">
                          <Image
                            src={selectedAgent.avatar || "/default-user.svg"}
                            alt={selectedAgent.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        </div>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">{selectedAgent.name}</h2>
                        <p className="text-sm text-primary font-medium">{selectedAgent.role}</p>
                        <p className="text-xs font-mono text-gray-400 hover:text-neon-cyan mt-1">
                          {selectedAgent.specialty}
                        </p>
                      </div>
                    </div>

                    {/* Voice Controls */}
                    {selectedAgent.isVoiceEnabled && (
                      <div className="flex items-center space-x-2">
                        <Button
                          variant={isListening ? "magenta" : "outline"}
                          size="sm"
                          onClick={isListening ? stopListening : startListening}
                          className={isListening ? "animate-pulse-mic" : ""}
                        >
                          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </Button>

                        {/* Audio Level Indicator */}
                        {isListening && (
                          <div className="flex items-center space-x-1">
                            <div className="w-1 bg-green-500 rounded-full animate-audio-wave"></div>
                            <div className="w-1 bg-green-500 rounded-full animate-audio-wave"></div>
                            <div className="w-1 bg-green-500 rounded-full animate-audio-wave"></div>
                            <div className="w-1 bg-green-500 rounded-full animate-audio-wave"></div>
                            <div className="w-1 bg-green-500 rounded-full animate-audio-wave"></div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>

                {/* Chat Messages */}
                <CardContent className="flex-1 p-0">
                  <ScrollArea className="h-full p-4">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${selectedAgent.color} p-1 mb-4`}>
                          <div className="w-full h-full rounded-full bg-dark-bg flex items-center justify-center">
                            <Image
                              src={selectedAgent.avatar || "/default-user.svg"}
                              alt={selectedAgent.name}
                              width={64}
                              height={64}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold font-orbitron text-white mb-2 uppercase tracking-wider">Chat with {selectedAgent.name}</h3>
                        <p className="text-gray-400 font-mono max-w-md">
                          Start a conversation with your {selectedAgent.role.toLowerCase()}.
                          {selectedAgent.isVoiceEnabled && " You can type or use voice commands."}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((msg) => (
                          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`max-w-[80%] rounded-sm p-3 ${
                                msg.role === "user" ? "bg-gradient-to-r from-neon-cyan to-neon-purple text-white shadow-[0_0_15px_rgba(11,228,236,0.3)]" : "bg-dark-card border border-gray-700"
                              }`}
                            >
                              <p className="text-sm">{msg.content}</p>
                              {msg.role === "assistant" && selectedAgent.isVoiceEnabled && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="mt-2 h-6 px-2 text-xs font-mono text-gray-400 hover:text-neon-cyan"
                                  onClick={() => handleSpeakResponse(msg.content)}
                                >
                                  {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                        {isLoading && (
                          <div className="flex justify-start">
                            <div className="bg-dark-card rounded-sm p-3 max-w-[80%]">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce delay-100"></div>
                                <div className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce delay-200"></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </ScrollArea>

                  <div className="border-t border-gray-700 p-4">
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder={`Message ${selectedAgent.name}...`}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                        className="flex-1 bg-dark-bg border-gray-700 focus:border-neon-cyan focus:ring-neon-cyan/20 font-mono"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={isLoading || !message.trim()}
                        size="sm"
                        className="gradient-primary text-white hover:opacity-90"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={clearMessages} className="text-xs font-mono text-gray-400 hover:text-neon-cyan">
                          Clear Chat
                        </Button>
                      </div>

                      <div className="flex items-center space-x-2 text-xs font-mono text-gray-400 hover:text-neon-cyan">
                        <MessageCircle className="w-3 h-3" />
                        <span>{messages.length} messages</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      </div>
    </SubscriptionGuard>
  )
}
