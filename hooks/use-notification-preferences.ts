import { useState, useEffect, useCallback } from 'react';
import { NotificationPreferences, NotificationChannel } from '@/lib/notification-delivery-system';
import { AlertSeverity, AlertType } from '@/lib/competitor-alert-system';

interface UseNotificationPreferencesReturn {
  preferences: NotificationPreferences | null;
  loading: boolean;
  error: string | null;
  updatePreferences: (preferences: NotificationPreferences) => Promise<void>;
  testChannel: (channelType: NotificationChannel['type'], config?: Record<string, any>) => Promise<boolean>;
  refreshPreferences: () => Promise<void>;
}

export function useNotificationPreferences(): UseNotificationPreferencesReturn {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/notifications/preferences');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch preferences: ${response.statusText}`);
      }

      const data = await response.json();
      setPreferences(data.preferences);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch preferences');
      console.error('Error fetching notification preferences:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePreferences = useCallback(async (newPreferences: NotificationPreferences) => {
    try {
      setError(null);
      
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPreferences),
      });

      if (!response.ok) {
        throw new Error(`Failed to update preferences: ${response.statusText}`);
      }

      const data = await response.json();
      setPreferences(data.preferences);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
      console.error('Error updating notification preferences:', err);
      throw err;
    }
  }, []);

  const testChannel = useCallback(async (
    channelType: NotificationChannel['type'], 
    config: Record<string, any> = {}
  ): Promise<boolean> => {
    try {
      setError(null);
      
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel_type: channelType,
          severity: 'info',
          config,
        }),
      });

      const result = await response.json();
      return result.success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to test channel');
      console.error('Error testing notification channel:', err);
      return false;
    }
  }, []);

  const refreshPreferences = useCallback(async () => {
    setLoading(true);
    await fetchPreferences();
  }, [fetchPreferences]);

  // Initial fetch
  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    testChannel,
    refreshPreferences,
  };
}

// Helper functions for working with notification preferences
export const notificationPreferencesHelpers = {
  // Create default preferences for a new user
  createDefaultPreferences: (userId: string): NotificationPreferences => ({
    userId,
    channels: [
      {
        id: 'email_primary',
        name: 'Primary Email',
        type: 'email',
        enabled: true,
        config: {},
        severityFilter: ['critical', 'urgent'],
        typeFilter: [],
      },
      {
        id: 'in_app',
        name: 'In-App Notifications',
        type: 'in_app',
        enabled: true,
        config: {},
        severityFilter: [],
        typeFilter: [],
      },
    ],
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '08:00',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    frequency: {
      immediate: ['critical', 'urgent'],
      batched: ['warning', 'info'],
      batchInterval: 60,
    },
  }),

  // Check if a channel should receive a specific alert
  shouldReceiveAlert: (
    channel: NotificationChannel,
    severity: AlertSeverity,
    alertType: AlertType
  ): boolean => {
    if (!channel.enabled) return false;

    // Check severity filter
    if (channel.severityFilter.length > 0 && !channel.severityFilter.includes(severity)) {
      return false;
    }

    // Check type filter
    if (channel.typeFilter.length > 0 && !channel.typeFilter.includes(alertType)) {
      return false;
    }

    return true;
  },

  // Validate channel configuration
  validateChannelConfig: (channel: NotificationChannel): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    switch (channel.type) {
      case 'email':
        if (!channel.config.email) {
          errors.push('Email address is required');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(channel.config.email)) {
          errors.push('Invalid email address format');
        }
        break;

      case 'slack':
      case 'discord':
        if (!channel.config.webhookUrl) {
          errors.push('Webhook URL is required');
        } else if (!channel.config.webhookUrl.startsWith('https://')) {
          errors.push('Webhook URL must use HTTPS');
        }
        break;

      case 'webhook':
        if (!channel.config.url) {
          errors.push('Webhook URL is required');
        } else if (!channel.config.url.startsWith('https://')) {
          errors.push('Webhook URL must use HTTPS');
        }
        break;

      case 'push':
        // Push notifications might require device tokens or other config
        // For now, we'll assume they're handled by the service worker
        break;

      case 'in_app':
        // In-app notifications don't require additional config
        break;

      default:
        errors.push(`Unsupported channel type: ${channel.type}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  // Get enabled channels for a specific severity/type combination
  getEnabledChannels: (
    preferences: NotificationPreferences,
    severity: AlertSeverity,
    alertType: AlertType
  ): NotificationChannel[] => {
    return preferences.channels.filter(channel =>
      notificationPreferencesHelpers.shouldReceiveAlert(channel, severity, alertType)
    );
  },

  // Check if delivery should be immediate or batched
  shouldDeliverImmediately: (
    preferences: NotificationPreferences,
    severity: AlertSeverity
  ): boolean => {
    return preferences.frequency.immediate.includes(severity);
  },

  // Get the next batch delivery time
  getNextBatchTime: (preferences: NotificationPreferences): Date => {
    const now = new Date();
    const batchIntervalMs = preferences.frequency.batchInterval * 60 * 1000;
    return new Date(now.getTime() + batchIntervalMs);
  },

  // Check if we're currently in quiet hours
  isInQuietHours: (preferences: NotificationPreferences): boolean => {
    if (!preferences.quietHours.enabled) return false;

    const now = new Date();
    const userTime = new Intl.DateTimeFormat('en-US', {
      timeZone: preferences.quietHours.timezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    }).format(now);

    const [currentHour, currentMinute] = userTime.split(':').map(Number);
    const currentMinutes = currentHour * 60 + currentMinute;

    const [startHour, startMinute] = preferences.quietHours.start.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;

    const [endHour, endMinute] = preferences.quietHours.end.split(':').map(Number);
    const endMinutes = endHour * 60 + endMinute;

    if (startMinutes <= endMinutes) {
      // Same day range (e.g., 09:00 to 17:00)
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    } else {
      // Overnight range (e.g., 22:00 to 06:00)
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }
  },
};