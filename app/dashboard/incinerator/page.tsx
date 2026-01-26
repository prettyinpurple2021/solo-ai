"use client"

export const dynamic = 'force-dynamic'

import { useState } from "react"
import { motion } from "framer-motion"
import {
    Flame,
    AlertTriangle,
    RefreshCw,
    ArrowRight,
    Target,
    Users,
    Zap
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle,} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"


import { toast } from "sonner"

interface IncineratorResult {
    score: number
    feedback: string[]
    pivots: string[]
    marketContext: string
}

export default function IncineratorPage() {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<IncineratorResult | null>(null)
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        targetAudience: "",
        problemSolved: ""
    })

    const handleIncinerate = async () => {
        if (!formData.title || !formData.description) {
            toast.error("Please provide at least a title and description.")
            return
        }

        setLoading(true)
        setResult(null)

        try {
            const response = await fetch('/api/incinerator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (!response.ok) {
                throw new Error('Incineration failed')
            }

            const data = await response.json()
            setResult(data)
            toast.success("Idea incinerated successfully!")
        } catch (error) {
            toast.error("Failed to incinerate idea. Please try again.")
            logError('Incinerator error:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black p-6 relative overflow-hidden font-mono">
            <div className="max-w-4xl mx-auto relative z-10 space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center justify-center p-4 bg-red-900/20 rounded-full mb-4 ring-1 ring-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                    >
                        <Flame className="w-12 h-12 text-red-500 animate-pulse" />
                    </motion.div>
                    <h1 className="text-4xl font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                        Idea Incinerator
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Brutal validation for your business ideas. We burn away the fluff to see if anything solid remains.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Input Form */}
                    <Card className="bg-dark-card border-neon-cyan/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white font-orbitron">
                                <Zap className="w-5 h-5 text-yellow-500" />
                                Idea Parameters
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-neon-cyan font-orbitron">Idea Title</Label>
                                <Input
                                    id="title"
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="bg-dark-bg border-neon-cyan/30 text-gray-300 focus:border-neon-cyan focus:ring-neon-cyan/20"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="problemSolved" className="text-neon-cyan font-orbitron">Problem Solved</Label>
                                <Textarea
                                    id="problemSolved"
                                    value={formData.problemSolved}
                                    onChange={(e) => setFormData({ ...formData, problemSolved: e.target.value })}
                                    rows={3}
                                    className="bg-dark-bg border-neon-cyan/30 text-gray-300 focus:border-neon-cyan focus:ring-neon-cyan/20 resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="targetAudience" className="text-neon-cyan font-orbitron">Target Audience</Label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                                    <Input
                                        id="targetAudience"
                                        type="text"
                                        value={formData.targetAudience}
                                        onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                                        className="pl-10 bg-dark-bg border-neon-cyan/30 text-gray-300 focus:border-neon-cyan focus:ring-neon-cyan/20"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-neon-cyan font-orbitron">Description / Solution</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                    className="bg-dark-bg border-neon-cyan/30 text-gray-300 focus:border-neon-cyan focus:ring-neon-cyan/20 resize-none"
                                />
                            </div>

                            <Button
                                onClick={handleIncinerate}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold border-none shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all hover:scale-[1.02]"
                                size="lg"
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                                        Incinerating...
                                    </>
                                ) : (
                                    <>
                                        <Flame className="w-5 h-5 mr-2" />
                                        Incinerate Idea
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Results Display */}
                    <div className="space-y-6">
                        {result ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                {/* Score Card */}
                                <Card className="bg-dark-card border-neon-cyan/30 relative overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                                    <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent pointer-events-none" />
                                    <CardContent className="p-8 text-center">
                                        <h3 className="text-lg font-medium text-gray-400 mb-4 font-orbitron uppercase tracking-widest">Survival Score</h3>
                                        <div className="relative inline-flex items-center justify-center">
                                            <svg className="w-32 h-32 transform -rotate-90">
                                                <circle
                                                    cx="64"
                                                    cy="64"
                                                    r="60"
                                                    stroke="currentColor"
                                                    strokeWidth="8"
                                                    fill="transparent"
                                                    className="text-gray-800"
                                                />
                                                <motion.circle
                                                    initial={{ pathLength: 0 }}
                                                    animate={{ pathLength: result.score / 100 }}
                                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                                    cx="64"
                                                    cy="64"
                                                    r="60"
                                                    stroke="currentColor"
                                                    strokeWidth="8"
                                                    fill="transparent"
                                                    className={`${result.score > 70 ? 'text-green-500' :
                                                            result.score > 40 ? 'text-yellow-500' : 'text-red-500'
                                                        }`}
                                                    strokeDasharray="377"
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                                <span className="text-4xl font-bold text-white font-orbitron">{result.score}</span>
                                                <span className="text-xs text-gray-500">/ 100</span>
                                            </div>
                                        </div>
                                        <p className={`mt-4 font-bold font-orbitron uppercase tracking-wider ${
                                            result.score > 70 ? "text-green-500" :
                                            result.score > 40 ? "text-yellow-500" : "text-red-500"
                                        }`}>
                                            {result.score > 70 ? "Solid Foundation" :
                                                result.score > 40 ? "Needs Major Work" : "Burnt to a Crisp"}
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Feedback "Ashes" */}
                                <Card className="bg-dark-card border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-bold text-white flex items-center gap-2 font-orbitron">
                                            <AlertTriangle className="w-5 h-5 text-red-500" />
                                            The Ashes (Critical Feedback)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-3">
                                            {result.feedback.map((item, i) => (
                                                <motion.li
                                                    key={i}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    className="flex items-start gap-3 text-gray-400 font-mono text-sm"
                                                >
                                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                                                    <span>{item}</span>
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>

                                {/* Pivots "Phoenix" */}
                                <Card className="bg-dark-card border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-bold text-white flex items-center gap-2 font-orbitron">
                                            <RefreshCw className="w-5 h-5 text-green-500" />
                                            The Phoenix (Pivot Suggestions)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {result.pivots.map((pivot, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.3 + (i * 0.1) }}
                                                    className="p-3 bg-dark-bg/60 rounded-lg border border-green-500/20 hover:border-green-500/40 transition-colors"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <ArrowRight className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                        <span className="text-gray-300 text-sm font-mono">{pivot}</span>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ) : (
                            <div className="h-full flex items-center justify-center min-h-[400px] border-2 border-dashed border-gray-800 rounded-xl bg-dark-card/50">
                                <div className="text-center space-y-4 opacity-50">
                                    <Target className="w-16 h-16 mx-auto text-gray-700" />
                                    <p className="text-gray-500 font-mono">
                                        Enter your idea details to begin the incineration process.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
