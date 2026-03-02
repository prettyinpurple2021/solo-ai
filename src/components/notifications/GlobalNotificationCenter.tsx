'use client';

import { useEffect, useRef } from 'react';
import { Info, AlertTriangle, AlertCircle, Bell, LucideIcon } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useWebSocketNotifications } from '@/lib/websocket-notification-service';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

/**
 * Configuration for notification priorities.
 * Maps priority strings to their respective icons and toast variants.
 */
const NOTIFICATION_CONFIG: Record<string, { icon: LucideIcon; variant: 'default' | 'destructive' }> = {
  critical: { icon: AlertTriangle, variant: 'destructive' },
  high: { icon: AlertCircle, variant: 'default' },
  medium: { icon: Bell, variant: 'default' },
  low: { icon: Info, variant: 'default' },
};

/**
 * GlobalNotificationCenter component handles the side-effect of displaying
 * push notifications received via WebSockets as UI toasts.
 * 
 * It is a headless component that should be mounted globally (e.g., in a Root Layout).
 */
export function GlobalNotificationCenter() {
  const { user } = useAuth();
  const userId = user?.id;
  const { lastNotification } = useWebSocketNotifications(userId ? String(userId) : null);
  const { toast } = useToast();
  const router = useRouter();
  
  // Track the last processed notification ID to ensure each notification is toasted exactly once.
  const lastProcessedIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Check if we have a new notification that hasn't been processed yet
    if (lastNotification && lastNotification.id !== lastProcessedIdRef.current) {
      lastProcessedIdRef.current = lastNotification.id;

      // Determine the visual style based on priority
      const config = NOTIFICATION_CONFIG[lastNotification.priority] || NOTIFICATION_CONFIG.low;
      const { icon: _Icon, variant } = config;

      toast({
        title: lastNotification.title,
        description: lastNotification.message,
        variant: variant,
        action: lastNotification.actionUrl ? (
          <Button
            variant="link"
            size="sm"
            className="p-0 h-auto font-medium underline-offset-4 hover:underline"
            onClick={() => {
              if (lastNotification.actionUrl) {
                router.push(lastNotification.actionUrl);
              }
            }}
          >
            View
          </Button>
        ) : undefined,
      });
    }
  }, [lastNotification, toast, router]);

  return null;
}
