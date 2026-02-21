"use client"


export const dynamic = 'force-dynamic'
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { logAuth, logError } from "@/lib/logger"
import { PrimaryButton } from "@/components/ui/button"
import { Alert } from "@/components/ui/alert"
import { Heading } from "@/components/ui/Heading"
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Clock
} from "lucide-react"

interface DeviceApproval {
  id: string
  deviceName: string
  deviceType: string
  ipAddress: string
  userAgent: string
  location?: string
  requestedAt: string
  expiresAt: string
}

export default function DeviceApprovalPage() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceApproval | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isApproving, setIsApproving] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    loadDeviceInfo()
  }, [])

  const loadDeviceInfo = async () => {
    try {
      // Get persistent device fingerprint
      let deviceFingerprint = localStorage.getItem('s_device_id');
      if (!deviceFingerprint) {
          deviceFingerprint = crypto.randomUUID();
          localStorage.setItem('s_device_id', deviceFingerprint);
      }

      // Get current device information
      const deviceInfo = {
        id: deviceFingerprint,
        deviceName: getDeviceName(),
        deviceType: getDeviceType(),
        ipAddress: "Loading...", // Will be filled by server
        userAgent: navigator.userAgent,
        location: "Loading...", // Will be filled by server
        requestedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      }
      
      setDeviceInfo(deviceInfo)
    } catch (err) {
      setError("Failed to load device information")
    } finally {
      setIsLoading(false)
    }
  }

  const getDeviceName = () => {
    const platform = navigator.platform
    const userAgent = navigator.userAgent
    
    if (platform.includes("Mac")) return "MacBook"
    if (platform.includes("Win")) return "Windows PC"
    if (platform.includes("Linux")) return "Linux PC"
    if (userAgent.includes("iPhone")) return "iPhone"
    if (userAgent.includes("iPad")) return "iPad"
    if (userAgent.includes("Android")) return "Android Device"
    
    return "Unknown Device"
  }

  const getDeviceType = () => {
    const userAgent = navigator.userAgent
    
    if (userAgent.includes("Mobile")) return "mobile"
    if (userAgent.includes("Tablet")) return "tablet"
    return "desktop"
  }

  const handleApprove = async () => {
    setIsApproving(true)
    setError("")

    try {
      // Approve the device
      const { data, error: approveError } = await authClient.multiSession.approveDevice({
        deviceFingerprint: deviceInfo?.id || crypto.randomUUID(), 
        deviceName: deviceInfo?.deviceName || "Unknown Device",
        deviceType: deviceInfo?.deviceType || "desktop",
        trustDevice: true,
      })

      if (approveError) {
        setError(approveError.message)
        return
      }

      if (data) {
        router.push("/dashboard")
      }
    } catch (err) {
      setError("Failed to approve device. Please try again.")
    } finally {
      setIsApproving(false)
    }
  }

  const handleDeny = async () => {
    setIsApproving(true) // Show loading state
    
    try {
      const deviceId = deviceInfo?.id || 'unknown'
      
      // Log denial attempt
      logAuth('device_denial_initiated', undefined, true, { 
        deviceId,
        deviceName: deviceInfo?.deviceName,
        ip: deviceInfo?.ipAddress,
        userAgent: deviceInfo?.userAgent
      })

      // 1. Call backend denial endpoint
      await authClient.multiSession.denyDevice({ 
        deviceFingerprint: deviceId 
      })

      // 2. Revoke current session
      await authClient.multiSession.revokeSession()

      // Log success
      logAuth('device_denial_completed', undefined, true, { deviceId })
      
      // 3. Redirect to login
      router.push("/login")
    } catch (err) {
      logError('Device denial failed', { error: err })
      // Even on error, force redirect to login for security
      router.push("/login")
    } finally {
      setIsApproving(false)
    }
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case "desktop":
        return <Monitor className="w-8 h-8" />
      case "mobile":
        return <Smartphone className="w-8 h-8" />
      case "tablet":
        return <Tablet className="w-8 h-8" />
      default:
        return <Monitor className="w-8 h-8" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
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
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-neon-orange/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-orange to-neon-purple rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
          
          <div className="relative bg-dark-card/90 backdrop-blur-xl p-8 rounded-2xl border border-neon-orange/30">
            <div className="text-center mb-8">
              <div className="mx-auto mb-4 w-16 h-16 bg-neon-orange/20 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-neon-orange" />
              </div>
              <Heading level={1} color="orange" className="text-3xl mb-2">
                DEVICE APPROVAL REQUIRED
              </Heading>
              <p className="text-gray-400 font-mono text-sm">
                A new device is trying to access your account. Please review and approve this request.
              </p>
            </div>
          {deviceInfo && (
            <div className="space-y-6">
              <div className="bg-dark-bg/50 rounded-sm p-6 border border-white/10">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="text-neon-cyan">
                    {getDeviceIcon(deviceInfo.deviceType)}
                  </div>
                  <div>
                    <Heading level={3} color="cyan" className="text-xl">
                      {deviceInfo.deviceName}
                    </Heading>
                    <p className="text-gray-400 capitalize font-mono text-sm">
                      {deviceInfo.deviceType} Device
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <MapPin className="w-4 h-4 text-neon-cyan" />
                    <span className="font-mono">Location: {deviceInfo.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Clock className="w-4 h-4 text-neon-cyan" />
                    <span className="font-mono">Requested: {formatDate(deviceInfo.requestedAt)}</span>
                  </div>
                </div>
              </div>

              {error && (
                <Alert variant="error" description={error} />
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <PrimaryButton
                  variant="success"
                  size="lg"
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {isApproving ? "Approving..." : "Approve Device"}
                </PrimaryButton>
                <PrimaryButton
                  variant="error"
                  size="lg"
                  onClick={handleDeny}
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Deny Access
                </PrimaryButton>
              </div>

              <div className="bg-neon-cyan/10 border border-neon-cyan/30 rounded-sm p-4">
                <h4 className="text-neon-cyan font-bold mb-2 font-mono uppercase text-sm">Security Notice</h4>
                <p className="text-gray-300 text-sm font-mono">
                  Only approve this device if you recognize it and trust the location. 
                  If you don't recognize this device, deny access and consider changing your password.
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
