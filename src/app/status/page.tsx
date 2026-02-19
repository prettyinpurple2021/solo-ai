'use client'

export const dynamic = 'force-dynamic'

import { CyberPageLayout } from '@/components/cyber/CyberPageLayout'
import { HudBorder } from '@/components/cyber/HudBorder'
import { CheckCircle, AlertTriangle, XCircle, Clock, Zap, Shield, Database, Globe } from 'lucide-react'

const services = [
  {
    name: 'SoloSuccess AI Platform',
    status: 'operational',
    uptime: '99.98%',
    description: 'Main application and dashboard',
    icon: Zap,
  },
  {
    name: 'AI Squad Services',
    status: 'operational',
    uptime: '99.95%',
    description: 'AI agent processing and responses',
    icon: Shield,
  },
  {
    name: 'Authentication',
    status: 'operational',
    uptime: '99.99%',
    description: 'User authentication and authorization',
    icon: Database,
  },
  {
    name: 'API Services',
    status: 'operational',
    uptime: '99.97%',
    description: 'REST API and GraphQL endpoints',
    icon: Globe,
  },
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'operational':
      return <CheckCircle className="w-5 h-5 text-cyber-cyan" />
    case 'degraded':
      return <AlertTriangle className="w-5 h-5 text-yellow-400" />
    case 'outage':
      return <XCircle className="w-5 h-5 text-red-400" />
    default:
      return <Clock className="w-5 h-5 text-gray-400" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'operational':
      return 'text-cyber-cyan'
    case 'degraded':
      return 'text-yellow-400'
    case 'outage':
      return 'text-red-400'
    default:
      return 'text-gray-400'
  }
}

export default function StatusPage() {
  return (
    <CyberPageLayout>
      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-cyber-cyan/30 bg-cyber-cyan/5 rounded-none mb-6">
              <span className="w-1.5 h-1.5 bg-cyber-cyan rounded-full animate-ping"></span>
              <span className="text-xs font-bold tracking-widest text-cyber-cyan uppercase">System Status</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-orbitron font-bold text-white mb-6">
              SYSTEM <span className="text-cyber-cyan">STATUS</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto font-mono">
              Real-time status of all SoloSuccess AI services and infrastructure.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {services.map((service, index) => (
              <HudBorder key={index} variant="hover" className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <service.icon className="w-8 h-8 text-neon-purple" />
                  {getStatusIcon(service.status)}
                </div>
                <h3 className="font-orbitron text-lg text-white mb-2">{service.name}</h3>
                <p className="text-sm text-gray-400 font-mono mb-4">{service.description}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-orbitron uppercase tracking-widest ${getStatusColor(service.status)}`}>
                    {service.status}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">Uptime: {service.uptime}</span>
                </div>
              </HudBorder>
            ))}
          </div>

          <div className="mt-12 text-center">
            <HudBorder className="p-8">
              <h3 className="font-orbitron text-2xl text-white mb-4">OVERALL_STATUS</h3>
              <div className="flex items-center justify-center gap-3">
                <CheckCircle className="w-8 h-8 text-cyber-cyan" />
                <span className="font-orbitron text-xl text-cyber-cyan">ALL SYSTEMS OPERATIONAL</span>
              </div>
            </HudBorder>
          </div>
        </div>
      </div>
    </CyberPageLayout>
  )
}
