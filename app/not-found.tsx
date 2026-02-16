import Link from "next/link"
import { ArrowLeft, Crown} from "lucide-react"
import { Button} from "@/components/ui/button"

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-dark-bg">
      <div className="w-full max-w-3xl text-center">
        {/* SoloSuccess Crown Logo */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-neon-purple/20 border-2 border-neon-purple/50 rounded-full shadow-[0_0_20px_rgba(179,0,255,0.3)]">
            <Crown className="h-12 w-12 text-neon-purple" />
          </div>
        </div>

        {/* 404 Typography */}
        <div className="mb-6">
          <h1 className="text-6xl font-bold font-orbitron text-white mb-2 uppercase tracking-wider">404</h1>
          <h2 className="text-2xl font-bold font-orbitron text-neon-cyan mb-2 uppercase tracking-wider">Page Not Found</h2>
          <p className="text-gray-300 font-mono">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 max-w-md mx-auto">
          <Button asChild className="w-full">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link href="/dashboard">
              <Crown className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
        </div>

        {/* Smart Links */}
        <div className="mt-10 text-left">
          <h3 className="text-lg font-bold font-orbitron text-white mb-3 uppercase tracking-wider">Popular Destinations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Link href="/pricing" className="rounded-sm border-2 border-gray-700 p-4 hover:border-neon-purple hover:shadow-[0_0_15px_rgba(179,0,255,0.3)] bg-dark-card transition-all">
              <div className="font-bold font-mono text-neon-purple uppercase tracking-wider">Pricing</div>
              <div className="text-sm text-gray-300 font-mono mt-1">See plans for Solo Founders and Small Business Owners</div>
            </Link>
            <Link href="/pricing/launch" className="rounded-sm border-2 border-gray-700 p-4 hover:border-neon-lime hover:shadow-[0_0_15px_rgba(57,255,20,0.3)] bg-dark-card transition-all">
              <div className="font-bold font-mono text-neon-lime uppercase tracking-wider">Launch (Free)</div>
              <div className="text-sm text-gray-300 font-mono mt-1">Start free with AI Business Assistant</div>
            </Link>
            <Link href="/blog" className="rounded-sm border-2 border-gray-700 p-4 hover:border-neon-cyan hover:shadow-[0_0_15px_rgba(11,228,236,0.3)] bg-dark-card transition-all">
              <div className="font-bold font-mono text-neon-cyan uppercase tracking-wider">Boss Blog</div>
              <div className="text-sm text-gray-300 font-mono mt-1">Guides on automation, marketing, and growth</div>
            </Link>
            <Link href="/features" className="rounded-sm border-2 border-gray-700 p-4 hover:border-neon-magenta hover:shadow-[0_0_15px_rgba(255,0,110,0.3)] bg-dark-card transition-all">
              <div className="font-bold font-mono text-neon-magenta uppercase tracking-wider">Features</div>
              <div className="text-sm text-gray-300 font-mono mt-1">Explore your virtual AI team</div>
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <p className="mt-6 text-sm text-gray-400 font-mono">
          Need help? <Link href="/contact" className="text-neon-cyan hover:text-neon-cyan/80 hover:underline transition-colors">Contact support</Link>
        </p>
      </div>
    </div>
  )
}
