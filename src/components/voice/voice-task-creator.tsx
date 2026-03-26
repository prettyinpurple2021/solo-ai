"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mic, MicOff, Loader2, Sparkles, ListChecks } from "lucide-react"
import { toast } from "sonner"
import { logError } from "@/lib/logger"
import { processVoiceIntent, VoiceIntent } from "@/lib/actions/voice-actions"

interface VoiceTaskCreatorProps {
    isOpen: boolean
    onClose: () => void
    onTaskCreate: (task: {
        title: string
        description?: string
        priority: 'low' | 'medium' | 'high' | 'urgent',
        estimatedMinutes?: number
        actions?: { type: string, content: string, order: number }[]
    }) => Promise<void>
}

export function VoiceTaskCreator({ isOpen, onClose, onTaskCreate }: VoiceTaskCreatorProps) {
    const [isListening, setIsListening] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [transcript, setTranscript] = useState("")
    const [parsedTask, setParsedTask] = useState<VoiceIntent | null>(null)

    const recognitionRef = useRef<any>(null)

    useEffect(() => {
        if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
            recognitionRef.current = new SpeechRecognition()
            recognitionRef.current.continuous = true
            recognitionRef.current.interimResults = true
            recognitionRef.current.lang = "en-US"

            recognitionRef.current.onresult = (event: any) => {
                let finalTranscript = ""
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript
                    }
                }
                if (finalTranscript) {
                    setTranscript(prev => prev + " " + finalTranscript)
                }
            }

            recognitionRef.current.onerror = (event: any) => {
                logError("Speech recognition error", new Error(event.error?.message || String(event.error)))
                setIsListening(false)
                toast.error("Voice recognition failed. Please try again.")
            }

            recognitionRef.current.onend = () => {
                setIsListening(false)
            }
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop()
            }
        }
    }, [])

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop()
            setIsListening(false)
            processTranscript(transcript)
        } else {
            setTranscript("")
            setParsedTask(null)
            recognitionRef.current?.start()
            setIsListening(true)
        }
    }

    const processTranscript = async (text: string) => {
        if (!text.trim()) return

        setIsProcessing(true)
        try {
            const result = await processVoiceIntent(text);
            setParsedTask(result);
        } catch (error) {
            logError("Error processing voice command:", error)
            toast.error("Failed to process voice command")
        } finally {
            setIsProcessing(false)
        }
    }

    const handleCreate = async () => {
        if (!parsedTask) return

        try {
            await onTaskCreate(parsedTask)
            toast.success("Task created successfully!")
            onClose()
        } catch (error) {
            // Error is handled by parent
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        Voice Task Creator
                    </DialogTitle>
                    <DialogDescription>
                        Speak naturally to create a task. Try "Urgent meeting with marketing team for 1 hour"
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="flex justify-center">
                        <Button
                            size="lg"
                            variant={isListening ? "magenta" : "cyan"}
                            className={`rounded-full w-16 h-16 ${isListening ? "animate-pulse" : ""}`}
                            onClick={toggleListening}
                        >
                            {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                        </Button>
                    </div>
                    <p className="text-center text-sm text-muted-foreground">
                        {isListening ? "Listening..." : "Tap microphone to start"}
                    </p>

                    {transcript && (
                        <div className="bg-muted p-3 rounded-md text-sm italic">
                            "{transcript}"
                        </div>
                    )}

                    {isProcessing && (
                        <div className="flex justify-center py-4">
                            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                        </div>
                    )}

                    {parsedTask && !isProcessing && (
                        <div className="space-y-4 border-t pt-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={parsedTask.title}
                                    onChange={(e) => setParsedTask({ ...parsedTask, title: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={parsedTask.description}
                                    onChange={(e) => setParsedTask({ ...parsedTask, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Priority</Label>
                                    <Select
                                        value={parsedTask.priority}
                                        onValueChange={(v: any) => setParsedTask({ ...parsedTask, priority: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Est. Minutes</Label>
                                    <Input
                                        type="number"
                                        value={parsedTask.estimatedMinutes}
                                        onChange={(e) => setParsedTask({ ...parsedTask, estimatedMinutes: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            {parsedTask.actions && parsedTask.actions.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <ListChecks className="w-4 h-4 text-purple-600" />
                                        Extracted Steps (Deep Command)
                                    </Label>
                                    <div className="space-y-2 bg-muted/50 p-3 rounded-md">
                                        {parsedTask.actions.map((action, idx) => (
                                            <div key={idx} className="flex items-start gap-3 text-sm">
                                                <span className="bg-purple-600 text-white w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px]">
                                                    {idx + 1}
                                                </span>
                                                <p className="text-gray-300">{action.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={!parsedTask || isProcessing}>
                        Create Task
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
