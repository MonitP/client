import React, { useState } from 'react';
import { getString } from '../consts/strings';
import detail from '../assets/images/detail.svg';
import { ServerStatus } from '../types/server';
import DetailServerDialog from './CardGridPage/components/DetailServerDialog';
import { useServers } from '../contexts/ServerContext';

const CardGridPage: React.FC = () => {
  const { servers } = useServers();
  const [selectedServer, setSelectedServer] = useState<ServerStatus | null>(null);

  const onDetailClick = (server: ServerStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedServer(server);
    console.log('서버 상세 정보 열기:', server);
  };

  const closeDialog = () => {
    setSelectedServer(null);
    console.log('서버 상세 정보 닫기');
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servers.map((server) => (
          <div 
            key={server.serverId} 
            className="bg-white rounded-lg shadow-sm border border-gray-100 relative group hover:shadow-md transition-shadow duration-200"
          >
            {/* 호버 시 상세보기 아이콘 */}
            <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <div 
                className="w-10 h-8 bg-white rounded-md flex items-center justify-center cursor-pointer"
                onClick={(e) => onDetailClick(server, e)}
              >
                <img src={detail} alt="상세보기" className="w-5 h-5" />
              </div>
            </div>

            {/* 서버 헤더 */}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">{server.serverName}</h3>
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
                  <span className="text-gray-500">{getString('server.resources.memory')}</span>
                  <span className="font-medium text-gray-700">{(server.memory / 1024).toFixed(1)}GB</span>
                </div>
              </div>
            </div>

            {/* 구분선 */}
            <div className="border-t border-gray-100" />

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
          onClose={closeDialog}
        />
      )}
    </>
  );
};

export default CardGridPage; 