import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { getString } from '../consts/strings';

const NotificationPage: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setIsTyping(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setIsTyping(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'cpu':
        return 'text-red-500';
      case 'memory':
        return 'text-blue-500';
      case 'connection':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  const filteredNotifications = useMemo(() => {
    if (!debouncedQuery) return notifications;
    
    const query = debouncedQuery.toLowerCase();
    return notifications.filter(notification => 
      notification.serverName.toLowerCase().includes(query) ||
      notification.message.toLowerCase().includes(query)
    );
  }, [notifications, debouncedQuery]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">{getString('notification.page.title')}</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={getString('notification.page.searchPlaceholder')}
              className="px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setDebouncedQuery('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            {getString('notification.page.markAllAsRead')}
          </button>
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          {debouncedQuery ? getString('notification.page.noSearchResults') : getString('notification.page.noNotifications')}
        </div>
      ) : (
        filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`bg-white rounded-lg shadow p-6 ${
              !notification.isRead ? 'border-l-4 border-blue-500' : ''
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {notification.serverName}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {new Date(notification.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-600 mt-1">{notification.message}</p>
                {!notification.isRead && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification.id);
                    }}
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