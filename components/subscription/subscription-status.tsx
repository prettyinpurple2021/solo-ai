"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Crown, Zap, Users, MessageSquare, Calendar, TrendingUp } from "lucide-react"
import { useSubscription } from "@/hooks/use-subscription"

const PLAN_DETAILS = {
  launchpad: {
    name: "Launchpad",
    icon: Zap,
    color: "from-blue-500 to-cyan-500",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
  },
  accelerator: {
    name: "Accelerator",
    icon: Zap,
    color: "from-purple-500 to-pink-500",
    badge: "bg-purple-100 text-purple-700 border-purple-200",
  },
  dominator: {
    name: "Dominator",
    icon: Crown,
    color: "from-yellow-500 to-orange-500",
    badge: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
}

export function SubscriptionStatus() {
  const { subscription, usage, isLoading } = useSubscription()

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const planDetails = PLAN_DETAILS[subscription.plan]
  const PlanIcon = planDetails.icon

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${planDetails.color} flex items-center justify-center`}
              >
                <PlanIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Current Plan</CardTitle>
                <CardDescription>Your empire level and benefits</CardDescription>
              </div>
            </div>
            <Badge className={planDetails.badge}>{planDetails.name}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Status</span>
              <Badge className="bg-green-100 text-green-700 border-green-200">{subscription.status}</Badge>
            </div>

            {subscription.plan !== "launchpad" && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Billing Cycle</span>
                  <span className="text-sm text-gray-800 capitalize">{subscription.billingCycle}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Next Billing</span>
                  <span className="text-sm text-gray-800">{subscription.nextBilling}</span>
                </div>
              </>
            )}

            <div className="pt-4">
              <Button variant="outline" className="w-full bg-transparent" disabled={subscription.plan === "dominator"}>
                {subscription.plan === "dominator" ? "You're at the top!" : "Upgrade Plan"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span>Usage This Month</span>
          </CardTitle>
          <CardDescription>Track your empire building activities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* AI Conversations */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">AI Conversations</span>
              </div>
              <span className="text-sm text-gray-600">
                {usage.conversations.used} / {usage.conversations.limit === -1 ? "∞" : usage.conversations.limit}
              </span>
            </div>
            {usage.conversations.limit !== -1 && (
              <Progress value={(usage.conversations.used / usage.conversations.limit) * 100} className="h-2" />
            )}
          </div>

          {/* AI Agents */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">AI Agents Access</span>
              </div>
              <span className="text-sm text-gray-600">
                {usage.agents.used} / {usage.agents.limit}
              </span>
            </div>
            <Progress value={(usage.agents.used / usage.agents.limit) * 100} className="h-2" />
          </div>

          {/* Automations */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">Automations</span>
              </div>
              <span className="text-sm text-gray-600">
                {usage.automations.used} / {usage.automations.limit === -1 ? "∞" : usage.automations.limit}
              </span>
            </div>
            {usage.automations.limit !== -1 && (
              <Progress value={(usage.automations.used / usage.automations.limit) * 100} className="h-2" />
            )}
          </div>

          {/* Team Members */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">Team Members</span>
              </div>
              <span className="text-sm text-gray-600">
                {usage.teamMembers.used} / {usage.teamMembers.limit === -1 ? "∞" : usage.teamMembers.limit}
              </span>
            </div>
            {usage.teamMembers.limit !== -1 && (
              <Progress value={(usage.teamMembers.used / usage.teamMembers.limit) * 100} className="h-2" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your subscription and billing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start bg-transparent">
            <Calendar className="w-4 h-4 mr-2" />
            View Billing History
          </Button>
          <Button variant="outline" className="w-full justify-start bg-transparent">
            <Users className="w-4 h-4 mr-2" />
            Manage Team
          </Button>
          <Button variant="outline" className="w-full justify-start bg-transparent">
            <TrendingUp className="w-4 h-4 mr-2" />
            Usage Analytics
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
