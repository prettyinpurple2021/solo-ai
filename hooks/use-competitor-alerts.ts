import { useState, useEffect, useCallback } from 'react';
import { AlertSeverity, AlertType } from '@/lib/competitor-alert-system';

export interface CompetitorAlert {
  id: number;
  competitor_id: number;
  alert_type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  is_read: boolean;
  created_at: string;
  competitor_name: string;
  competitor_threat_level: string;
}

export interface AlertStats {
  total: number;
  unread: number;
  critical: number;
  urgent: number;
  byType: Record<string, number>;
}

interface UseCompetitorAlertsOptions {
  limit?: number;
  severity?: AlertSeverity;
  type?: AlertType;
  unreadOnly?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseCompetitorAlertsReturn {
  alerts: CompetitorAlert[];
  stats: AlertStats | null;
  loading: boolean;
  error: string | null;
  refreshAlerts: () => Promise<void>;
  markAsRead: (alertId: number) => Promise<void>;
  archiveAlert: (alertId: number) => Promise<void>;
  processIntelligence: (intelligenceId: number) => Promise<void>;
}

export function useCompetitorAlerts(options: UseCompetitorAlertsOptions = {}): UseCompetitorAlertsReturn {
  const {
    limit = 50,
    severity,
    type,
    unreadOnly = false,
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
  } = options;

  const [alerts, setAlerts] = useState<CompetitorAlert[]>([]);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setError(null);
      
      const params = new URLSearchParams({
        limit: limit.toString(),
        ...(severity && { severity }),
        ...(type && { type }),
        ...(unreadOnly && { unread_only: 'true' }),
      });

      const response = await fetch(`/api/competitors/alerts?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch alerts: ${response.statusText}`);
      }

      const data = await response.json();
      setAlerts(data.alerts || []);
      setStats(data.stats || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch alerts');
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  }, [limit, severity, type, unreadOnly]);

  const refreshAlerts = useCallback(async () => {
    setLoading(true);
    await fetchAlerts();
  }, [fetchAlerts]);

  const markAsRead = useCallback(async (alertId: number) => {
    try {
      const response = await fetch(`/api/competitors/alerts/${alertId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'mark_read' }),
      });

      if (!response.ok) {
        throw new Error(`Failed to mark alert as read: ${response.statusText}`);
      }

      // Update local state
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, is_read: true } : alert
      ));

      // Update stats
      if (stats) {
        setStats(prev => prev ? { ...prev, unread: Math.max(0, prev.unread - 1) } : null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark alert as read');
      console.error('Error marking alert as read:', err);
    }
  }, [stats]);

  const archiveAlert = useCallback(async (alertId: number) => {
    try {
      const response = await fetch(`/api/competitors/alerts/${alertId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'archive' }),
      });

      if (!response.ok) {
        throw new Error(`Failed to archive alert: ${response.statusText}`);
      }

      // Remove from local state
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));

      // Update stats
      if (stats) {
        setStats(prev => {
          if (!prev) return null;
          const alert = alerts.find(a => a.id === alertId);
          return {
            ...prev,
            total: Math.max(0, prev.total - 1),
            unread: alert && !alert.is_read ? Math.max(0, prev.unread - 1) : prev.unread,
            critical: alert && alert.severity === 'critical' ? Math.max(0, prev.critical - 1) : prev.critical,
            urgent: alert && alert.severity === 'urgent' ? Math.max(0, prev.urgent - 1) : prev.urgent,
          };
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive alert');
      console.error('Error archiving alert:', err);
    }
  }, [alerts, stats]);

  const processIntelligence = useCallback(async (intelligenceId: number) => {
    try {
      const response = await fetch('/api/competitors/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ intelligence_id: intelligenceId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to process intelligence: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Refresh alerts if any were generated
      if (data.result.alertsGenerated > 0) {
        await fetchAlerts();
      }

      return data.result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process intelligence');
      console.error('Error processing intelligence:', err);
      throw err;
    }
  }, [fetchAlerts]);

  // Initial fetch
  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchAlerts, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchAlerts]);

  return {
    alerts,
    stats,
    loading,
    error,
    refreshAlerts,
    markAsRead,
    archiveAlert,
    processIntelligence,
  };
}

// Hook for competitor-specific alerts
export function useCompetitorSpecificAlerts(competitorId: number, limit: number = 20) {
  const [alerts, setAlerts] = useState<CompetitorAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompetitorAlerts = useCallback(async () => {
    try {
      setError(null);
      
      const response = await fetch(`/api/competitors/${competitorId}/alerts?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch competitor alerts: ${response.statusText}`);
      }

      const data = await response.json();
      setAlerts(data.alerts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch competitor alerts');
      console.error('Error fetching competitor alerts:', err);
    } finally {
      setLoading(false);
    }
  }, [competitorId, limit]);

  useEffect(() => {
    fetchCompetitorAlerts();
  }, [fetchCompetitorAlerts]);

  return {
    alerts,
    loading,
    error,
    refreshAlerts: fetchCompetitorAlerts,
  };
}