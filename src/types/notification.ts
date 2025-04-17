export interface Notification {
  id: string;
  type: 'cpu' | 'ram' | 'connection';
  serverId: string;
  serverName: string;
  message: string;
  timestamp: number;
  isRead: boolean;
} 