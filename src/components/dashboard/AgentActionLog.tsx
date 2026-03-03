"use client"

import { motion } from 'framer-motion'
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Clock, 
  Mail, 
  Calendar, 
  FileText,
  Zap
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

interface AgentAction {
  id: string
  actionType: string
  status: string
  agentId: string
  createdAt: string
  error?: string | null
}

interface AgentActionLogProps {
  actions: AgentAction[]
}

export function AgentActionLog({ actions }: AgentActionLogProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-neon-green" />
      case 'failed': return <XCircle className="w-4 h-4 text-neon-magenta" />
      case 'executing': return <Loader2 className="w-4 h-4 text-neon-cyan animate-spin" />
      default: return <Clock className="w-4 h-4 text-neon-orange" />
    }
  }

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'sendEmail': return <Mail className="w-3 h-3" />
      case 'scheduleMeeting': return <Calendar className="w-3 h-3" />
      case 'createProjectTask': return <FileText className="w-3 h-3" />
      default: return <Zap className="w-3 h-3" />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-orbitron font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-neon-cyan" />
          Agent Execution Log
        </h3>
        <Badge variant="outline" className="text-[10px] font-mono border-white/10 text-gray-400">
          REAL-TIME
        </Badge>
      </div>

      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-3">
          {actions.length > 0 ? (
            actions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative p-3 bg-white/5 border border-white/5 hover:border-neon-cyan/30 transition-all rounded-none"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 p-1.5 rounded-none border ${
                      action.status === 'failed' ? 'border-neon-magenta/30 bg-neon-magenta/5' : 
                      action.status === 'completed' ? 'border-neon-green/30 bg-neon-green/5' : 
                      'border-neon-cyan/30 bg-neon-cyan/5'
                    }`}>
                      {getActionIcon(action.actionType)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold text-white uppercase font-orbitron tracking-tight">
                          {action.actionType.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">
                          BY {action.agentId.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400">
                        {new Date(action.createdAt).toLocaleTimeString()}
                        <span>•</span>
                        <span className={`capitalize ${
                          action.status === 'failed' ? 'text-neon-magenta' : 
                          action.status === 'completed' ? 'text-neon-green' : 
                          'text-neon-cyan'
                        }`}>
                          {action.status.replace('_', ' ')}
                        </span>
                      </div>
                      {action.error && (
                        <p className="text-[9px] text-neon-magenta font-mono mt-1 leading-tight">
                          ERR: {action.error}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="opacity-60 group-hover:opacity-100 transition-opacity">
                    {getStatusIcon(action.status)}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Activity className="w-8 h-8 text-gray-600 mb-2 opacity-20" />
              <p className="text-xs text-gray-500 font-mono italic">No actions recorded in current session</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
