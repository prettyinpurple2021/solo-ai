"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Check, 
  X, 
  AlertCircle, 
  Mail, 
  Calendar, 
  FileText, 
  Clock,
  ShieldAlert,
  Zap
} from 'lucide-react'
import { HudBorder } from '@/components/cyber/HudBorder'
import { CyberButton } from '@/components/cyber/CyberButton'
import { Badge } from '@/components/ui/badge'
import { approveAgentAction, rejectAgentAction } from '@/lib/actions/agent-actions'
import { toast } from 'sonner'

interface AgentAction {
  id: string
  actionType: string
  status: string
  payload: any
  agentId: string
  createdAt: string
}

interface AgentActionApprovalProps {
  action: AgentAction
  onComplete?: () => void
}

export function AgentActionApproval({ action, onComplete }: AgentActionApprovalProps) {
  const [isProcessing, setIsLoading] = useState(false)

  const handleApprove = async () => {
    setIsLoading(true)
    try {
      const result = await approveAgentAction(action.id)
      if (result.success) {
        toast.success(`Action approved: ${action.actionType}`, { icon: '✅' })
        onComplete?.()
      } else {
        toast.error(`Failed to approve: ${result.error}`)
      }
    } catch (error) {
      toast.error("An error occurred during approval")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    setIsLoading(true)
    try {
      const result = await rejectAgentAction(action.id)
      if (result.success) {
        toast.info(`Action rejected: ${action.actionType}`, { icon: '✖️' })
        onComplete?.()
      } else {
        toast.error(`Failed to reject: ${result.error}`)
      }
    } catch (error) {
      toast.error("An error occurred during rejection")
    } finally {
      setIsLoading(false)
    }
  }

  const getActionIcon = () => {
    switch (action.actionType) {
      case 'sendEmail': return <Mail className="w-5 h-5 text-neon-cyan" />
      case 'scheduleMeeting': return <Calendar className="w-5 h-5 text-neon-purple" />
      case 'createProjectTask': return <FileText className="w-5 h-5 text-neon-lime" />
      default: return <Zap className="w-5 h-5 text-yellow-400" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full"
    >
      <HudBorder className="bg-dark-card border-neon-purple/30 p-4 overflow-hidden">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neon-purple/10 border border-neon-purple/30 rounded-none">
              {getActionIcon()}
            </div>
            <div>
              <h3 className="text-sm font-orbitron font-bold text-white uppercase tracking-wider">
                Action Required: {action.actionType.replace(/([A-Z])/g, ' $1')}
              </h3>
              <p className="text-xs text-gray-400 font-mono">
                Initiated by Agent: <span className="text-neon-purple uppercase">{action.agentId}</span>
              </p>
            </div>
          </div>
          <Badge className="bg-neon-orange/20 text-neon-orange border-neon-orange/50 font-mono text-[10px] animate-pulse">
            PENDING APPROVAL
          </Badge>
        </div>

        <div className="bg-dark-bg/50 border border-white/5 p-3 mb-4 rounded-none">
          <div className="flex items-start gap-2 mb-2">
            <ShieldAlert className="w-4 h-4 text-neon-cyan mt-0.5" />
            <p className="text-xs text-gray-300 font-mono">Payload Preview:</p>
          </div>
          <pre className="text-[10px] text-neon-cyan/80 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-32">
            {JSON.stringify(action.payload, null, 2)}
          </pre>
        </div>

        <div className="flex items-center gap-3">
          <CyberButton
            onClick={handleApprove}
            disabled={isProcessing}
            variant="purple"
            size="sm"
            className="flex-1"
          >
            {isProcessing ? (
              <Clock className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Authorize
              </>
            )}
          </CyberButton>
          <CyberButton
            onClick={handleReject}
            disabled={isProcessing}
            variant="outline"
            size="sm"
            className="flex-1 border-red-500/50 text-red-500 hover:bg-red-500/10"
          >
            <X className="w-4 h-4 mr-2" />
            Deny
          </CyberButton>
        </div>
      </HudBorder>
    </motion.div>
  )
}
