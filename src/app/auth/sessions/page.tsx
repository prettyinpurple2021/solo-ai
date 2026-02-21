"use client"


export const dynamic = 'force-dynamic'
import { useState, useEffect } from "react"
import { authClient } from "@/lib/auth-client"
import { PrimaryButton } from "@/components/ui/button"
import { Alert } from "@/components/ui/alert"
import { Heading } from "@/components/ui/Heading"
import { HudBorder } from '@/components/cyber/HudBorder'
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Trash2, 
  Shield, 
  Clock,
  MapPin,
  Wifi
} from "lucide-react"

interface Session {
  id: string
  deviceName: string
  deviceType: string
  ipAddress: string
  userAgent: string
  isCurrent: boolean
  lastActivity: string
  createdAt: string
  location?: string
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      const { data, error: sessionsError } = await authClient.multiSession.getSessions()
      
      if (sessionsError) {
        setError(sessionsError.message)
        return
      }

      if (data) {
        setSessions(data.sessions || [])
      }
    } catch (err) {
      setError("Failed to load sessions")
    } finally {
      setIsLoading(false)
    }
  }

  const revokeSession = async (sessionId: string) => {
    try {
      const { error: revokeError } = await authClient.multiSession.revokeSession({
        sessionId,
      })

      if (revokeError) {
        setError(revokeError.message)
        return
      }

      // Reload sessions after revoking
      await loadSessions()
    } catch (err) {
      setError("Failed to revoke session")
    }
  }

  const revokeAllOtherSessions = async () => {
    try {
      const { error: revokeError } = await authClient.multiSession.revokeOtherSessions()

      if (revokeError) {
        setError(revokeError.message)
        return
      }

      // Reload sessions after revoking
      await loadSessions()
    } catch (err) {
      setError("Failed to revoke other sessions")
    }
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case "desktop":
        return <Monitor className="w-5 h-5" />
      case "mobile":
        return <Smartphone className="w-5 h-5" />
      case "tablet":
        return <Tablet className="w-5 h-5" />
      default:
        return <Monitor className="w-5 h-5" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-purple"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-neon-purple/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-8">
          <Heading level={1} color="purple" className="text-3xl mb-2">ACTIVE SESSIONS</Heading>
          <p className="text-gray-400 font-mono">
            Manage your active sessions and device access
          </p>
        </div>

        {error && (
          <Alert variant="error" description={error} className="mb-6" />
        )}

        <div className="grid gap-6">
          {sessions.map((session) => (
            <HudBorder key={session.id} variant="hover" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-neon-cyan">
                    {getDeviceIcon(session.deviceType)}
                  </div>
                  <div>
                    <Heading level={3} color="cyan" className="flex items-center space-x-2">
                      <span>{session.deviceName}</span>
                      {session.isCurrent && (
                        <span className="text-xs bg-neon-lime/20 text-neon-lime px-2 py-1 rounded font-mono uppercase">
                          Current
                        </span>
                      )}
                    </Heading>
                    <p className="text-gray-400 font-mono text-sm">
                      {session.deviceType} • {session.ipAddress}
                    </p>
                  </div>
                </div>
                {!session.isCurrent && (
                  <PrimaryButton
                    variant="error"
                    size="sm"
                    onClick={() => revokeSession(session.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Revoke
                  </PrimaryButton>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-neon-cyan" />
                  <span className="font-mono">Last active: {formatDate(session.lastActivity)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-neon-cyan" />
                  <span className="font-mono">Location: {session.location || "Unknown"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Wifi className="w-4 h-4 text-neon-cyan" />
                  <span className="font-mono">IP: {session.ipAddress}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-neon-cyan" />
                  <span className="font-mono">Created: {formatDate(session.createdAt)}</span>
                </div>
              </div>
            </HudBorder>
          ))}
        </div>

        {sessions.length > 1 && (
          <HudBorder variant="hover" className="mt-6 p-6 border-neon-magenta/30">
            <div className="mb-4">
              <Heading level={3} color="magenta" className="flex items-center space-x-2 mb-2">
                <Shield className="w-5 h-5" />
                <span>Security Actions</span>
              </Heading>
              <p className="text-gray-400 font-mono text-sm">
                Revoke all other sessions to sign out all devices except this one
              </p>
            </div>
            <PrimaryButton
              variant="error"
              onClick={revokeAllOtherSessions}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Revoke All Other Sessions
            </PrimaryButton>
          </HudBorder>
        )}
      </div>
    </div>
  )
}
