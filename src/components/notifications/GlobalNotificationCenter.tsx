'use client';

import { useEffect, useRef } from 'react';
import { Info, AlertTriangle, AlertCircle, Bell } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useWebSocketNotifications, NotificationPayload } from '@/lib/websocket-notification-service';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export function GlobalNotificationCenter() {
  const { user } = useAuth();
  const userId = user?.id;
  const { lastNotification } = useWebSocketNotifications(userId ? String(userId) : null);
  const { toast } = useToast();
  const router = useRouter();
  
  // Keep track of the last processed notification ID to prevent duplicates
  // (although useWebSocketNotifications should only update lastNotification on new events)
  const processedRef = useRef<number | null>(null);

  useEffect(() => {
    if (lastNotification && lastNotification.id !== processedRef.current) {
      processedRef.current = lastNotification.id;

      let Icon = Info;
      let variant: 'default' | 'destructive' = 'default';

      switch (lastNotification.priority) {
        case 'critical':
          Icon = AlertTriangle;
          variant = 'destructive';
          break;
        case 'high':
          Icon = AlertCircle;
          break;
        case 'medium':
          Icon = Bell;
          break;
        case 'low':
          Icon = Info;
          break;
      }

      toast({
        title: lastNotification.title,
        description: lastNotification.message,
        variant: variant,
        action: lastNotification.actionUrl ? (
          <div 
            className="cursor-pointer font-medium underline px-2 py-1"
            onClick={() => {
                if (lastNotification.actionUrl) {
                    router.push(lastNotification.actionUrl);
                }
            }}
          >
            View
          </div>
        ) : undefined,
      });
      
      // Optional: Play sound for high priority
      if (lastNotification.priority === 'critical' || lastNotification.priority === 'high') {
          // playSound(); 
      }
    }
  }, [lastNotification, toast, router]);

  return null; // This component handles side effects (toasts) only
}
