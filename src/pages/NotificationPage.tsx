import React, { useState, useMemo, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { getString } from '../consts/strings';
import { notificationApi } from '../services/api';
import {
  Notifications,
  NotificationLabels,
  NotificationColors,
  NotificationType,
} from '../types/notification';

const NotificationPage: React.FC = () => {
  const {
    notifications,
    notificationRead,
    notificationAllRead,
    setNotifications,
    setIsNew,
  } = useNotifications();
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const data = await notificationApi.getAllNotifications();
        setNotifications(data as Notifications[]);

        const hasUnread = data.some((n) => !n.read);
        setIsNew(hasUnread);
      } catch (err) {
        console.error('알림 데이터를 불러오는 데 실패했습니다.', err);
      }
    })();
  }, [setNotifications, setIsNew]);

  const filteredNotifications = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return notifications.filter((n) =>
      n.serverName.toLowerCase().includes(q) ||
      n.serverCode.toLowerCase().includes(q) ||
      NotificationLabels[n.type as NotificationType]?.toLowerCase().includes(q)
    );
  }, [notifications, searchQuery]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          {getString('notification.page.title')}
        </h2>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={getString('notification.page.searchPlaceholder')}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={notificationAllRead}
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            {getString('notification.page.markAllAsRead')}
          </button>
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          {getString('notification.page.noNotifications')}
        </div>
      ) : (
        filteredNotifications.map((n) => (
          <div
            key={n.id}
            className={`bg-white rounded-lg shadow p-6 ${
              !n.read ? 'border-l-4 border-blue-500' : ''
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {n.serverName} ({n.serverCode})
                  </h3>
                  <span className="text-sm text-gray-500">
                    {new Date(n.timestamp).toLocaleString()}
                  </span>
                </div>
                <p
                  className={`mt-1 ${
                    NotificationColors[n.type as NotificationType]
                  }`}
                >
                  {NotificationLabels[n.type as NotificationType] ??
                    `알 수 없는 알람 (${n.type})`}
                </p>
                {!n.read && (
                  <button
                    onClick={() => notificationRead(n.id)}
                    className="text-sm text-blue-500 hover:text-blue-700 mt-2"
                  >
                    {getString('notification.page.markAsRead')}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default NotificationPage;
