"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AuthGuard } from "@/components/auth/auth-guard"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { AI_SQUAD } from "@/lib/landing-data"
import { useAIChat } from "@/hooks/use-ai-chat"
import { MessageSquare, Mic, MicOff, Volume2, VolumeX } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import Image from "next/image"

export default function TeamPage() {
  const [selectedAgent, setSelectedAgent] = useState(AI_SQUAD[0])
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useAIChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: `Hey boss! I'm ${selectedAgent.name}, your ${selectedAgent.role}. Ready to build your empire together? What can I help you dominate today?`,
      },
    ],
  })

  const handleVoiceToggle = () => {
    if (isListening) {
      // Stop listening
      setIsListening(false)
      setAudioLevel(0)
    } else {
      // Start listening
      setIsListening(true)
      // Simulate audio level changes
      const interval = setInterval(() => {
        setAudioLevel(Math.random() * 100)
      }, 100)

      setTimeout(() => {
        setIsListening(false)
        setAudioLevel(0)
        clearInterval(interval)
      }, 3000)
    }
  }

  const handleSpeakToggle = () => {
    setIsSpeaking(!isSpeaking)
  }

  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>AI Squad</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
              <div className="aspect-video rounded-xl bg-muted/50" />
              <div className="aspect-video rounded-xl bg-muted/50" />
              <div className="aspect-video rounded-xl bg-muted/50" />
            </div>

            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-6">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-bold gradient-text-primary mb-4">Your AI Squad Command Center</h1>
                  <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
                    Meet your personal army of 8 specialized AI agents. Each one is ready to help you dominate your
                    industry and build your empire.
                  </p>
                </div>

                <Tabs defaultValue="chat" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="chat">Squad Chat</TabsTrigger>
                    <TabsTrigger value="overview">Squad Overview</TabsTrigger>
                  </TabsList>

                  <TabsContent value="chat" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      {/* Agent Selection Sidebar */}
                      <div className="lg:col-span-1">
                        <h3 className="text-lg font-semibold mb-4 text-foreground">Choose Your Agent</h3>
                        <div className="space-y-2">
                          {AI_SQUAD.map((agent) => (
                            <Button
                              key={agent.id}
                              variant={selectedAgent.id === agent.id ? "default" : "ghost"}
                              className="w-full justify-start p-3 h-auto"
                              onClick={() => setSelectedAgent(agent)}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-purple-100 to-pink-100 dark:from-blue-900 dark:to-green-900 flex items-center justify-center">
                                  <Image
                                    src={agent.image || "/placeholder.svg"}
                                    alt={agent.name}
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="text-left">
                                  <div className="font-medium">{agent.name}</div>
                                  <div className="text-xs text-foreground/60">{agent.role}</div>
                                </div>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Chat Interface */}
                      <div className="lg:col-span-3">
                        <Card className="h-[600px] flex flex-col">
                          <CardHeader className="border-b">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-purple-100 to-pink-100 dark:from-blue-900 dark:to-green-900 flex items-center justify-center">
                                  <Image
                                    src={selectedAgent.image || "/placeholder.svg"}
                                    alt={selectedAgent.name}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <CardTitle className="text-lg">{selectedAgent.name}</CardTitle>
                                  <CardDescription>{selectedAgent.role}</CardDescription>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleVoiceToggle}
                                  className={`${isListening ? "bg-red-500 text-white" : ""}`}
                                >
                                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleSpeakToggle}
                                  className={`${isSpeaking ? "bg-blue-500 text-white" : ""}`}
                                >
                                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                </Button>
                              </div>
                            </div>
                            {isListening && (
                              <div className="mt-2">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-foreground/70">Listening...</span>
                                  <div className="flex-1 bg-muted rounded-full h-2">
                                    <div
                                      className="bg-red-500 h-2 rounded-full transition-all duration-100"
                                      style={{ width: `${audioLevel}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </CardHeader>

                          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((message) => (
                              <div
                                key={message.id}
                                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                              >
                                <div
                                  className={`max-w-[80%] rounded-lg p-3 ${
                                    message.role === "user" ? "gradient-primary text-white" : "bg-muted text-foreground"
                                  }`}
                                >
                                  {message.content}
                                </div>
                              </div>
                            ))}
                            {isLoading && (
                              <div className="flex justify-start">
                                <div className="bg-muted text-foreground rounded-lg p-3">
                                  <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" />
                                    <div
                                      className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce"
                                      style={{ animationDelay: "0.1s" }}
                                    />
                                    <div
                                      className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce"
                                      style={{ animationDelay: "0.2s" }}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </CardContent>

                          <div className="border-t p-4">
                            <form onSubmit={handleSubmit} className="flex space-x-2">
                              <input
                                value={input}
                                onChange={handleInputChange}
                                placeholder={`Chat with ${selectedAgent.name}...`}
                                className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                disabled={isLoading}
                              />
                              <Button type="submit" disabled={isLoading || !input.trim()}>
                                <MessageSquare className="w-4 h-4" />
                              </Button>
                            </form>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {AI_SQUAD.map((agent) => (
                        <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                          <CardHeader className="text-center">
                            <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden bg-gradient-to-r from-purple-100 to-pink-100 dark:from-blue-900 dark:to-green-900 flex items-center justify-center">
                              <Image
                                src={agent.image || "/placeholder.svg"}
                                alt={agent.name}
                                width={80}
                                height={80}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <CardTitle className="text-lg">{agent.name}</CardTitle>
                            <Badge variant="secondary" className="gradient-text-accent">
                              {agent.role}
                            </Badge>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-foreground/70 mb-4">{agent.description}</p>
                            <Button
                              className="w-full"
                              onClick={() => {
                                setSelectedAgent(agent)
                                // Switch to chat tab
                                const chatTab = document.querySelector('[value="chat"]') as HTMLButtonElement
                                chatTab?.click()
                              }}
                            >
                              Chat with {agent.name}
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  )
}
