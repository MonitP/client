import React, { useState, useEffect } from 'react';
import { getString } from '../../consts/strings';
import detail from '../../assets/images/detail.svg';
import { Server } from '../../types/server';
import DetailServerDialog from './components/DetailServerDialog';

const dummyServers: Server[] = [
  {
    id: 1,
    name: 'Production Server',
    status: 'connected',
    cpu: 65,
    ram: 8.2,
    disk: 45,
    processes: [
      { id: 1, name: 'Web Server', status: 'running' },
      { id: 2, name: 'Database', status: 'running' },
      { id: 3, name: 'Cache Server', status: 'stopped' },
    ],
  },
  {
    id: 2,
    name: 'Development Server',
    status: 'connected',
    cpu: 32,
    ram: 4.5,
    disk: 78,
    processes: [
      { id: 1, name: 'Web Server', status: 'running' },
      { id: 2, name: 'Database', status: 'running' },
      { id: 3, name: 'Cache Server', status: 'running' },
    ],
  },
  {
    id: 3,
    name: 'Staging Server',
    status: 'disconnected',
    cpu: 0,
    ram: 0,
    disk: 0,
    processes: [
      { id: 1, name: 'Web Server', status: 'stopped' },
      { id: 2, name: 'Database', status: 'stopped' },
      { id: 3, name: 'Cache Server', status: 'stopped' },
    ],
  },
];

const CardGridPage: React.FC = () => {
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);

  const handleDetailClick = (server: Server, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('상세보기 클릭:', server);
    setSelectedServer(server);
  };

  const handleCloseDialog = () => {
    console.log('다이얼로그 닫기');
    setSelectedServer(null);
  };

  // selectedServer 상태 변경 시 로그
  useEffect(() => {
    console.log('selectedServer 상태 변경:', selectedServer);
  }, [selectedServer]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dummyServers.map((server) => (
          <div 
            key={server.id} 
            className="bg-white rounded-lg shadow-sm border border-gray-100 relative group hover:shadow-md transition-shadow duration-200"
          >
            {/* 호버 시 상세보기 아이콘 */}
            <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <div 
                className="w-10 h-8 bg-white rounded-md flex items-center justify-center cursor-pointer"
                onClick={(e) => handleDetailClick(server, e)}
              >
                <img src={detail} alt="상세보기" className="w-5 h-5" />
              </div>
            </div>

            {/* 서버 헤더 */}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">{server.name}</h3>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${server.status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm text-gray-500">
                    {getString(`server.status.${server.status}`)}
                  </span>
                </div>
              </div>
            </div>

            {/* 서버 리소스 사용량 */}
            <div className="px-4 pb-4">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">{getString('server.resources.cpu')}</span>
                  <span className="font-medium text-gray-700">{server.cpu}%</span>
                </div>
                <div className="w-px h-4 bg-gray-200" />
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">{getString('server.resources.ram')}</span>
                  <span className="font-medium text-gray-700">{server.ram}GB</span>
                </div>
                <div className="w-px h-4 bg-gray-200" />
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">{getString('server.resources.disk')}</span>
                  <span className="font-medium text-gray-700">{server.disk}%</span>
                </div>
              </div>
            </div>

            {/* 구분선 */}
            <div className="border-t border-gray-300" />

            {/* 프로세스 목록 */}
            <div className="p-4 space-y-3">
              {server.processes.map((process) => (
                <div key={process.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${process.status === 'running' ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm text-gray-700">{process.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {getString(`server.process.${process.status}`)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 상세 정보 다이얼로그 */}
      {selectedServer && (
        <DetailServerDialog 
          server={selectedServer} 
          onClose={handleCloseDialog} 
        />
      )}
    </>
  );
};

export default CardGridPage; 