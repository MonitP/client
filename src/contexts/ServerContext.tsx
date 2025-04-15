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

const ServerContext = createContext<ServerContextType>({ 
  servers: [], 
  setServers: () => {}, 
  addServer: () => {},
  refreshServers: async () => {}
});

export const ServerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [servers, setServers] = useState<ServerStatus[]>([]);

  const refreshServers = async () => {
    try {
      const data = await serverApi.getAllData() as ServerStatus[];
      const updatedData = data.map(server => ({
        ...server,
        status: server.status || 'disconnected',
      }));
      setServers(updatedData);
    } catch (error) {
    }
  };

  useEffect(() => {
    refreshServers();

    socketService.connect();
    
    socketService.onServerStats((updatedServers: ServerStatus[]) => {

      setServers(prevServers => {
        const updated = prevServers.map(server => {
          const updatedServer = updatedServers.find(s => s.code === server.code);

          return updatedServer ? {
            ...server,
            ...updatedServer,
            status: updatedServer.status || 'disconnected',
          } : server;
        });

        return updated;
      });
    });

    // 컴포넌트 언마운트 시 정리
    return () => {
      socketService.offServerStats(() => {});
      socketService.disconnect();
    };
  }, []);

  const addServer = (newServer: ServerStatus) => {
    const serverWithStatus = {
      ...newServer,
      status: newServer.status || 'disconnected',
    };
    setServers(prevServers => [...prevServers, serverWithStatus]);
  };

  return (
    <ServerContext.Provider value={{ servers, setServers, addServer, refreshServers }}>
      {children}
    </ServerContext.Provider>
  );
};

export const useServers = () => useContext(ServerContext);