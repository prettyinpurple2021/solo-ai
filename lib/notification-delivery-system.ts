import { Resend } from 'resend';
import { CompetitorAlert } from '@/hooks/use-competitor-alerts';
import { AlertSeverity, AlertType } from './competitor-alert-system';

export interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'push' | 'slack' | 'discord' | 'webhook' | 'in_app';
  enabled: boolean;
  config: Record<string, any>;
  severityFilter: AlertSeverity[];
  typeFilter: AlertType[];
}

export interface NotificationPreferences {
  userId: string;
  channels: NotificationChannel[];
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string;   // HH:MM format
    timezone: string;
  };
  frequency: {
    immediate: AlertSeverity[];
    batched: AlertSeverity[];
    batchInterval: number; // minutes
  };
}

export interface NotificationDeliveryResult {
  channelId: string;
  success: boolean;
  messageId?: string;
  error?: string;
  deliveredAt: Date;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class NotificationDeliverySystem {
  private static instance: NotificationDeliverySystem;
  private resend: Resend | null = null;
  private batchedNotifications: Map<string, CompetitorAlert[]> = new Map();
  private batchTimers: Map<string, NodeJS.Timeout> = new Map();

  static getInstance(): NotificationDeliverySystem {
    if (!NotificationDeliverySystem.instance) {
      NotificationDeliverySystem.instance = new NotificationDeliverySystem();
    }
    return NotificationDeliverySystem.instance;
  }

  constructor() {
    // Initialize Resend if API key is available
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      this.resend = new Resend(resendApiKey);
    }
  }

  async deliverNotification(
    alert: CompetitorAlert,
    preferences: NotificationPreferences
  ): Promise<NotificationDeliveryResult[]> {
    const results: NotificationDeliveryResult[] = [];

    // Check if we're in quiet hours
    if (this.isQuietHours(preferences.quietHours)) {
      // Queue for later delivery unless it's critical
      if (alert.severity !== 'critical') {
        return results;
      }
    }

    // Determine delivery method based on severity
    const shouldDeliverImmediately = preferences.frequency.immediate.includes(alert.severity as AlertSeverity);
    
    if (shouldDeliverImmediately) {
      // Deliver immediately
      for (const channel of preferences.channels) {
        if (this.shouldDeliverToChannel(alert, channel)) {
          const result = await this.deliverToChannel(alert, channel);
          results.push(result);
        }
      }
    } else {
      // Add to batch
      this.addToBatch(alert, preferences);
    }

    return results;
  }

  private isQuietHours(quietHours: NotificationPreferences['quietHours']): boolean {
    if (!quietHours.enabled) return false;

    const now = new Date();
    const userTime = new Intl.DateTimeFormat('en-US', {
      timeZone: quietHours.timezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    }).format(now);

    const [currentHour, currentMinute] = userTime.split(':').map(Number);
    const currentMinutes = currentHour * 60 + currentMinute;

    const [startHour, startMinute] = quietHours.start.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;

    const [endHour, endMinute] = quietHours.end.split(':').map(Number);
    const endMinutes = endHour * 60 + endMinute;

    if (startMinutes <= endMinutes) {
      // Same day range (e.g., 09:00 to 17:00)
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    } else {
      // Overnight range (e.g., 22:00 to 06:00)
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }
  }

  private shouldDeliverToChannel(alert: CompetitorAlert, channel: NotificationChannel): boolean {
    if (!channel.enabled) return false;

    // Check severity filter
    if (channel.severityFilter.length > 0 && 
        !channel.severityFilter.includes(alert.severity as AlertSeverity)) {
      return false;
    }

    // Check type filter
    if (channel.typeFilter.length > 0 && 
        !channel.typeFilter.includes(alert.alert_type as AlertType)) {
      return false;
    }

    return true;
  }

  private async deliverToChannel(
    alert: CompetitorAlert,
    channel: NotificationChannel
  ): Promise<NotificationDeliveryResult> {
    const result: NotificationDeliveryResult = {
      channelId: channel.id,
      success: false,
      deliveredAt: new Date(),
    };

    try {
      switch (channel.type) {
        case 'email':
          result.messageId = await this.sendEmailNotification(alert, channel);
          break;
        case 'push':
          result.messageId = await this.sendPushNotification(alert, channel);
          break;
        case 'slack':
          result.messageId = await this.sendSlackNotification(alert, channel);
          break;
        case 'discord':
          result.messageId = await this.sendDiscordNotification(alert, channel);
          break;
        case 'webhook':
          result.messageId = await this.sendWebhookNotification(alert, channel);
          break;
        case 'in_app':
          // In-app notifications are handled by the frontend
          result.messageId = `in_app_${alert.id}`;
          break;
        default:
          throw new Error(`Unsupported channel type: ${channel.type}`);
      }

      result.success = true;
    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return result;
  }

  private async sendEmailNotification(
    alert: CompetitorAlert,
    channel: NotificationChannel
  ): Promise<string> {
    if (!this.resend) {
      throw new Error('Resend not configured');
    }

    const template = this.generateEmailTemplate(alert);
    const toEmail = channel.config.email || channel.config.to;

    if (!toEmail) {
      throw new Error('No email address configured for channel');
    }

    const response = await this.resend.emails.send({
      from: process.env.FROM_EMAIL || 'alerts@soloboss.ai',
      to: toEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    if (response.error) {
      throw new Error(`Email delivery failed: ${response.error.message}`);
    }

    return response.data?.id || 'email_sent';
  }

  private generateEmailTemplate(alert: CompetitorAlert): EmailTemplate {
    const severityEmoji = {
      critical: '🚨',
      urgent: '⚠️',
      warning: '⚡',
      info: 'ℹ️',
    };

    const subject = `${severityEmoji[alert.severity as AlertSeverity]} ${alert.title}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .alert-badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
            .critical { background: #fee2e2; color: #dc2626; }
            .urgent { background: #fef3c7; color: #d97706; }
            .warning { background: #fef3c7; color: #d97706; }
            .info { background: #dbeafe; color: #2563eb; }
            .competitor { font-weight: bold; color: #8B5CF6; }
            .description { margin: 16px 0; padding: 16px; background: white; border-radius: 6px; border-left: 4px solid #8B5CF6; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
            .cta-button { display: inline-block; padding: 12px 24px; background: #8B5CF6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 16px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${severityEmoji[alert.severity as AlertSeverity]} Competitor Alert</h1>
              <p>Real-time intelligence from SoloBoss AI</p>
            </div>
            <div class="content">
              <div style="margin-bottom: 16px;">
                <span class="alert-badge ${alert.severity}">${alert.severity}</span>
              </div>
              
              <h2>${alert.title}</h2>
              
              <p><strong>Competitor:</strong> <span class="competitor">${alert.competitor_name}</span></p>
              
              <div class="description">
                ${alert.description.replace(/\n/g, '<br>')}
              </div>
              
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/competitors" class="cta-button">
                View Full Intelligence →
              </a>
              
              <div class="footer">
                <p>This alert was generated by SoloBoss AI's competitor intelligence system.</p>
                <p>Received at ${new Date(alert.created_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
${severityEmoji[alert.severity as AlertSeverity]} COMPETITOR ALERT - ${alert.severity.toUpperCase()}

${alert.title}

Competitor: ${alert.competitor_name}

${alert.description}

View full intelligence: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/competitors

---
SoloBoss AI Competitor Intelligence
Received: ${new Date(alert.created_at).toLocaleString()}
    `.trim();

    return { subject, html, text };
  }

  private async sendPushNotification(
    alert: CompetitorAlert,
    channel: NotificationChannel
  ): Promise<string> {
    // This would integrate with a push notification service like FCM or APNs
    // For now, we'll simulate the functionality
    
    const payload = {
      title: alert.title,
      body: `${alert.competitor_name}: ${alert.description.substring(0, 100)}...`,
      icon: '/icons/alert.png',
      badge: '/icons/badge.png',
      data: {
        alertId: alert.id,
        competitorId: alert.competitor_id,
        severity: alert.severity,
        url: `/dashboard/competitors/${alert.competitor_id}`,
      },
    };

    // In a real implementation, you would send this to FCM/APNs
    console.log('Push notification payload:', payload);
    
    return `push_${alert.id}_${Date.now()}`;
  }

  private async sendSlackNotification(
    alert: CompetitorAlert,
    channel: NotificationChannel
  ): Promise<string> {
    const webhookUrl = channel.config.webhookUrl;
    if (!webhookUrl) {
      throw new Error('Slack webhook URL not configured');
    }

    const severityColor = {
      critical: '#dc2626',
      urgent: '#d97706',
      warning: '#d97706',
      info: '#2563eb',
    };

    const payload = {
      text: `🚨 Competitor Alert: ${alert.title}`,
      attachments: [
        {
          color: severityColor[alert.severity as AlertSeverity],
          fields: [
            {
              title: 'Competitor',
              value: alert.competitor_name,
              short: true,
            },
            {
              title: 'Severity',
              value: alert.severity.toUpperCase(),
              short: true,
            },
            {
              title: 'Description',
              value: alert.description,
              short: false,
            },
          ],
          actions: [
            {
              type: 'button',
              text: 'View Details',
              url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/competitors/${alert.competitor_id}`,
            },
          ],
          footer: 'SoloBoss AI',
          ts: Math.floor(new Date(alert.created_at).getTime() / 1000),
        },
      ],
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Slack notification failed: ${response.statusText}`);
    }

    return `slack_${alert.id}_${Date.now()}`;
  }

  private async sendDiscordNotification(
    alert: CompetitorAlert,
    channel: NotificationChannel
  ): Promise<string> {
    const webhookUrl = channel.config.webhookUrl;
    if (!webhookUrl) {
      throw new Error('Discord webhook URL not configured');
    }

    const severityColor = {
      critical: 0xdc2626,
      urgent: 0xd97706,
      warning: 0xd97706,
      info: 0x2563eb,
    };

    const payload = {
      embeds: [
        {
          title: `🚨 ${alert.title}`,
          description: alert.description,
          color: severityColor[alert.severity as AlertSeverity],
          fields: [
            {
              name: 'Competitor',
              value: alert.competitor_name,
              inline: true,
            },
            {
              name: 'Severity',
              value: alert.severity.toUpperCase(),
              inline: true,
            },
          ],
          footer: {
            text: 'SoloBoss AI Competitor Intelligence',
          },
          timestamp: alert.created_at,
          url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/competitors/${alert.competitor_id}`,
        },
      ],
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Discord notification failed: ${response.statusText}`);
    }

    return `discord_${alert.id}_${Date.now()}`;
  }

  private async sendWebhookNotification(
    alert: CompetitorAlert,
    channel: NotificationChannel
  ): Promise<string> {
    const webhookUrl = channel.config.url;
    if (!webhookUrl) {
      throw new Error('Webhook URL not configured');
    }

    const payload = {
      event: 'competitor_alert',
      alert: {
        id: alert.id,
        competitor_id: alert.competitor_id,
        competitor_name: alert.competitor_name,
        alert_type: alert.alert_type,
        severity: alert.severity,
        title: alert.title,
        description: alert.description,
        created_at: alert.created_at,
      },
      metadata: {
        source: 'soloboss_ai',
        version: '1.0',
        timestamp: new Date().toISOString(),
      },
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'SoloBoss-AI/1.0',
    };

    // Add custom headers if configured
    if (channel.config.headers) {
      Object.assign(headers, channel.config.headers);
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook notification failed: ${response.statusText}`);
    }

    return `webhook_${alert.id}_${Date.now()}`;
  }

  private addToBatch(alert: CompetitorAlert, preferences: NotificationPreferences) {
    const batchKey = preferences.userId;
    
    if (!this.batchedNotifications.has(batchKey)) {
      this.batchedNotifications.set(batchKey, []);
    }

    this.batchedNotifications.get(batchKey)!.push(alert);

    // Set up batch timer if not already set
    if (!this.batchTimers.has(batchKey)) {
      const timer = setTimeout(() => {
        this.processBatch(batchKey, preferences);
      }, preferences.frequency.batchInterval * 60 * 1000);

      this.batchTimers.set(batchKey, timer);
    }
  }

  private async processBatch(batchKey: string, preferences: NotificationPreferences) {
    const alerts = this.batchedNotifications.get(batchKey) || [];
    if (alerts.length === 0) return;

    // Clear batch and timer
    this.batchedNotifications.delete(batchKey);
    const timer = this.batchTimers.get(batchKey);
    if (timer) {
      clearTimeout(timer);
      this.batchTimers.delete(batchKey);
    }

    // Send batched notification
    await this.sendBatchedNotification(alerts, preferences);
  }

  private async sendBatchedNotification(
    alerts: CompetitorAlert[],
    preferences: NotificationPreferences
  ) {
    // Create a summary alert for batched notifications
    const summaryAlert: CompetitorAlert = {
      id: 0,
      competitor_id: 0,
      alert_type: 'social_activity' as AlertType,
      severity: 'info' as AlertSeverity,
      title: `${alerts.length} New Competitor Alerts`,
      description: `You have ${alerts.length} new competitor intelligence updates:\n\n${alerts.map(a => `• ${a.competitor_name}: ${a.title}`).join('\n')}`,
      is_read: false,
      created_at: new Date().toISOString(),
      competitor_name: 'Multiple Competitors',
      competitor_threat_level: 'medium',
    };

    // Send to enabled channels
    for (const channel of preferences.channels) {
      if (channel.enabled && channel.type === 'email') {
        await this.deliverToChannel(summaryAlert, channel);
      }
    }
  }

  async getDefaultNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    return {
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
        timezone: 'America/New_York',
      },
      frequency: {
        immediate: ['critical', 'urgent'],
        batched: ['warning', 'info'],
        batchInterval: 60, // 1 hour
      },
    };
  }
}

export const notificationDelivery = NotificationDeliverySystem.getInstance();