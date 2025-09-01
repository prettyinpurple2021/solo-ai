import { CompetitorAlert } from '@/hooks/use-competitor-alerts';

export interface WebSocketMessage {
  type: 'competitor_alert' | 'alert_update' | 'connection_status' | 'ping' | 'pong';
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
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private heartbeatInterval: NodeJS.Timeout | null = null;
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
  }

  connect(userId: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    this.connectionStatus = 'connecting';
    this.notifyConnectionStatus();

    try {
      // In a real implementation, you would connect to your WebSocket server
      // For now, we'll simulate the connection
      const wsUrl = this.getWebSocketUrl(userId);
      
      // Simulate WebSocket connection
      console.log(`Connecting to WebSocket: ${wsUrl}`);
      
      // For development, we'll simulate a successful connection
      setTimeout(() => {
        this.connectionStatus = 'connected';
        this.reconnectAttempts = 0;
        this.notifyConnectionStatus();
        this.startHeartbeat();
        console.log('WebSocket connected (simulated)');
      }, 1000);

      // In a real implementation:
      // this.ws = new WebSocket(wsUrl);
      // this.setupEventListeners();
      
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.connectionStatus = 'error';
      this.notifyConnectionStatus();
      this.scheduleReconnect(userId);
    }
  }

  private getWebSocketUrl(userId: string): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/ws/notifications?userId=${userId}`;
  }

  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.connectionStatus = 'connected';
      this.reconnectAttempts = 0;
      this.notifyConnectionStatus();
      this.startHeartbeat();
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      this.connectionStatus = 'disconnected';
      this.notifyConnectionStatus();
      this.stopHeartbeat();
      
      // Attempt to reconnect unless it was a clean close
      if (event.code !== 1000) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.connectionStatus = 'error';
      this.notifyConnectionStatus();
    };
  }

  private handleMessage(message: WebSocketMessage): void {
    console.log('Received WebSocket message:', message);

    switch (message.type) {
      case 'competitor_alert':
        this.notifyListeners('competitor_alert', message);
        break;
      
      case 'alert_update':
        this.notifyListeners('alert_update', message);
        break;
      
      case 'ping':
        this.sendPong();
        break;
      
      case 'pong':
        // Heartbeat response received
        break;
      
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  private notifyListeners(type: string, message: WebSocketMessage): void {
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(message);
        } catch (error) {
          console.error('Error in WebSocket listener:', error);
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

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      this.sendPing();
    }, 30000); // Send ping every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private sendPing(): void {
    const message: WebSocketMessage = {
      type: 'ping',
      timestamp: new Date().toISOString(),
    };
    this.sendMessage(message);
  }

  private sendPong(): void {
    const message: WebSocketMessage = {
      type: 'pong',
      timestamp: new Date().toISOString(),
    };
    this.sendMessage(message);
  }

  private sendMessage(message: WebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  private scheduleReconnect(userId?: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

    console.log(`Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      if (userId) {
        this.connect(userId);
      }
    }, delay);
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
    
    // Simulate receiving the message after a short delay
    setTimeout(() => {
      this.handleMessage(message);
    }, 100);
  }

  // Simulate an alert update (for development/testing)
  simulateAlertUpdate(alertId: number, action: 'read' | 'archived' | 'updated', userId: string): void {
    const message: AlertUpdateMessage = {
      type: 'alert_update',
      data: { alertId, action, userId },
      timestamp: new Date().toISOString(),
    };
    
    setTimeout(() => {
      this.handleMessage(message);
    }, 100);
  }

  disconnect(): void {
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
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
  const React: any;
}