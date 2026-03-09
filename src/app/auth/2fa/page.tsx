"use client"


export const dynamic = 'force-dynamic'
import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { PrimaryButton } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert } from "@/components/ui/alert"
import { Heading } from "@/components/ui/Heading"
import { Loader2, Shield, Smartphone } from "lucide-react"

export default function TwoFactorPage() {
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const router = useRouter()

  const handleVerifyTOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const { data, error: verifyError } = await authClient.twoFactor.verifyTOTP({
        code,
      })

      if (verifyError) {
        setError(verifyError.message)
        return
      }

      if (data) {
        router.push("/dashboard")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setIsVerifying(true)
    try {
      // Better Auth will handle resending the code
      await authClient.twoFactor.resendCode()
    } catch (err) {
      setError("Failed to resend code. Please try again.")
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-neon-purple/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-purple to-neon-cyan rounded-sm opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
          
          <div className="relative bg-dark-card/90 backdrop-blur-xl p-8 rounded-sm border border-neon-purple/30">
            <div className="text-center mb-8">
              <div className="mx-auto mb-4 w-12 h-12 bg-neon-purple/20 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-neon-purple" />
              </div>
              <Heading level={1} color="purple" className="text-2xl mb-2">
                TWO-FACTOR AUTHENTICATION
              </Heading>
              <p className="text-gray-400 font-mono text-sm">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

            <form onSubmit={handleVerifyTOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-neon-purple font-mono uppercase text-xs">
                  Verification Code
                </Label>
                <Input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="bg-dark-bg/50 border-white/10 focus:border-neon-purple/50 text-white placeholder:text-gray-400 font-mono text-center text-2xl tracking-widest"
                  required
                />
              </div>

              {error && (
                <Alert variant="error" description={error} />
              )}

              <PrimaryButton
                variant="purple"
                size="lg"
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="w-full"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Verify Code
                  </span>
                )}
              </PrimaryButton>

              <div className="text-center">
                <PrimaryButton
                  variant="cyan"
                  type="button"
                  onClick={handleResendCode}
                  disabled={isVerifying}
                  className="text-sm"
                >
                  {isVerifying ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Resending...
                    </span>
                  ) : (
                    "Resend Code"
                  )}
                </PrimaryButton>
              </div>
            </form>

            <div className="mt-6 p-4 bg-neon-cyan/10 border border-neon-cyan/30 rounded-lg">
              <div className="flex items-center space-x-2 text-neon-cyan">
                <Smartphone className="w-4 h-4" />
                <span className="text-sm font-mono">
                  Don't have your phone? Use a backup code instead.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
