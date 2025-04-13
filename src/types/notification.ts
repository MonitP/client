export interface Notification {
  id: string;
  type: 'cpu' | 'memory' | 'connection';
  serverId: string;
  serverName: string;
  message: string;
  timestamp: number;
  isRead: boolean;
} 