// Real-Time Service using Socket.IO
// Handles WebSocket connections for live updates

import { io, Socket } from 'socket.io-client';
import { logInfo, logError } from '@/lib/logger';
import { API_URL } from '@/lib/api-client';

type UpdateCallback = (data: any) => void;

class RealtimeService {
    private socket: Socket | null = null;
    private listeners: Map<string, Set<UpdateCallback>> = new Map();
    private userId: string | null = null;

    connect(userId: string) {
        if (this.socket?.connected && this.userId === userId) {
            return;
        }

        this.userId = userId;
        // API_URL imported from @/lib/api-client

        this.socket = io(API_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        // Join user-specific room
        this.socket.on('connect', () => {
            this.socket?.emit('join', userId);
        });

        // Handle real-time events
        this.socket.on('task:updated', (data) => {
            this.emit('task:updated', data);
        });

        this.socket.on('task:deleted', (data) => {
            this.emit('task:deleted', data);
        });

        this.socket.on('tasks:batch_updated', (data) => {
            this.emit('tasks:batch_updated', data);
        });

        this.socket.on('tasks:cleared', () => {
            this.emit('tasks:cleared', {});
        });

        this.socket.on('chat:updated', (data) => {
            this.emit('chat:updated', data);
        });

        this.socket.on('context:updated', (data) => {
            logInfo('Real-time: Context updated');
            this.emit('context:updated', data);
        });

        this.socket.on('report:created', (data) => {
            logInfo('Real-time: Report created');
            this.emit('report:created', data);
        });

        this.socket.on('disconnect', () => {
            logInfo('⚠️ Disconnected from real-time server');
        });

        this.socket.on('reconnect', (attemptNumber) => {
            logInfo(`✅ Reconnected after ${attemptNumber} attempts`);
        });

        this.socket.on('connect_error', (error) => {
            logError('Real-time connection error:', error.message);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.listeners.clear();
            logInfo('Disconnected from real-time service');
        }
    }

    // Subscribe to events
    on(event: string, callback: UpdateCallback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(callback);
    }

    // Unsubscribe from events
    off(event: string, callback: UpdateCallback) {
        const listeners = this.listeners.get(event);
        if (listeners) {
            listeners.delete(callback);
        }
    }

    // Emit to local listeners
    private emit(event: string, data: any) {
        const listeners = this.listeners.get(event);
        if (listeners) {
            listeners.forEach(callback => callback(data));
        }
    }

    isConnected(): boolean {
        return this.socket?.connected || false;
    }
}

export const realtimeService = new RealtimeService();
