"use client"


export const dynamic = 'force-dynamic'
import Link from "next/link"

export default function CompareGenericPage() {
  const rows = [
    { feature: "AI Co‑founder & Co‑pilot", ss: "Included", other: "Limited / none" },
    { feature: "Workflow Automation AI", ss: "Built‑in", other: "Add‑ons" },
    { feature: "Founder AI Tools", ss: "Curated", other: "Generic" },
    { feature: "Pricing for Solo", ss: "Launch (Free)", other: "Trials only" },
  ]

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#b300ff22,transparent_35%),radial-gradient(circle_at_bottom,#ff006e22,transparent_35%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 pointer-events-none" />
      <div className="relative z-10">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h1 className="text-4xl md:text-5xl font-bold font-orbitron bg-gradient-to-r from-neon-purple to-neon-magenta bg-clip-text text-transparent mb-6 uppercase tracking-wider">
            SoloSuccess AI vs Generic All‑in‑One
          </h1>
          <p className="text-lg text-gray-400 font-mono mb-8">Designed for solo founders, with opinionated systems that reduce decision fatigue.</p>
          <div className="overflow-x-auto rounded-sm border border-neon-cyan/30 shadow-[0_0_20px_rgba(11,228,236,0.1)]">
            <table className="w-full text-left">
              <thead className="bg-neon-purple/10 border-b border-neon-purple/30">
                <tr>
                  <th className="p-4 font-orbitron text-white uppercase tracking-wider">Feature</th>
                  <th className="p-4 font-orbitron text-white uppercase tracking-wider">SoloSuccess AI</th>
                  <th className="p-4 font-orbitron text-white uppercase tracking-wider">Generic Tool</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.feature} className="border-t border-neon-cyan/20 hover:bg-dark-hover transition-colors">
                    <td className="p-4 text-white font-mono">{r.feature}</td>
                    <td className="p-4 text-neon-lime font-medium font-mono">{r.ss}</td>
                    <td className="p-4 text-gray-400 font-mono">{r.other}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-8 text-gray-400 font-mono">
            Ready to start? Check the {" "}
            <Link href="/pricing/launch" className="text-neon-purple hover:text-neon-magenta underline transition-colors">Launch (Free)</Link> plan.
          </div>
        </div>
      </div>
    </div>
  )
}


