'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  MessageSquare, 
  Webhook,
  Clock,
  Settings,
  TestTube,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2
} from 'lucide-react';
import { NotificationChannel, NotificationPreferences } from '@/lib/notification-delivery-system';
import { AlertSeverity, AlertType } from '@/lib/competitor-alert-system';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface NotificationPreferencesProps {
  className?: string;
}

const channelIcons = {
  email: Mail,
  push: Smartphone,
  slack: MessageSquare,
  discord: MessageSquare,
  webhook: Webhook,
  in_app: Bell,
};

const severityOptions: { value: AlertSeverity; label: string; color: string }[] = [
  { value: 'critical', label: 'Critical', color: 'text-red-600' },
  { value: 'urgent', label: 'Urgent', color: 'text-orange-600' },
  { value: 'warning', label: 'Warning', color: 'text-yellow-600' },
  { value: 'info', label: 'Info', color: 'text-blue-600' },
];

const alertTypeOptions: { value: AlertType; label: string }[] = [
  { value: 'pricing_change', label: 'Pricing Changes' },
  { value: 'product_launch', label: 'Product Launches' },
  { value: 'funding_announcement', label: 'Funding News' },
  { value: 'key_hire', label: 'Key Hires' },
  { value: 'negative_news', label: 'Negative News' },
  { value: 'website_change', label: 'Website Changes' },
  { value: 'social_activity', label: 'Social Activity' },
  { value: 'job_posting', label: 'Job Postings' },
  { value: 'partnership', label: 'Partnerships' },
  { value: 'acquisition', label: 'Acquisitions' },
  { value: 'market_expansion', label: 'Market Expansion' },
];

export function NotificationPreferences({ className }: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingChannel, setTestingChannel] = useState<string | null>(null);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notification preferences',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!preferences) return;

    setSaving(true);
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Notification preferences saved successfully',
        });
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to save notification preferences',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const testChannel = async (channel: NotificationChannel) => {
    setTestingChannel(channel.id);
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel_type: channel.type,
          severity: 'info',
          config: channel.config,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'Test Successful',
          description: `Test notification sent via ${channel.name}`,
        });
      } else {
        toast({
          title: 'Test Failed',
          description: result.message || 'Failed to send test notification',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error testing channel:', error);
      toast({
        title: 'Test Failed',
        description: 'Failed to send test notification',
        variant: 'destructive',
      });
    } finally {
      setTestingChannel(null);
    }
  };

  const updateChannel = (channelId: string, updates: Partial<NotificationChannel>) => {
    if (!preferences) return;

    setPreferences({
      ...preferences,
      channels: preferences.channels.map(channel =>
        channel.id === channelId ? { ...channel, ...updates } : channel
      ),
    });
  };

  const addChannel = (type: NotificationChannel['type']) => {
    if (!preferences) return;

    const newChannel: NotificationChannel = {
      id: `${type}_${Date.now()}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Channel`,
      type,
      enabled: true,
      config: {},
      severityFilter: [],
      typeFilter: [],
    };

    setPreferences({
      ...preferences,
      channels: [...preferences.channels, newChannel],
    });
  };

  const removeChannel = (channelId: string) => {
    if (!preferences) return;

    setPreferences({
      ...preferences,
      channels: preferences.channels.filter(channel => channel.id !== channelId),
    });
  };

  const toggleSeverityFilter = (channelId: string, severity: AlertSeverity) => {
    if (!preferences) return;

    const channel = preferences.channels.find(c => c.id === channelId);
    if (!channel) return;

    const severityFilter = channel.severityFilter.includes(severity)
      ? channel.severityFilter.filter(s => s !== severity)
      : [...channel.severityFilter, severity];

    updateChannel(channelId, { severityFilter });
  };

  const toggleTypeFilter = (channelId: string, type: AlertType) => {
    if (!preferences) return;

    const channel = preferences.channels.find(c => c.id === channelId);
    if (!channel) return;

    const typeFilter = channel.typeFilter.includes(type)
      ? channel.typeFilter.filter(t => t !== type)
      : [...channel.typeFilter, type];

    updateChannel(channelId, { typeFilter });
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <Settings className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Loading notification preferences...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!preferences) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Failed to load notification preferences</p>
            <Button onClick={fetchPreferences} className="mt-2">
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
          <h2 className="text-2xl font-bold">Notification Preferences</h2>
          <p className="text-gray-600">Configure how you receive competitor alerts</p>
        </div>
        <Button onClick={savePreferences} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="channels" className="space-y-6">
        <TabsList>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="timing">Timing</TabsTrigger>
          <TabsTrigger value="frequency">Frequency</TabsTrigger>
        </TabsList>

        <TabsContent value="channels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Channels</CardTitle>
              <CardDescription>
                Configure where you want to receive competitor alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {preferences.channels.map(channel => {
                const Icon = channelIcons[channel.type];
                
                return (
                  <div key={channel.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <div>
                          <h4 className="font-medium">{channel.name}</h4>
                          <p className="text-sm text-gray-600 capitalize">{channel.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={channel.enabled}
                          onCheckedChange={(enabled) => updateChannel(channel.id, { enabled })}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testChannel(channel)}
                          disabled={testingChannel === channel.id || !channel.enabled}
                        >
                          {testingChannel === channel.id ? (
                            <Settings className="h-3 w-3 animate-spin" />
                          ) : (
                            <TestTube className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeChannel(channel.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {channel.enabled && (
                      <>
                        {/* Channel Configuration */}
                        {channel.type === 'email' && (
                          <div className="space-y-2">
                            <Label>Email Address</Label>
                            <Input
                              type="email"
                              value={channel.config.email || ''}
                              onChange={(e) => updateChannel(channel.id, {
                                config: { ...channel.config, email: e.target.value }
                              })}
                              placeholder="your@email.com"
                            />
                          </div>
                        )}

                        {(channel.type === 'slack' || channel.type === 'discord') && (
                          <div className="space-y-2">
                            <Label>Webhook URL</Label>
                            <Input
                              type="url"
                              value={channel.config.webhookUrl || ''}
                              onChange={(e) => updateChannel(channel.id, {
                                config: { ...channel.config, webhookUrl: e.target.value }
                              })}
                              placeholder="https://hooks.slack.com/..."
                            />
                          </div>
                        )}

                        {channel.type === 'webhook' && (
                          <div className="space-y-2">
                            <Label>Webhook URL</Label>
                            <Input
                              type="url"
                              value={channel.config.url || ''}
                              onChange={(e) => updateChannel(channel.id, {
                                config: { ...channel.config, url: e.target.value }
                              })}
                              placeholder="https://your-webhook-endpoint.com"
                            />
                          </div>
                        )}

                        {/* Severity Filters */}
                        <div className="space-y-2">
                          <Label>Alert Severities</Label>
                          <div className="flex flex-wrap gap-2">
                            {severityOptions.map(severity => (
                              <Badge
                                key={severity.value}
                                variant={channel.severityFilter.includes(severity.value) ? "default" : "outline"}
                                className={cn(
                                  'cursor-pointer',
                                  channel.severityFilter.includes(severity.value) && severity.color
                                )}
                                onClick={() => toggleSeverityFilter(channel.id, severity.value)}
                              >
                                {severity.label}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500">
                            {channel.severityFilter.length === 0 
                              ? 'All severities enabled' 
                              : `Only ${channel.severityFilter.join(', ')} alerts`
                            }
                          </p>
                        </div>

                        {/* Type Filters */}
                        <div className="space-y-2">
                          <Label>Alert Types</Label>
                          <div className="flex flex-wrap gap-2">
                            {alertTypeOptions.map(type => (
                              <Badge
                                key={type.value}
                                variant={channel.typeFilter.includes(type.value) ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => toggleTypeFilter(channel.id, type.value)}
                              >
                                {type.label}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500">
                            {channel.typeFilter.length === 0 
                              ? 'All alert types enabled' 
                              : `Only selected types: ${channel.typeFilter.length} enabled`
                            }
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addChannel('email')}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Email
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addChannel('slack')}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Slack
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addChannel('discord')}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Discord
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addChannel('webhook')}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Webhook
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quiet Hours</CardTitle>
              <CardDescription>
                Set times when you don't want to receive non-critical notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={preferences.quietHours.enabled}
                  onCheckedChange={(enabled) => setPreferences({
                    ...preferences,
                    quietHours: { ...preferences.quietHours, enabled }
                  })}
                />
                <Label>Enable quiet hours</Label>
              </div>

              {preferences.quietHours.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={preferences.quietHours.start}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        quietHours: { ...preferences.quietHours, start: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={preferences.quietHours.end}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        quietHours: { ...preferences.quietHours, end: e.target.value }
                      })}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="frequency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Frequency</CardTitle>
              <CardDescription>
                Configure when alerts are delivered immediately vs. batched
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Immediate Delivery</Label>
                  <p className="text-sm text-gray-600 mb-2">
                    These alert severities will be delivered immediately
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {severityOptions.map(severity => (
                      <Badge
                        key={severity.value}
                        variant={preferences.frequency.immediate.includes(severity.value) ? "default" : "outline"}
                        className={cn(
                          'cursor-pointer',
                          preferences.frequency.immediate.includes(severity.value) && severity.color
                        )}
                        onClick={() => {
                          const immediate = preferences.frequency.immediate.includes(severity.value)
                            ? preferences.frequency.immediate.filter(s => s !== severity.value)
                            : [...preferences.frequency.immediate, severity.value];
                          
                          setPreferences({
                            ...preferences,
                            frequency: { ...preferences.frequency, immediate }
                          });
                        }}
                      >
                        {severity.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-base font-medium">Batched Delivery</Label>
                  <p className="text-sm text-gray-600 mb-2">
                    These alert severities will be batched and sent periodically
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {severityOptions.map(severity => (
                      <Badge
                        key={severity.value}
                        variant={preferences.frequency.batched.includes(severity.value) ? "default" : "outline"}
                        className={cn(
                          'cursor-pointer',
                          preferences.frequency.batched.includes(severity.value) && severity.color
                        )}
                        onClick={() => {
                          const batched = preferences.frequency.batched.includes(severity.value)
                            ? preferences.frequency.batched.filter(s => s !== severity.value)
                            : [...preferences.frequency.batched, severity.value];
                          
                          setPreferences({
                            ...preferences,
                            frequency: { ...preferences.frequency, batched }
                          });
                        }}
                      >
                        {severity.label}
                      </Badge>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label>Batch Interval (minutes)</Label>
                    <Select
                      value={preferences.frequency.batchInterval.toString()}
                      onValueChange={(value) => setPreferences({
                        ...preferences,
                        frequency: { ...preferences.frequency, batchInterval: parseInt(value) }
                      })}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="240">4 hours</SelectItem>
                        <SelectItem value="480">8 hours</SelectItem>
                        <SelectItem value="1440">24 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}