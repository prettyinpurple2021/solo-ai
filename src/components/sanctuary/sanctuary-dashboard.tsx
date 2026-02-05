"use client"

import { useEffect, useState } from "react"
import { MoodTracker } from "./mood-tracker"
import { FocusTimer } from "./focus-timer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Activity, Heart, ShieldAlert, Sparkles } from "lucide-react"

export function SanctuaryDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/wellness')
        if (res.ok) {
            setStats(await res.json())
        }
      } catch (e) {
          console.error(e)
      } finally {
          setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const getHealthColor = (risk: string) => {
      if (risk === 'High') return 'text-red-500'
      if (risk === 'Medium') return 'text-yellow-500'
      return 'text-green-500'
  }

  if (loading) {
      return (
          <div className="flex items-center justify-center p-12">
              <div className="flex flex-col items-center gap-2">
                  <div className="ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 animate-spin border-t-indigo-500 mb-4"></div>
                  <p className="text-muted-foreground animate-pulse">Loading sanctuary usage...</p>
              </div>
          </div>
      )
  }

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
              <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                      <Heart className="w-4 h-4 mr-2 text-rose-500" /> Average Energy
                  </CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{stats ? stats.avg_energy : '-'}</div>
                  <p className="text-xs text-muted-foreground">Last 7 Days</p>
              </CardContent>
          </Card>
          
          <Card>
              <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                      <ShieldAlert className="w-4 h-4 mr-2 text-blue-500" /> Burnout Risk
                  </CardTitle>
              </CardHeader>
              <CardContent>
                  <div className={`text-2xl font-bold ${getHealthColor(stats?.burnout_risk)}`}>
                      {stats ? stats.burnout_risk : '-'}
                  </div>
                  <p className="text-xs text-muted-foreground">Based on energy trends</p>
              </CardContent>
          </Card>

          <Card>
              <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                      <Sparkles className="w-4 h-4 mr-2 text-yellow-500" /> Focus Score
                  </CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">Good</div>
                  <p className="text-xs text-muted-foreground">Consistency is key</p>
              </CardContent>
          </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight">Daily Check-in</h2>
              <MoodTracker />
              
              {/* Recent History */}
              <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Recent History</h3>
                  <div className="space-y-2">
                      {stats && stats.recent_moods && stats.recent_moods.length > 0 ? (
                          stats.recent_moods.map((entry: any) => (
                              <div key={entry.id} className="flex justify-between items-center p-3 sm:pr-8 bg-muted/40 rounded-lg text-sm">
                                  <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                                  <div className="flex gap-2">
                                      <span className="font-medium">{entry.mood_label}</span>
                                      <span className="text-muted-foreground">({entry.energy_level}/5)</span>
                                  </div>
                              </div>
                          ))
                      ) : (
                          <div className="text-muted-foreground text-sm italic">No entries yet.</div>
                      )}
                  </div>
              </div>
          </div>

          <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight">Focus Zone</h2>
              <FocusTimer />
              
              <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100">
                  <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                           <Activity className="w-8 h-8 text-indigo-500 mt-1" />
                           <div>
                               <h4 className="font-semibold text-indigo-900">Why Focus Matters</h4>
                               <p className="text-sm text-indigo-700/80 mt-1">
                                   Solopreneurs often switch context too much. Use the timer to lock in 25 minutes of single-tasking. It reduces burnout significantly.
                               </p>
                           </div>
                      </div>
                  </CardContent>
              </Card>
          </div>
      </div>
    </div>
  )
}
