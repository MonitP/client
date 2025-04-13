import { io, Socket } from 'socket.io-client';
import { ServerStatus } from '../types/server';

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private serverStatsCallback: ((servers: ServerStatus[]) => void) | null = null;
  private isConnecting: boolean = false;
  private eventHandlers: Map<string, Set<(...args: any[]) => void>> = new Map();

  private constructor() {
    // private constructor to enforce singleton
  }

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect() {
    if (this.socket?.connected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    this.socket = io('http://localhost:8000', {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnecting = false;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.isConnecting = false;
    });

    // Restore event handlers after reconnection
    this.eventHandlers.forEach((handlers, event) => {
      handlers.forEach(handler => {
        this.socket?.on(event, handler);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
    this.eventHandlers.clear();
  }

  onServerStats(callback: (servers: ServerStatus[]) => void) {
    this.serverStatsCallback = callback;
    if (!this.socket) {
      this.connect();
    }
    this.socket?.on('update', callback);
  }

  offServerStats(callback: (servers: ServerStatus[]) => void) {
    if (this.serverStatsCallback === callback) {
      this.serverStatsCallback = null;
      this.socket?.off('update', callback);
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (!this.socket) {
      this.connect();
    }

    // Store the event handler
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)?.add(callback);

    this.socket?.on(event, callback);
  }

  off(event: string, callback: (...args: any[]) => void) {
    this.socket?.off(event, callback);
    this.eventHandlers.get(event)?.delete(callback);
    if (this.eventHandlers.get(event)?.size === 0) {
      this.eventHandlers.delete(event);
    }
  }
}

export const socketService = SocketService.getInstance(); 