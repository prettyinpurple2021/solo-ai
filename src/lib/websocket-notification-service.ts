import React from 'react';
import { io, Socket } from 'socket.io-client';
import { logError, logInfo, logWarn } from '@/lib/logger';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

type NotificationPayload = {
  id: number;
  userId: number;
  type: string;
  category: string;
  title: string;
  message: string;
  priority: string;
  read: boolean;
  actionUrl?: string | null;
  sentAt?: string | null;
  createdAt?: string | null;
};

type NotificationUpdatePayload = {
  id?: number;
  read?: boolean;
  all?: boolean;
};

type NotificationDeletedPayload = { id: number };

type Listener<T> = (data: T) => void;

class WebSocketNotificationService {
  private static instance: WebSocketNotificationService;
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Listener<any>>> = new Map();
  private status: ConnectionStatus = 'disconnected';
  private userId: string | null = null;

  static getInstance(): WebSocketNotificationService {
    if (!WebSocketNotificationService.instance) {
      WebSocketNotificationService.instance = new WebSocketNotificationService();
    }
    return WebSocketNotificationService.instance;
  }

  connect(userId: string) {
    if (typeof window === 'undefined') {
      return;
    }
    if (this.socket?.connected && this.userId === userId) {
      return;
    }

    this.userId = userId;
    const baseUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      `${window.location.protocol}//${window.location.host}`;

    this.status = 'connecting';
    this.emitStatus();

    this.socket?.disconnect();
    this.socket = io(baseUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      logInfo('WebSocket connected (notifications)', { baseUrl });
      this.status = 'connected';
      this.emitStatus();
      this.socket?.emit('join', userId);
    });

    this.socket.on('connect_error', (error) => {
      logError('WebSocket connect_error (notifications)', error);
      this.status = 'error';
      this.emitStatus();
    });

    this.socket.on('disconnect', (reason) => {
      logWarn('WebSocket disconnected (notifications)', { reason });
      this.status = 'disconnected';
      this.emitStatus();
    });

    this.socket.on('notification:new', (payload: NotificationPayload) => {
      this.notify('notification:new', payload);
    });

    this.socket.on('notification:updated', (payload: NotificationUpdatePayload) => {
      this.notify('notification:updated', payload);
    });

    this.socket.on('notification:deleted', (payload: NotificationDeletedPayload) => {
      this.notify('notification:deleted', payload);
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.status = 'disconnected';
    this.emitStatus();
  }

  addListener<T>(event: string, listener: Listener<T>) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener as Listener<any>);
  }

  removeListener<T>(event: string, listener: Listener<T>) {
    const listeners = this.listeners.get(event);
    if (listeners) listeners.delete(listener as Listener<any>);
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  private emitStatus() {
    this.notify('connection_status', { status: this.status });
  }

  private notify(event: string, data: any) {
    const listeners = this.listeners.get(event);
    if (!listeners) return;
    listeners.forEach((listener) => {
      try {
        listener(data);
      } catch (error) {
        logError('WebSocket listener error (notifications)', error);
      }
    });
  }
}

export const wsNotificationService = WebSocketNotificationService.getInstance();

export function useWebSocketNotifications(userId: string | null) {
  const [connectionStatus, setConnectionStatus] = React.useState<ConnectionStatus>('disconnected');
  const [lastNotification, setLastNotification] = React.useState<NotificationPayload | null>(null);
  const [lastUpdate, setLastUpdate] = React.useState<NotificationUpdatePayload | null>(null);
  const [lastDeleted, setLastDeleted] = React.useState<NotificationDeletedPayload | null>(null);

  React.useEffect(() => {
    if (!userId) return;
    wsNotificationService.connect(userId);

    const handleStatus = (data: { status: ConnectionStatus }) => setConnectionStatus(data.status);
    const handleNew = (payload: NotificationPayload) => setLastNotification(payload);
    const handleUpdated = (payload: NotificationUpdatePayload) => setLastUpdate(payload);
    const handleDeleted = (payload: NotificationDeletedPayload) => setLastDeleted(payload);

    wsNotificationService.addListener('connection_status', handleStatus);
    wsNotificationService.addListener('notification:new', handleNew);
    wsNotificationService.addListener('notification:updated', handleUpdated);
    wsNotificationService.addListener('notification:deleted', handleDeleted);

    return () => {
      wsNotificationService.removeListener('connection_status', handleStatus);
      wsNotificationService.removeListener('notification:new', handleNew);
      wsNotificationService.removeListener('notification:updated', handleUpdated);
      wsNotificationService.removeListener('notification:deleted', handleDeleted);
      wsNotificationService.disconnect();
    };
  }, [userId]);

  return {
    connectionStatus,
    lastNotification,
    lastUpdate,
    lastDeleted,
    isConnected: connectionStatus === 'connected',
  };
}