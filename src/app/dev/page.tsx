'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { Loader2, GraduationCap, Users, Trophy } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { logError } from "@/lib/logger"
import { isAdminEmail } from "@/lib/admin-access"

export default function DevToolsPage() {
    const [loading, setLoading] = useState<string | null>(null)
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (authLoading) return
        const allowed = !!user?.email && isAdminEmail(user.email)
        if (!allowed) {
            router.push('/dashboard')
        }
    }, [user, authLoading, router])

    if (authLoading) return <div className="p-10"><Loader2 className="animate-spin" /></div>
    
    if (!user?.email || !isAdminEmail(user.email)) return null;

    const runSeed = async (name: string, url: string, method: string = 'POST') => {
        setLoading(name)
        try {
            const res = await fetch(url, { 
                method
            })
            if (res.ok) {
                toast.success(`${name} seeded successfully!`)
            } else {
                const text = await res.text()
                toast.error(`Failed to seed ${name}: ${text}`)
            }
        } catch (e) {
            logError(`Dev Tools Seed Error [${url}]`, e);
            toast.error(`Error connecting to ${url}: ${(e as Error).message || 'Unknown error'}`)
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Developer Tools</h1>
                <p className="text-muted-foreground">Utilities for verifying and setting up the application state.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5" />
                            The Academy
                        </CardTitle>
                        <CardDescription>
                            Populate default learning paths, modules, and courses.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button 
                            className="w-full" 
                            onClick={() => runSeed('Academy', '/api/seed-academy', 'POST')}
                            disabled={!!loading}
                        >
                            {loading === 'Academy' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Seed Academy Data
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Community Topics
                        </CardTitle>
                        <CardDescription>
                            Create default channels like #General, #Wins, #Marketing.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button 
                            className="w-full" 
                            onClick={() => runSeed('Topics', '/api/community/topics/seed', 'POST')}
                            disabled={!!loading}
                        >
                            {loading === 'Topics' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Seed Topics
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5" />
                            Gamification
                        </CardTitle>
                        <CardDescription>
                            Initialize badges, levels, and achievement definitions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button 
                            className="w-full" 
                            onClick={() => runSeed('Gamification', '/api/gamification/seed', 'POST')}
                            disabled={!!loading}
                        >
                            {loading === 'Gamification' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Seed Badges
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
