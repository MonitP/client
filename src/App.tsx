import React, { useState } from 'react';
import { IMAGES } from './consts/images';
import CardGridPage from './pages/CardGridPage';
import ListViewPage from './pages/ListViewPage';
import HomePage from './pages/HomePage';
import { ServerProvider } from './contexts/ServerContext';

const SIDEBAR_ICONS = [
  { icon: IMAGES.home, component: HomePage },
  { icon: IMAGES.cardGrid, component: CardGridPage },
  { icon: IMAGES.listView, component: ListViewPage },
];

function App() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(0);

  const CurrentPage = selectedIndex !== null ? SIDEBAR_ICONS[selectedIndex].component : null;

  return (
    <ServerProvider>
      <div className="flex h-screen bg-gray-100">
        <div className="w-20 bg-blue-600">
          <div className="flex flex-col items-center py-4 space-y-4">
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
                <img src={item.icon} alt={`icon-${index}`} className="w-6 h-6" />
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 p-8">
          {CurrentPage && <CurrentPage />}
        </div>
      </div>
    </ServerProvider>
  );
}

export default App;
