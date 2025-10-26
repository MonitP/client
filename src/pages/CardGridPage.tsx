import React, { useEffect, useState } from 'react';
import { getString } from '../consts/strings';
import { IMAGES } from '../consts/images';
import { ServerStatus } from '../types/server';
import DetailServerDialog from './CardGridPage/components/DetailServerDialog';
import { useServers } from '../contexts/ServerContext';
import { socketService } from '../services/socket';
import { serverApi } from '../services/api';
import Toast from '../components/Toast';

const CardGridPage: React.FC = () => {
  const { servers = [], setServers } = useServers();
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; id: number } | null>(null);

  const selectedServer = servers.find((s) => s?.id?.toString() === selectedServerId);

  const refreshServers = async () => {
    try {
      const updatedServers = await serverApi.getAllData();
      setServers(updatedServers);
    } catch (error) {
      console.error('서버 목록 새로고침 실패:', error);
    }
  };

  useEffect(() => {
    socketService.onServerStats((updatedServers) => {
      setServers(prevServers => {
        const updatedMap = new Map(updatedServers.map(s => [s.code, s]));

        return prevServers.map(server => {
          const updated = updatedMap.get(server.code);
          if (updated) {
            return {
              ...server,
              ...updated,
              cpuHistory: server.cpuHistory,
              ramHistory: server.ramHistory,
              processes: updated.processes || server.processes,
              status: updated.status as 'connected' | 'disconnected' | 'warning',
              upTime: updated.upTime || server.upTime,
              downTime: updated.downTime || server.downTime,
              isNoServer: server.isNoServer // isNoServer 상태만 보존
            };
          }

          return {
            ...server,
            status: 'disconnected' as const,
            processes: server.processes.map(p => ({
              ...p,
              status: 'stopped' as const,
            })),
          };
        });
      });
    });

    return () => {
      socketService.offServerStats(() => {});
    };
  }, [setServers]);

  const onDetailClick = (server: ServerStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedServerId(server.id.toString());
    console.log('서버 상세 정보 열기:', server.cpuHistory, '   ', server.ramHistory);
  };

  const closeDialog = () => {
    setSelectedServerId(null);
    console.log('서버 상세 정보 닫기');
  };

  const deleteProcess = async (processName: string) => {
    if (selectedServer) {
      try {
        await serverApi.deleteProcess(selectedServer.code, processName);
        setServers(prevServers => 
          prevServers.map(server => {
            if (server.id === selectedServer.id) {
              return {
                ...server,
                processes: server.processes.filter(p => p.name !== processName)
              };
            }
            return server;
          })  
        );
        setToastMessage({ text: '프로세스가 삭제되었습니다.', id: Date.now() });
      } catch (error) {
        console.error('프로세스 삭제 실패:', error);
        setToastMessage({ text: '프로세스 삭제에 실패했습니다.', id: Date.now() });
      }
    }
  };

  return (
    <div className="w-full px-6">
      <Toast message={toastMessage} />
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        {getString('serverCard.title')}
      </h2>

      <div className="w-full max-w-[95vw] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servers.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">서버 없음</h3>
            <p className="text-sm text-gray-500">등록된 서버가 없습니다</p>
          </div>
        ) : servers.map((server) => (
          <div
            key={server.id}
            className="bg-white rounded-lg shadow-sm border border-gray-100 relative group hover:shadow-md transition-shadow duration-200"
          >
            <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <div
                className="w-10 h-8 bg-white rounded-md flex items-center justify-center cursor-pointer"
                onClick={(e) => onDetailClick(server, e)}
              >
                <img src={IMAGES.detail} alt="상세보기" className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">{server.name}</h3>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    server.isNoServer 
                      ? 'bg-gray-400' 
                      : (server.status === 'connected' ? 'bg-green-500' : 'bg-red-500')
                  }`} />
                  <span className="text-sm text-gray-500">
                    {server.isNoServer 
                      ? '서버 없음' 
                      : getString(`server.status.${server.status}`)
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="px-4 pb-4">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm">
                <div className="flex items-center space-x-0.5">
                  <span className="text-gray-500">{getString('server.resources.cpu')}</span>
                  <span className="font-medium text-gray-600">{server.cpu || 0}%</span>
                </div>
                <div className="w-[1px] h-3 bg-gray-200" />
                <div className="flex items-center space-x-0.5">
                  <span className="text-gray-500">{getString('server.resources.ram')}</span>
                  <span className="font-medium text-gray-600">{server.ram || 0}%</span>
                </div>
                <div className="w-[1px] h-3 bg-gray-200" />
                <div className="flex items-center space-x-0.5">
                  <span className="text-gray-500">{getString('server.resources.disk')}</span>
                  <span className="font-medium text-gray-600">{server.disk || 0}%</span>
                </div>
                <div className="w-[1px] h-3 bg-gray-200" />
                <div className="flex items-center space-x-0.5">
                  <span className="text-gray-500">{getString('server.resources.gpu')}</span>
                  <span className="font-medium text-gray-600">{server.gpu || 0}%</span>
                </div>
                <div className="w-[1px] h-3 bg-gray-200" />
                <div className="flex items-center space-x-0.5">
                  <span className="text-gray-500">{getString('server.resources.network')}</span>
                  <span className="font-medium text-gray-600">{server.network || 0}%</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            <div className="p-4 space-y-3">
              {server.processes
                .filter(process => process.name === 'RSS' || process.name === 'SCI' || process.name === 'AI-SERVER' || process.name.includes('DeepFeed'))
                .map((process, index) => (
                  <div key={`${server.id}-${process.name}-${index}`} className="flex items-center justify-between">
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

      {selectedServer && (
        <DetailServerDialog 
          server={selectedServer}
          onClose={closeDialog}
          onDeleteProcess={deleteProcess}
          onServerUpdated={refreshServers}
        />
      )}
    </div>
  );
};

export default CardGridPage;
