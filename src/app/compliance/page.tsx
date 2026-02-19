'use client'

export const dynamic = 'force-dynamic'

import { CyberPageLayout } from '@/components/cyber/CyberPageLayout'
import { HudBorder } from '@/components/cyber/HudBorder'
import { Shield, Lock, Globe, FileText,} from 'lucide-react'

const complianceStandards = [
  {
    icon: Shield,
    title: 'GDPR Compliance',
    description: 'Full compliance with the General Data Protection Regulation for European users',
    status: 'Certified',
  },
  {
    icon: Lock,
    title: 'CCPA Compliance',
    description: 'California Consumer Privacy Act compliance for California residents',
    status: 'Certified',
  },
  {
    icon: Globe,
    title: 'SOC 2 Type II',
    description: 'Service Organization Control 2 Type II certification for security and availability',
    status: 'Certified',
  },
  {
    icon: FileText,
    title: 'ISO 27001',
    description: 'Information Security Management System certification',
    status: 'In Progress',
  },
]

export default function CompliancePage() {
  return (
    <CyberPageLayout>
      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-cyber-purple/30 bg-cyber-purple/5 rounded-none mb-6">
              <Shield className="w-4 h-4 text-neon-purple" />
              <span className="text-xs font-bold tracking-widest text-neon-purple uppercase">Compliance Status</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-orbitron font-bold text-white mb-6">
              COMPLIANCE <span className="text-neon-purple">STANDARDS</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto font-mono">
              We maintain the highest standards of compliance and security certifications.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {complianceStandards.map((standard, index) => (
              <HudBorder key={index} variant="hover" className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <standard.icon className="w-8 h-8 text-neon-purple" />
                  <span className="text-xs font-orbitron text-neon-cyan uppercase tracking-widest">
                    {standard.status}
                  </span>
                </div>
                <h3 className="font-orbitron text-lg text-white mb-2">{standard.title}</h3>
                <p className="text-sm text-gray-400 font-mono leading-relaxed">{standard.description}</p>
              </HudBorder>
            ))}
          </div>
        </div>
      </div>
    </CyberPageLayout>
  )
}
