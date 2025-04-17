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
      data.forEach((server, i) => {
        console.log(`Server ${i} - CPU History Length: ${server.cpuHistory.length}, RAM History: ${server.ramHistory}`);
      });
    } catch (error) {
    }
  };

  useEffect(() => {
    refreshServers();

    socketService.connect();
    
    socketService.onServerStats((updatedServers: ServerStatus[]) => {
      setServers(prevServers => {
        const updatedMap = new Map(updatedServers.map(s => [s.code, s]));
    
        const mergedServers = prevServers.map(server => {
          const updated = updatedMap.get(server.code);
          if (updated) {
            return {
              ...server,
              ...updated,
              cpuHistory: server.cpuHistory,
              ramHistory: server.ramHistory,
              status: updated.status as 'connected' | 'disconnected' | 'warning',
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
    
        return mergedServers;
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