import { io, Socket } from 'socket.io-client';
import { ServerStatus } from '../types/server';

class SocketService {
  private socket: Socket | null = null;
  private serverStatsCallback: ((servers: ServerStatus[]) => void) | null = null;

  connect() {
    this.socket = io('http://localhost:8000');

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('update', (servers: ServerStatus[]) => {
      console.log('updated :', servers);
      if (this.serverStatsCallback) {
        this.serverStatsCallback(servers);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onServerStats(callback: (servers: ServerStatus[]) => void) {
    this.serverStatsCallback = callback;
  }

  offServerStats(callback: (servers: ServerStatus[]) => void) {
    if (this.serverStatsCallback === callback) {
      this.serverStatsCallback = null;
    }
  }
}

export const socketService = new SocketService(); 