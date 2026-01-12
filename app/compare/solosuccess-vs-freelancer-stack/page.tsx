"use client"


export const dynamic = 'force-dynamic'
import Link from "next/link"

export default function CompareFreelancerStackPage() {
  const rows = [
    { feature: "One‑Person Business Software", ss: "Unified", other: "Multiple tools" },
    { feature: "AI for Social Media", ss: "Built‑in", other: "Manual / plugins" },
    { feature: "Automated Content Creation", ss: "Templates + agents", other: "DIY" },
    { feature: "Business Intelligence Tools", ss: "Out‑of‑the‑box", other: "Spreadsheets" },
  ]

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#b300ff22,transparent_35%),radial-gradient(circle_at_bottom,#ff006e22,transparent_35%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 pointer-events-none" />
      <div className="relative z-10">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h1 className="text-4xl md:text-5xl font-bold font-orbitron bg-gradient-to-r from-neon-purple to-neon-magenta bg-clip-text text-transparent mb-6 uppercase tracking-wider">
            SoloSuccess AI vs Freelancer Tool Stack
          </h1>
          <p className="text-lg text-gray-400 font-mono mb-8">Save time and context switching with a unified solo operating system.</p>
          <div className="overflow-x-auto rounded-sm border border-neon-cyan/30 shadow-[0_0_20px_rgba(11,228,236,0.1)]">
            <table className="w-full text-left">
              <thead className="bg-neon-purple/10 border-b border-neon-purple/30">
                <tr>
                  <th className="p-4 font-orbitron text-white uppercase tracking-wider">Capability</th>
                  <th className="p-4 font-orbitron text-white uppercase tracking-wider">SoloSuccess AI</th>
                  <th className="p-4 font-orbitron text-white uppercase tracking-wider">Typical Stack</th>
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
            Explore {" "}
            <Link href="/pricing/accelerator" className="text-neon-purple hover:text-neon-magenta underline transition-colors">Accelerator</Link> or {" "}
            <Link href="/pricing/dominator" className="text-neon-purple hover:text-neon-magenta underline transition-colors">Dominator</Link>.
          </div>
        </div>
      </div>
    </div>
  )
}


