"use client"

import type { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, Zap, Lock } from "lucide-react"

interface FeatureGateProps {
  children: ReactNode
  requiredPlan: "launchpad" | "accelerator" | "dominator"
  featureName: string
  description?: string
  currentPlan?: "launchpad" | "accelerator" | "dominator"
}

const PLAN_HIERARCHY = {
  launchpad: 1,
  accelerator: 2,
  dominator: 3,
}

const PLAN_DETAILS = {
  launchpad: {
    name: "Launchpad",
    icon: Zap,
    color: "from-blue-500 to-cyan-500",
  },
  accelerator: {
    name: "Accelerator",
    icon: Zap,
    color: "from-purple-500 to-pink-500",
  },
  dominator: {
    name: "Dominator",
    icon: Crown,
    color: "from-yellow-500 to-orange-500",
  },
}

export function FeatureGate({
  children,
  requiredPlan,
  featureName,
  description,
  currentPlan = "dominator", // Default to highest plan for development
}: FeatureGateProps) {
  const hasAccess = PLAN_HIERARCHY[currentPlan] >= PLAN_HIERARCHY[requiredPlan]

  // For development, always allow access
  if (process.env.NODE_ENV === "development" || hasAccess) {
    return <>{children}</>
  }

  const requiredPlanDetails = PLAN_DETAILS[requiredPlan]
  const RequiredIcon = requiredPlanDetails.icon

  return (
    <Card className="border-2 border-dashed border-gray-300">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div
            className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${requiredPlanDetails.color} flex items-center justify-center`}
          >
            <Lock className="w-8 h-8 text-white" />
          </div>
        </div>
        <CardTitle className="flex items-center justify-center space-x-2">
          <span>{featureName}</span>
          <Badge className="bg-purple-100 text-purple-700 border-purple-200">
            <RequiredIcon className="w-3 h-3 mr-1" />
            {requiredPlanDetails.name}
          </Badge>
        </CardTitle>
        <CardDescription>
          {description || `This feature requires the ${requiredPlanDetails.name} plan or higher.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white font-semibold">
          Upgrade to {requiredPlanDetails.name}
        </Button>
      </CardContent>
    </Card>
  )
}
