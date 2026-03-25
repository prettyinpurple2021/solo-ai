'use client'

import { CyberPageLayout } from '@/components/cyber/CyberPageLayout'
import { HudBorder } from '@/components/cyber/HudBorder'
import { Shield, Lock, Key, Server,} from 'lucide-react'

const securityFeatures = [
  {
    icon: Lock,
    title: 'End-to-End Encryption',
    description: 'All data is encrypted in transit and at rest using AES-256 encryption',
    status: 'Active',
  },
  {
    icon: Shield,
    title: 'SOC 2 Type II Compliant',
    description: 'Regular security audits and compliance with industry standards',
    status: 'Certified',
  },
  {
    icon: Key,
    title: 'Zero-Knowledge Architecture',
    description: 'We cannot access your encrypted data, ensuring complete privacy',
    status: 'Active',
  },
  {
    icon: Server,
    title: 'Secure Infrastructure',
    description: 'Hosted on enterprise-grade infrastructure with 99.9% uptime SLA',
    status: 'Operational',
  },
]

export default function SecurityPage() {
  return (
    <CyberPageLayout>
      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-neon-cyan/30 bg-neon-cyan/5 rounded-none mb-6">
              <Shield className="w-4 h-4 text-neon-cyan" />
              <span className="text-xs font-bold tracking-widest text-neon-cyan uppercase">Security Protocol</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-orbitron font-bold text-white mb-6">
              QUANTUM-GRADE <span className="text-neon-cyan">SECURITY</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto font-mono">
              Your data is protected by advanced security protocols and encryption standards.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {securityFeatures.map((feature, index) => (
              <HudBorder key={index} variant="hover" className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <feature.icon className="w-8 h-8 text-neon-cyan" />
                  <span className="text-xs font-orbitron text-neon-purple uppercase tracking-widest">
                    {feature.status}
                  </span>
                </div>
                <h3 className="font-orbitron text-lg text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 font-mono leading-relaxed">{feature.description}</p>
              </HudBorder>
            ))}
          </div>
        </div>
      </div>
    </CyberPageLayout>
  )
}
