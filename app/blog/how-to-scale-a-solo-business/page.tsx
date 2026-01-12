"use client"


export const dynamic = 'force-dynamic'
import Script from "next/script"
import Link from "next/link"
import { ArrowLeft, ListChecks } from "lucide-react"
export default function HowToScaleSoloBusinessPage() {
  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Scale a Solo Business",
    description:
      "A practical, step-by-step framework to scale a solo business using AI-powered Productivity, Business Automation, and Strategic Planning Tools.",
    step: [
      { "@type": "HowToStep", name: "Clarify outcomes", text: "Define 1-3 quarterly outcomes and success metrics." },
      { "@type": "HowToStep", name: "Map workflows", text: "List recurring tasks; identify where automation removes toil." },
      { "@type": "HowToStep", name: "Automate", text: "Implement Workflow Automation AI for capture, routing, and follow-ups." },
      { "@type": "HowToStep", name: "Measure", text: "Track leading indicators weekly and review pivots bi-weekly." },
    ],
  }

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#b300ff22,transparent_35%),radial-gradient(circle_at_bottom,#ff006e22,transparent_35%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 pointer-events-none" />
      <div className="relative z-10">
        <nav className="border-b border-neon-cyan/30 bg-dark-bg/95 backdrop-blur-xl sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
            <Link href="/blog" className="text-gray-300 hover:text-neon-purple flex items-center gap-2 font-mono transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Link>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-4xl md:text-5xl font-bold font-orbitron bg-gradient-to-r from-neon-purple to-neon-magenta bg-clip-text text-transparent mb-4 uppercase tracking-wider">
            How to Scale a Solo Business
          </h1>
          <p className="text-lg text-gray-400 font-mono mb-8">
            Use this lean operating system to reduce context switching, overcome decision fatigue, and scale sustainably.
          </p>

          <div className="rounded-sm border border-neon-cyan/30 bg-dark-card p-6 md:p-8 shadow-[0_0_20px_rgba(11,228,236,0.1)]">
            <div className="flex items-center gap-3 mb-4">
              <ListChecks className="w-5 h-5 text-neon-purple" />
              <h2 className="text-2xl font-semibold font-orbitron text-white uppercase tracking-wider">Step-by-step</h2>
            </div>
            <ol className="list-decimal ml-6 space-y-3 text-gray-400 font-mono">
              <li>Clarify quarterly outcomes tied to revenue, retention, or throughput.</li>
              <li>Map your weekly workflows and identify repetitive, rules-based tasks.</li>
              <li>Automate capture, routing, reminders, and status updates with AI agents.</li>
              <li>Implement a Friday review and a Monday plan ritual to stay aligned.</li>
            </ol>
          </div>
        </main>

        <Script id="howto-scale-solo-jsonld" type="application/ld+json">
          {JSON.stringify(howTo)}
        </Script>
      </div>
    </div>
  )
}


