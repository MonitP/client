import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getString } from '../consts/strings';
import { Notification } from '../types/notification';
import { useServers } from './ServerContext';
import { socketService } from '../services/socket';
import { ServerStatus } from '../types/server';

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastCpuUsage, setLastCpuUsage] = useState<{ [key: string]: number }>({});
  const [lastMemoryUsage, setLastMemoryUsage] = useState<{ [key: string]: number }>({});
  const [lastConnectionStatus, setLastConnectionStatus] = useState<{ [key: string]: boolean }>({});
  const { servers } = useServers();
  const notificationIdCounterRef = useRef<number>(0);

  const generateNotificationId = useCallback(() => {
    notificationIdCounterRef.current += 1;
    return `${Date.now()}-${notificationIdCounterRef.current}`;
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: generateNotificationId(),
      isRead: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, [generateNotificationId]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prevNotifications => {
      const updatedNotifications = [...prevNotifications];
      const index = updatedNotifications.findIndex(notification => notification.id === id);
      if (index !== -1) {
        updatedNotifications[index] = { ...updatedNotifications[index], isRead: true };
      }
      return updatedNotifications;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // CPU 사용량 모니터링
  const handleCpuUsage = useCallback((serverName: string, usage: number) => {
    const lastUsage = lastCpuUsage[serverName] || 0;
    const isHighUsage = usage >= 60;
    const wasHighUsage = lastUsage >= 60;
    const server = servers.find(s => s.serverName === serverName);

    if (isHighUsage && !wasHighUsage) {
      addNotification({
        type: 'cpu',
        serverId: server?.serverId || '',
        serverName,
        message: `${getString('notification.types.cpu')} 사용량이 ${usage.toFixed(1)}%로 높습니다.`,
        timestamp: Date.now(),
      });
    } else if (!isHighUsage && wasHighUsage) {
      addNotification({
        type: 'cpu',
        serverId: server?.serverId || '',
        serverName,
        message: `${getString('notification.types.cpu')} 사용량이 ${usage.toFixed(1)}%로 정상화되었습니다.`,
        timestamp: Date.now(),
      });
    }

    setLastCpuUsage(prev => ({ ...prev, [serverName]: usage }));
  }, [addNotification, lastCpuUsage, servers]);

  // 메모리 사용량 모니터링
  const handleMemoryUsage = useCallback((serverName: string, usage: number) => {
    const lastUsage = lastMemoryUsage[serverName] || 0;
    const isHighUsage = usage >= 60;
    const wasHighUsage = lastUsage >= 60;
    const server = servers.find(s => s.serverName === serverName);

    if (isHighUsage && !wasHighUsage) {
      addNotification({
        type: 'memory',
        serverId: server?.serverId || '',
        serverName,
        message: `${getString('notification.types.memory')} 사용량이 ${usage.toFixed(1)}%로 높습니다.`,
        timestamp: Date.now(),
      });
    } else if (!isHighUsage && wasHighUsage) {
      addNotification({
        type: 'memory',
        serverId: server?.serverId || '',
        serverName,
        message: `${getString('notification.types.memory')} 사용량이 ${usage.toFixed(1)}%로 정상화되었습니다.`,
        timestamp: Date.now(),
      });
    }

    setLastMemoryUsage(prev => ({ ...prev, [serverName]: usage }));
  }, [addNotification, lastMemoryUsage, servers]);

  // 연결 상태 모니터링
  const handleConnectionStatus = useCallback((serverName: string, isConnected: boolean) => {
    const lastStatus = lastConnectionStatus[serverName];
    const server = servers.find(s => s.serverName === serverName);
    
    if (lastStatus === undefined || lastStatus !== isConnected) {
      addNotification({
        type: 'connection',
        serverId: server?.serverId || '',
        serverName,
        message: isConnected 
          ? `${getString('notification.types.connection')}가 복구되었습니다.`
          : `${getString('notification.types.connection')}가 끊어졌습니다.`,
        timestamp: Date.now(),
      });
    }

    setLastConnectionStatus(prev => ({ ...prev, [serverName]: isConnected }));
  }, [addNotification, lastConnectionStatus, servers]);

  useEffect(() => {
    const handleMetrics = (data: { serverName: string; cpu: number; memory: number }) => {
      handleCpuUsage(data.serverName, data.cpu);
      handleMemoryUsage(data.serverName, data.memory);
    };

    const handleConnection = (data: { serverName: string; status: boolean }) => {
      handleConnectionStatus(data.serverName, data.status);
    };

    const handleServerUpdate = (updatedServers: ServerStatus[]) => {
      updatedServers.forEach(server => {
        handleCpuUsage(server.serverName, server.cpu);
        handleMemoryUsage(server.serverName, server.memory);
        handleConnectionStatus(server.serverName, server.status === 'connected');
      });
    };

    socketService.on('metrics', handleMetrics);
    socketService.on('connection', handleConnection);
    socketService.onServerStats(handleServerUpdate);

    return () => {
      socketService.off('metrics', handleMetrics);
      socketService.off('connection', handleConnection);
      socketService.offServerStats(handleServerUpdate);
    };
  }, [handleCpuUsage, handleMemoryUsage, handleConnectionStatus]);

  useEffect(() => {
    return () => {
      window.addEventListener('beforeunload', () => {
        socketService.disconnect();
      });
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}; 