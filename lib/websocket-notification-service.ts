import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import { CompetitorAlert } from '@/hooks/use-competitor-alerts';
import { io, Socket } from 'socket.io-client';

export interface WebSocketMessage {
  type: 'competitor_alert' | 'alert_update' | 'connection_status' | 'ping' | 'pong' | 'task:updated' | 'chat:updated' | 'context:updated' | 'report:created';
  data?: any;
  timestamp: string;
}

export interface AlertWebSocketMessage extends WebSocketMessage {
  type: 'competitor_alert';
  data: {
    alert: CompetitorAlert;
    userId: string;
  };
}

export interface AlertUpdateMessage extends WebSocketMessage {
  type: 'alert_update';
  data: {
    alertId: number;
    action: 'read' | 'archived' | 'updated';
    userId: string;
  };
}

export class WebSocketNotificationService {
  private static instance: WebSocketNotificationService;
  private ws: Socket | null = null;
  private listeners: Map<string, Set<(message: WebSocketMessage) => void>> = new Map();
  private connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error' = 'disconnected';

  static getInstance(): WebSocketNotificationService {
    if (!WebSocketNotificationService.instance) {
      WebSocketNotificationService.instance = new WebSocketNotificationService();
    }
    return WebSocketNotificationService.instance;
  }

  constructor() {
    // Initialize listeners map
    this.listeners.set('competitor_alert', new Set());
    this.listeners.set('alert_update', new Set());
    this.listeners.set('connection_status', new Set());
    this.listeners.set('task:updated', new Set());
    this.listeners.set('chat:updated', new Set());
    this.listeners.set('context:updated', new Set());
    this.listeners.set('report:created', new Set());
  }

  connect(userId: string): void {
    if (this.ws && this.ws.connected) {
      return; // Already connected
    }

    this.connectionStatus = 'connecting';
    this.notifyConnectionStatus();

    try {
      const wsUrl = this.getWebSocketUrl();
      logInfo(`Connecting to WebSocket: ${wsUrl}`);

      this.ws = io(wsUrl, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.setupEventListeners(userId);

    } catch (error) {
      logError('WebSocket connection error:', error);
      this.connectionStatus = 'error';
      this.notifyConnectionStatus();
    }
  }

  private getWebSocketUrl(): string {
    // Use environment variable or default to localhost:3001 (backend port)
    // In production, this might be the same host if served from same origin, or a specific API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return apiUrl;
  }

  private setupEventListeners(userId: string): void {
    if (!this.ws) return;

    this.ws.on('connect', () => {
      logInfo('WebSocket connected');
      this.connectionStatus = 'connected';
      this.notifyConnectionStatus();

      // Join user room
      this.ws?.emit('join', userId);
    });

    this.ws.on('disconnect', (reason) => {
      logInfo('WebSocket disconnected', { reason });
      this.connectionStatus = 'disconnected';
      this.notifyConnectionStatus();
    });

    this.ws.on('connect_error', (error) => {
      logError('WebSocket connection error:', error);
      this.connectionStatus = 'error';
      this.notifyConnectionStatus();
    });

    // Listen for specific events from server
    this.ws.on('task:updated', (data) => {
      this.handleMessage({ type: 'task:updated', data, timestamp: new Date().toISOString() });
    });

    this.ws.on('chat:updated', (data) => {
      this.handleMessage({ type: 'chat:updated', data, timestamp: new Date().toISOString() });
    });

    this.ws.on('context:updated', (data) => {
      this.handleMessage({ type: 'context:updated', data, timestamp: new Date().toISOString() });
    });

    this.ws.on('report:created', (data) => {
      this.handleMessage({ type: 'report:created', data, timestamp: new Date().toISOString() });
      // Also treat report creation as a competitor alert for now
      this.handleMessage({
        type: 'competitor_alert',
        data: { alert: data, userId },
        timestamp: new Date().toISOString()
      });
    });
  }

  private handleMessage(message: WebSocketMessage): void {
    logInfo('Received WebSocket message:', message);
    this.notifyListeners(message.type, message);
  }

  private notifyListeners(type: string, message: WebSocketMessage): void {
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(message);
        } catch (error) {
          logError('Error in WebSocket listener:', error);
        }
      });
    }
  }

  private notifyConnectionStatus(): void {
    const message: WebSocketMessage = {
      type: 'connection_status',
      data: { status: this.connectionStatus },
      timestamp: new Date().toISOString(),
    };
    this.notifyListeners('connection_status', message);
  }

  // Public methods for managing listeners
  addListener(type: string, listener: (message: WebSocketMessage) => void): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);
  }

  removeListener(type: string, listener: (message: WebSocketMessage) => void): void {
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  // Simulate receiving a competitor alert (for development/testing)
  simulateAlert(alert: CompetitorAlert, userId: string): void {
    const message: AlertWebSocketMessage = {
      type: 'competitor_alert',
      data: { alert, userId },
      timestamp: new Date().toISOString(),
    };
    this.handleMessage(message);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.disconnect();
      this.ws = null;
    }

    this.connectionStatus = 'disconnected';
    this.notifyConnectionStatus();
  }

  getConnectionStatus(): string {
    return this.connectionStatus;
  }

  isConnected(): boolean {
    return this.connectionStatus === 'connected';
  }
}

// Export singleton instance
export const wsNotificationService = WebSocketNotificationService.getInstance();

// React hook for using WebSocket notifications
export function useWebSocketNotifications(userId: string | null) {
  const [connectionStatus, setConnectionStatus] = React.useState<string>('disconnected');
  const [lastAlert, setLastAlert] = React.useState<CompetitorAlert | null>(null);

  React.useEffect(() => {
    if (!userId) return;

    // Connect to WebSocket
    wsNotificationService.connect(userId);

    // Set up listeners
    const handleConnectionStatus = (message: WebSocketMessage) => {
      if (message.data?.status) {
        setConnectionStatus(message.data.status);
      }
    };

    const handleAlert = (message: WebSocketMessage) => {
      if (message.type === 'competitor_alert' && message.data?.alert) {
        setLastAlert(message.data.alert);
      }
    };

    wsNotificationService.addListener('connection_status', handleConnectionStatus);
    wsNotificationService.addListener('competitor_alert', handleAlert);

    // Cleanup
    return () => {
      wsNotificationService.removeListener('connection_status', handleConnectionStatus);
      wsNotificationService.removeListener('competitor_alert', handleAlert);
    };
  }, [userId]);

  // Disconnect when component unmounts
  React.useEffect(() => {
    return () => {
      wsNotificationService.disconnect();
    };
  }, []);

  return {
    connectionStatus,
    lastAlert,
    isConnected: connectionStatus === 'connected',
    simulateAlert: (alert: CompetitorAlert) => {
      if (userId) {
        wsNotificationService.simulateAlert(alert, userId);
      }
    },
  };
}

// Note: This would need React import in a real implementation
// For now, we'll assume React is available globally
declare global {
  namespace React {
    // React types would go here if needed
  }
}