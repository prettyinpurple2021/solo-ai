'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle2, 
  Archive,
  Filter,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Users,
  Newspaper,
  Globe
} from 'lucide-react';
import { useCompetitorAlerts, CompetitorAlert, AlertStats } from '@/hooks/use-competitor-alerts';
import { AlertSeverity, AlertType } from '@/lib/competitor-alert-system';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface AlertDashboardProps {
  className?: string;
}

const severityConfig = {
  critical: {
    icon: AlertTriangle,
    color: 'text-red-500',
    bgColor: 'bg-red-50 border-red-200',
    badge: 'destructive',
  },
  urgent: {
    icon: AlertCircle,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 border-orange-200',
    badge: 'secondary',
  },
  warning: {
    icon: AlertCircle,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50 border-yellow-200',
    badge: 'outline',
  },
  info: {
    icon: Info,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 border-blue-200',
    badge: 'secondary',
  },
} as const;

const alertTypeConfig = {
  pricing_change: { icon: DollarSign, label: 'Pricing Change', color: 'text-green-600' },
  product_launch: { icon: TrendingUp, label: 'Product Launch', color: 'text-purple-600' },
  funding_announcement: { icon: DollarSign, label: 'Funding News', color: 'text-blue-600' },
  key_hire: { icon: Users, label: 'Key Hire', color: 'text-indigo-600' },
  negative_news: { icon: Newspaper, label: 'Negative News', color: 'text-red-600' },
  website_change: { icon: Globe, label: 'Website Change', color: 'text-gray-600' },
  social_activity: { icon: Bell, label: 'Social Activity', color: 'text-pink-600' },
  job_posting: { icon: Users, label: 'Job Posting', color: 'text-teal-600' },
  partnership: { icon: Users, label: 'Partnership', color: 'text-cyan-600' },
  acquisition: { icon: TrendingUp, label: 'Acquisition', color: 'text-orange-600' },
  market_expansion: { icon: Globe, label: 'Market Expansion', color: 'text-emerald-600' },
} as const;

export function AlertDashboard({ className }: AlertDashboardProps) {
  const [selectedSeverity, setSelectedSeverity] = useState<AlertSeverity | 'all'>('all');
  const [selectedType, setSelectedType] = useState<AlertType | 'all'>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const { 
    alerts, 
    stats, 
    loading, 
    error, 
    refreshAlerts, 
    markAsRead, 
    archiveAlert 
  } = useCompetitorAlerts({
    severity: selectedSeverity === 'all' ? undefined : selectedSeverity,
    type: selectedType === 'all' ? undefined : selectedType,
    unreadOnly: showUnreadOnly,
    autoRefresh: true,
    refreshInterval: 30000,
  });

  const handleMarkAsRead = async (alertId: number) => {
    try {
      await markAsRead(alertId);
    } catch (error) {
      console.error('Failed to mark alert as read:', error);
    }
  };

  const handleArchiveAlert = async (alertId: number) => {
    try {
      await archiveAlert(alertId);
    } catch (error) {
      console.error('Failed to archive alert:', error);
    }
  };

  const renderAlertCard = (alert: CompetitorAlert) => {
    const severityInfo = severityConfig[alert.severity];
    const typeInfo = alertTypeConfig[alert.alert_type];
    const SeverityIcon = severityInfo.icon;
    const TypeIcon = typeInfo.icon;

    return (
      <Card 
        key={alert.id} 
        className={cn(
          'transition-all duration-200 hover:shadow-md',
          severityInfo.bgColor,
          !alert.is_read && 'ring-2 ring-blue-200'
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <SeverityIcon className={cn('h-4 w-4', severityInfo.color)} />
              <TypeIcon className={cn('h-4 w-4', typeInfo.color)} />
              <Badge variant={severityInfo.badge as any} className="text-xs">
                {alert.severity.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {typeInfo.label}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              {!alert.is_read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMarkAsRead(alert.id)}
                  className="h-6 w-6 p-0"
                >
                  <CheckCircle2 className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleArchiveAlert(alert.id)}
                className="h-6 w-6 p-0"
              >
                <Archive className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <CardTitle className="text-sm font-medium">{alert.title}</CardTitle>
          <CardDescription className="text-xs">
            {alert.competitor_name} • {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-gray-600 line-clamp-2">{alert.description}</p>
        </CardContent>
      </Card>
    );
  };

  const renderStatsCard = (stats: AlertStats) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-gray-500">Total Alerts</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{stats.unread}</p>
              <p className="text-xs text-gray-500">Unread</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-2xl font-bold">{stats.critical}</p>
              <p className="text-xs text-gray-500">Critical</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">{stats.urgent}</p>
              <p className="text-xs text-gray-500">Urgent</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>Error loading alerts: {error}</p>
            <Button onClick={refreshAlerts} className="mt-2">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Competitor Alerts</h2>
          <p className="text-gray-600">Real-time intelligence notifications</p>
        </div>
        <Button
          onClick={refreshAlerts}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {stats && renderStatsCard(stats)}

      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Alerts</TabsTrigger>
            <TabsTrigger value="critical">Critical</TabsTrigger>
            <TabsTrigger value="urgent">Urgent</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Button
              variant={showUnreadOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Unread Only
            </Button>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Loading alerts...</p>
            </div>
          ) : alerts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No alerts found</h3>
                <p className="text-gray-600">
                  {showUnreadOnly 
                    ? "You're all caught up! No unread alerts."
                    : "No competitor alerts at the moment. We'll notify you when something important happens."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-3">
                {alerts.map(renderAlertCard)}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="critical" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <div className="space-y-3">
              {alerts
                .filter(alert => alert.severity === 'critical')
                .map(renderAlertCard)}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="urgent" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <div className="space-y-3">
              {alerts
                .filter(alert => alert.severity === 'urgent')
                .map(renderAlertCard)}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <div className="space-y-3">
              {alerts
                .filter(alert => !alert.is_read)
                .map(renderAlertCard)}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}