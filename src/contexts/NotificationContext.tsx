import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { Notifications } from '../types/notification';
import { socketService } from '../services/socket';
import { notificationApi } from '../services/api';

interface NotificationContextType {
  notifications: Notifications[];
  setNotifications: (data: Notifications[]) => void;
  notificationRead: (id: number) => void;
  notificationAllRead: () => void;
  isNew: boolean;
  setIsNew: (value: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotificationsState] = useState<Notifications[]>([]);
  const [isNew, setIsNew] = useState<boolean>(false);

  const setNotifications = useCallback((data: Notifications[]) => {
    setNotificationsState(data);
  }, []);

  const notificationRead = useCallback((id: number) => {
    setNotificationsState(prev => {
      const updated = prev.map(n => (n.id === id ? { ...n, read: true } : n));
      const hasUnread = updated.some(n => !n.read);
      if (!hasUnread) setIsNew(false);
  
      return updated;
    });
  }, [setIsNew]);
  
  const notificationAllRead = useCallback(() => {
    setNotificationsState(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      setIsNew(false);
      return updated;
    });
  }, [setIsNew]);
  
  useEffect(() => {
    const handleNewNotification = () => {
      setIsNew(true);
    };

    socketService.on('notifications', handleNewNotification);

    return () => {
      socketService.off('notifications', handleNewNotification);
    };
  }, []);

  useEffect(() => {
    const fetchNotificationsOnce = async () => {
      try {
        const data = await notificationApi.getAllNotifications();
        setNotificationsState(data);
  
        const hasUnread = data.some(n => !n.read);
        setIsNew(hasUnread);
      } catch (err) {
      }
    };
  
    fetchNotificationsOnce();
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        setNotifications,
        notificationRead,
        notificationAllRead,
        isNew,
        setIsNew,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('NotificationProvider');
  return context;
};
