import React, { createContext, useContext, useState, useEffect } from 'react';
import { ServerStatus } from '../types/server';
import { serverApi } from '../services/api';
import { socketService } from '../services/socket';

interface ServerContextType {
  servers: ServerStatus[];
  setServers: React.Dispatch<React.SetStateAction<ServerStatus[]>>;
  addServer: (newServer: ServerStatus) => void;
  refreshServers: () => Promise<void>;
}

const defaultContextValue: ServerContextType = {
  servers: [],
  setServers: () => {},
  addServer: () => {},
  refreshServers: async () => {}
};

const ServerContext = createContext<ServerContextType>(defaultContextValue);

export const ServerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [servers, setServers] = useState<ServerStatus[]>([]);

  const refreshServers = async () => {
    try {
      const data = await serverApi.getAllData();
      if (!Array.isArray(data)) {
        console.error('Invalid server data received:', data);
        setServers([]);
        return;
      }
      const updatedData = data.map(server => ({
        ...server,
        status: server.status || 'disconnected',
        cpuHistory: server.cpuHistory || [],
        ramHistory: server.ramHistory || [],
        processes: server.processes || [],
        upTime: server.upTime || 0,
        downTime: server.downTime || 0
      }));
      setServers(updatedData);
    } catch (error) {
      console.error('서버 데이터 불러오기 실패', error);
      setServers([]);
    }
  };

  useEffect(() => {
    refreshServers();

    socketService.connect();
    
    socketService.onServerStats((updatedServers) => {
      if (!Array.isArray(updatedServers)) {
        return;
      }

      setServers(prevServers => {
        const updatedMap = new Map(updatedServers.map(s => [s.code, s]));
    
        return prevServers.map(server => {
          const updated = updatedMap.get(server.code);
          if (updated) {
            const newServer = {
              ...server,
              ...updated,
              cpuHistory: server.cpuHistory || [],
              ramHistory: server.ramHistory || [],
              gpuHistory: server.gpuHistory || [],
              networkHistory: server.networkHistory || [],
              processes: updated.processes || [],
              status: updated.status as 'connected' | 'disconnected' | 'warning',
              upTime: updated.upTime,
              downTime: updated.downTime
            };
            
            return newServer;
          }
    
          return {
            ...server,
            status: 'disconnected' as const,
            processes: (server.processes || []).map(p => ({
              ...p,
              status: 'stopped' as const,
            })),
          };
        });
      });
    });
    
    return () => {
      socketService.offServerStats(() => {});
      socketService.disconnect();
    };
  }, []);

  const addServer = (newServer: ServerStatus) => {
    const serverWithStatus = {
      ...newServer,
      status: newServer.status || 'disconnected',
      cpuHistory: newServer.cpuHistory || [],
      ramHistory: newServer.ramHistory || [],
      processes: newServer.processes || []
    };
    setServers(prevServers => [...prevServers, serverWithStatus]);
  };

  return (
    <ServerContext.Provider value={{ servers, setServers, addServer, refreshServers }}>
      {children}
    </ServerContext.Provider>
  );
};

export const useServers = () => {
  const context = useContext(ServerContext);
  if (!context) {
    throw new Error('useServers must be used within a ServerProvider');
  }
  return context;
};