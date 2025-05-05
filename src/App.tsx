import React, { useState, useEffect } from 'react';
import { IMAGES } from './consts/images';
import CardGridPage from './pages/CardGridPage';
import ListViewPage from './pages/ServerListPage';
import HomePage from './pages/HomePage';
import { ServerProvider } from './contexts/ServerContext';
import { NotificationProvider, useNotifications } from './contexts/NotificationContext';
import { LogProvider, useLogs } from './contexts/LogContext';
import NotificationPage from './pages/NotificationPage';
import AddPage from './pages/AddPage';
import CommandPage from './pages/CommandPage';
import FilePage from './pages/FilePage';
import MailServicePage from './pages/MailServicePage';
import LogPage from './pages/LogPage';

const SIDEBAR_ICONS = [
  { icon: IMAGES.home, component: HomePage },
  { icon: IMAGES.cardGrid, component: CardGridPage },
  { icon: IMAGES.add, component: AddPage },
  { icon: IMAGES.listView, component: ListViewPage },
  { icon: IMAGES.notification, component: NotificationPage },
  { icon: IMAGES.command, component: CommandPage },
  { icon: IMAGES.file, component: FilePage },
  { icon: IMAGES.mail, component: MailServicePage },
  { icon: IMAGES.log, component: LogPage },
];

function Sidebar() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(0);
  const { notifications, isNew } = useNotifications();

  const CurrentPage = selectedIndex !== null ? SIDEBAR_ICONS[selectedIndex].component : null;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* 사이드바 */}
      <div className="w-20 bg-blue-600 flex-shrink-0">
        <div className="flex flex-col items-center py-4 space-y-4 h-full">
          {SIDEBAR_ICONS.map((item, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`p-3 rounded-lg transition-colors ${
                selectedIndex === index
                  ? 'bg-white/20 text-white'
                  : 'hover:bg-white/10 text-white'
              }`}
            >
              <img 
                src={index === 4 && isNew ? IMAGES.notificationEnabled : item.icon} 
                alt={`icon-${index}`} 
                className="w-6 h-6" 
              />
            </button>
          ))}
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-8">
          {CurrentPage && <CurrentPage />}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ServerProvider>
      <LogProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </LogProvider>
    </ServerProvider>
  );
}

function AppContent() {
  return <Sidebar />;
}

export default App;
