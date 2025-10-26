import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  setServers: () => { },
  addServer: () => { },
  refreshServers: async () => { }
};

const ServerContext = createContext<ServerContextType>(defaultContextValue);

export const ServerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [servers, setServers] = useState<ServerStatus[]>([]);

  const refreshServers = useCallback(async () => {
    try {
      const response = await serverApi.getAllData();
      setServers(response);
    } catch (error) {
      console.error('서버 목록 조회 실패:', error);
    }
  }, []);

  useEffect(() => {
    refreshServers();
    
    if (!socketService) return;

    const handleServerStats = (data: ServerStatus[]) => {
      setServers(prevServers => {
        const updatedMap = new Map(data.map(s => [s.code, s]));
        
        return prevServers.map(server => {
          const updated = updatedMap.get(server.code);
          if (updated) {
            return {
              ...server,
              ...updated,
              isNoServer: server.isNoServer // isNoServer 상태만 보존
            };
          }
          return server;
        });
      });
    };

    socketService.onServerStats(handleServerStats);

    return () => {
      if (socketService) {
        socketService.offServerStats(handleServerStats);
      }
    };
  }, [socketService, refreshServers]);

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