'use client';

import React, { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  X,
  Eye,
  Archive
} from 'lucide-react';
import { useCompetitorAlerts, CompetitorAlert } from '@/hooks/use-competitor-alerts';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface AlertNotificationsProps {
  className?: string;
  maxVisible?: number;
  autoHideDelay?: number;
}

interface NotificationAlert extends CompetitorAlert {
  notificationId: string;
  showTime: number;
}

const severityConfig = {
  critical: {
    icon: AlertTriangle,
    color: 'text-red-500',
    bgColor: 'bg-red-50 border-red-500',
    duration: 0, // Don't auto-hide critical alerts
  },
  urgent: {
    icon: AlertCircle,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 border-orange-500',
    duration: 10000, // 10 seconds
  },
  warning: {
    icon: AlertCircle,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50 border-yellow-500',
    duration: 8000, // 8 seconds
  },
  info: {
    icon: Info,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 border-blue-500',
    duration: 6000, // 6 seconds
  },
} as const;

export function AlertNotifications({ 
  className, 
  maxVisible = 5,
  autoHideDelay = 5000 
}: AlertNotificationsProps) {
  const [visibleAlerts, setVisibleAlerts] = useState<NotificationAlert[]>([]);
  const [lastAlertTime, setLastAlertTime] = useState<Date | null>(null);

  const { alerts, markAsRead, archiveAlert } = useCompetitorAlerts({
    limit: 10,
    unreadOnly: true,
    autoRefresh: true,
    refreshInterval: 10000, // Check every 10 seconds
  });

  // Check for new alerts
  useEffect(() => {
    if (alerts.length === 0) return;

    const newAlerts = alerts.filter(alert => {
      const alertTime = new Date(alert.created_at);
      return !lastAlertTime || alertTime > lastAlertTime;
    });

    if (newAlerts.length > 0) {
      // Add new alerts to visible notifications
      const notificationAlerts: NotificationAlert[] = newAlerts.map(alert => ({
        ...alert,
        notificationId: `${alert.id}-${Date.now()}`,
        showTime: Date.now(),
      }));

      setVisibleAlerts(prev => {
        const updated = [...notificationAlerts, ...prev];
        return updated.slice(0, maxVisible);
      });

      // Update last alert time
      const latestTime = Math.max(...newAlerts.map(a => new Date(a.created_at).getTime()));
      setLastAlertTime(new Date(latestTime));

      // Show toast notifications for critical/urgent alerts
      newAlerts.forEach(alert => {
        if (alert.severity === 'critical' || alert.severity === 'urgent') {
          const severityInfo = severityConfig[alert.severity];
          const Icon = severityInfo.icon;
          
          toast({
            title: alert.title,
            description: `${alert.competitor_name}: ${alert.description.substring(0, 100)}...`,
            duration: alert.severity === 'critical' ? 0 : 8000,
            action: (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => markAsRead(alert.id)}
                >
                  <Eye className="h-3 w-3" />
                </Button>
              </div>
            ),
          });
        }
      });
    }
  }, [alerts, lastAlertTime, maxVisible, markAsRead]);

  // Auto-hide alerts based on severity
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    visibleAlerts.forEach(alert => {
      const severityInfo = severityConfig[alert.severity];
      if (severityInfo.duration > 0) {
        const timer = setTimeout(() => {
          setVisibleAlerts(prev => 
            prev.filter(a => a.notificationId !== alert.notificationId)
          );
        }, severityInfo.duration);
        
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [visibleAlerts]);

  const handleDismiss = (notificationId: string) => {
    setVisibleAlerts(prev => 
      prev.filter(alert => alert.notificationId !== notificationId)
    );
  };

  const handleMarkAsRead = async (alert: NotificationAlert) => {
    try {
      await markAsRead(alert.id);
      handleDismiss(alert.notificationId);
    } catch (error) {
      console.error('Failed to mark alert as read:', error);
    }
  };

  const handleArchive = async (alert: NotificationAlert) => {
    try {
      await archiveAlert(alert.id);
      handleDismiss(alert.notificationId);
    } catch (error) {
      console.error('Failed to archive alert:', error);
    }
  };

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className={cn(
      'fixed top-4 right-4 z-50 space-y-2 max-w-sm',
      className
    )}>
      {visibleAlerts.map(alert => {
        const severityInfo = severityConfig[alert.severity];
        const Icon = severityInfo.icon;

        return (
          <Card
            key={alert.notificationId}
            className={cn(
              'animate-in slide-in-from-right-full duration-300',
              'shadow-lg border-l-4',
              severityInfo.bgColor
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', severityInfo.color)} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge 
                      variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <h4 className="font-medium text-sm mb-1 line-clamp-1">
                    {alert.title}
                  </h4>
                  
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {alert.competitor_name}: {alert.description}
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleMarkAsRead(alert)}
                      className="h-6 px-2 text-xs"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Mark Read
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleArchive(alert)}
                      className="h-6 px-2 text-xs"
                    >
                      <Archive className="h-3 w-3 mr-1" />
                      Archive
                    </Button>
                  </div>
                </div>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDismiss(alert.notificationId)}
                  className="h-6 w-6 p-0 flex-shrink-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Alert bell icon with notification count
interface AlertBellProps {
  className?: string;
  onClick?: () => void;
}

export function AlertBell({ className, onClick }: AlertBellProps) {
  const { stats } = useCompetitorAlerts({
    limit: 1,
    autoRefresh: true,
    refreshInterval: 30000,
  });

  const unreadCount = stats?.unread || 0;
  const hasUrgent = (stats?.critical || 0) + (stats?.urgent || 0) > 0;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn('relative', className)}
    >
      <Bell className={cn(
        'h-5 w-5',
        hasUrgent && 'text-red-500 animate-pulse'
      )} />
      
      {unreadCount > 0 && (
        <span className={cn(
          'absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs font-medium',
          'flex items-center justify-center',
          hasUrgent 
            ? 'bg-red-500 text-white animate-pulse' 
            : 'bg-blue-500 text-white'
        )}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Button>
  );
}