"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar, Mail, MessageSquare, CreditCard, FileText, Camera, Globe, Zap, Settings, CheckCircle, AlertCircle, Plus, Link, Sparkles, Crown, Shield, BarChart3 } from "lucide-react"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

// Define the shape of a single integration
interface Integration {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  category: string
  isPremium: boolean
  features: string[]
  setupSteps: string[]
}

// Master list of all available integrations
const ALL_INTEGRATIONS: Integration[] = [
  {
    id: "google",
    name: "Google Calendar",
    description: "Sync your tasks and deadlines with Google Calendar for seamless scheduling.",
    icon: Calendar,
    category: "productivity",
    isPremium: false,
    features: ["Two-way sync with tasks", "Automatic deadline reminders", "Focus time blocking", "Meeting preparation alerts"],
    setupSteps: ["Connect your Google account", "Select calendars to sync", "Configure sync preferences", "Set up notification rules"],
  },
  {
    id: "slack",
    name: "Slack",
    description: "Get notifications and updates directly in your Slack workspace.",
    icon: MessageSquare,
    category: "communication",
    isPremium: false,
    features: ["Task completion notifications", "Daily progress summaries", "AI agent updates", "Team collaboration alerts"],
    setupSteps: ["Install SoloBoss Slack app", "Authorize workspace access", "Choose notification channels", "Configure message preferences"],
  },
  // Add other integrations here...
];

export function IntegrationHub() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(true);
  const [connectedProviders, setConnectedProviders] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch connected integrations on component mount
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/integrations/status');
        if (!response.ok) throw new Error('Failed to fetch status');
        const data = await response.json();
        setConnectedProviders(data.connectedProviders || []);
      } catch (error) {
        console.error(error);
        toast.error("Could not load integration statuses.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStatus();
  }, []);

  // Show toast notifications based on URL params from OAuth redirect
  useEffect(() => {
    if (searchParams.get('success')) {
      toast.success(`Successfully connected to ${searchParams.get('provider')}!`);
      router.replace('/dashboard/integrations'); // Clean URL
    }
    if (searchParams.get('error')) {
      toast.error(`Failed to connect to ${searchParams.get('provider')}. Please try again.`);
      router.replace('/dashboard/integrations'); // Clean URL
    }
  }, [searchParams, router]);

  const handleToggleIntegration = async (providerId: string, isConnected: boolean) => {
    if (isConnected) {
      // Disconnect logic
      toast.info(`Disconnecting from ${providerId}...`);
      try {
        const response = await fetch(`/api/integrations/${providerId}/disconnect`, { method: 'POST' });
        if (!response.ok) throw new Error('Failed to disconnect');
        setConnectedProviders(prev => prev.filter(p => p !== providerId));
        toast.success(`Successfully disconnected from ${providerId}.`);
      } catch (error) {
        toast.error(`Failed to disconnect from ${providerId}. Please try again.`);
      }
    } else {
      // Connect logic - redirect to backend route
      window.location.href = `/api/integrations/${providerId}/connect`;
    }
  };

  const integrations = useMemo(() => {
    return ALL_INTEGRATIONS.map(integration => ({
      ...integration,
      isConnected: connectedProviders.includes(integration.id),
    }));
  }, [connectedProviders]);

  const filteredIntegrations = useMemo(() => integrations.filter(integration => {
    const matchesCategory = activeTab === "all" || integration.category === activeTab;
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }), [integrations, activeTab, searchQuery]);

  const categories = useMemo(() => [
    { id: "all", name: "All", count: integrations.length },
    { id: "productivity", name: "Productivity", count: integrations.filter(i => i.category === "productivity").length },
    { id: "communication", name: "Communication", count: integrations.filter(i => i.category === "communication").length },
  ], [integrations]);

  const connectedCount = useMemo(() => connectedProviders.length, [connectedProviders]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-16 w-full" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="boss-card soloboss-gradient text-white">
        <CardContent className="p-6 text-center space-y-3">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-3"><Link className="h-8 w-8" />Integration Hub<Zap className="h-8 w-8" /></h1>
          <p className="text-lg opacity-90">Connect your favorite tools and supercharge your empire! 🔗✨</p>
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-1"><CheckCircle className="h-4 w-4" /><span>{connectedCount} Connected</span></div>
            <div className="flex items-center gap-1"><Globe className="h-4 w-4" /><span>{integrations.length} Available</span></div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card className="boss-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input placeholder="Search integrations... 🔍" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1" />
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((category) => (
                <Button key={category.id} variant={activeTab === category.id ? "default" : "outline"} size="sm" onClick={() => setActiveTab(category.id)} className={activeTab === category.id ? "punk-button text-white" : ""}>
                  {category.name} ({category.count})
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integrations Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredIntegrations.map((integration) => {
          const IconComponent = integration.icon;
          return (
            <Card key={integration.id} className="boss-card flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center">
                      <IconComponent className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="boss-heading flex items-center gap-2">{integration.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs capitalize">{integration.category}</Badge>
                        {integration.isConnected ? (
                          <Badge className="bg-green-100 text-green-800 text-xs"><CheckCircle className="h-3 w-3 mr-1" />Connected</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs"><AlertCircle className="h-3 w-3 mr-1" />Available</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Switch checked={integration.isConnected} onCheckedChange={() => handleToggleIntegration(integration.id, integration.isConnected)} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4 flex-grow flex flex-col">
                <CardDescription className="font-medium">{integration.description}</CardDescription>
                <div className="space-y-2 flex-grow">
                  <h4 className="text-sm font-semibold empowering-text">Key Features:</h4>
                  <ul className="text-xs space-y-1">
                    {integration.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-center gap-2"><Sparkles className="h-3 w-3 text-purple-500" /><span>{feature}</span></li>
                    ))}
                  </ul>
                </div>
                <div className="flex gap-2 pt-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent"><Settings className="mr-2 h-4 w-4" />Details</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] boss-card">
                      {/* Dialog content remains the same as static version */}
                    </DialogContent>
                  </Dialog>
                  <Button size="sm" className="flex-1 punk-button text-white" onClick={() => handleToggleIntegration(integration.id, integration.isConnected)}>
                    {integration.isConnected ? 'Disconnect' : 'Connect Now'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
