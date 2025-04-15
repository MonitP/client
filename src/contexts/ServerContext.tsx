import React, { createContext, useContext, useState, useEffect } from 'react';
import { ServerStatus } from '../types/server';
import { serverApi } from '../services/api';

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
      console.error('서버 데이터 가져오기 실패:', error);
    }
  };

  useEffect(() => {
    refreshServers();
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