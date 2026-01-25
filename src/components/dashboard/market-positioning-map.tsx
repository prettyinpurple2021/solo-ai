"use client"




    Target, TrendingUp, DollarSign, Users, Zap, Info, Filter, RefreshCw} from "lucide-react"





    Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"

    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip"

interface MarketPosition {
    id: number
    name: string
    domain?: string
    threatLevel: 'low' | 'medium' | 'high' | 'critical'
    xAxis: number // 0-100 scale for horizontal positioning
    yAxis: number // 0-100 scale for vertical positioning
    marketShare: number
    employeeCount: number
    fundingAmount: number
    recentActivity: number
    competitiveAdvantages: string[]
    vulnerabilities: string[]
    marketSegment: string
    businessModel: string
    targetAudience: string
    lastUpdated: string
}

interface MarketPositioningMapProps {
    className?: string
    xAxisMetric?: string
    yAxisMetric?: string
    onAxisChange?: (xAxis: string, yAxis: string) => void
}