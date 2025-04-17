export interface Notifications {
  id: number;
  serverCode: string;
  serverName: string;
  type: number;
  timestamp: string;
  read: boolean;
}

export enum NotificationType {
  CONNECTED = 0,
  DISCONNECTED = 1,
  HIGH_CPU = 2,
  HIGH_RAM = 3,
  HIGH_DISK = 4,
  HIGH_GPU = 5,
}

export const NotificationLabels: Record<NotificationType, string> = {
  [NotificationType.CONNECTED]: '서버 연결됨',
  [NotificationType.DISCONNECTED]: '서버 연결 끊김',
  [NotificationType.HIGH_CPU]: 'CPU 과다 사용',
  [NotificationType.HIGH_RAM]: 'RAM 과다 사용',
  [NotificationType.HIGH_DISK]: 'Disk 사용량 초과',
  [NotificationType.HIGH_GPU]: 'GPU 사용량 초과',
};

export const NotificationColors: Record<NotificationType, string> = {
  [NotificationType.CONNECTED]: 'text-green-500',
  [NotificationType.DISCONNECTED]: 'text-red-500',
  [NotificationType.HIGH_CPU]: 'text-orange-500',
  [NotificationType.HIGH_RAM]: 'text-blue-500',
  [NotificationType.HIGH_DISK]: 'text-yellow-600',
  [NotificationType.HIGH_GPU]: 'text-purple-500',
};