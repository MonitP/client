import React, { createContext, useContext, useState, useEffect } from 'react';
import { ServerStatus } from '../types/server';
import { socketService } from '../services/socket';

interface ServerContextType {
  servers: ServerStatus[];
}

const ServerContext = createContext<ServerContextType>({ servers: [] });

export const ServerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [servers, setServers] = useState<ServerStatus[]>([]);

  useEffect(() => {
    socketService.connect();

    const handleServerStats = (servers: ServerStatus[]) => {
      setServers(servers);
    };

    socketService.onServerStats(handleServerStats);

    return () => {
      socketService.offServerStats(handleServerStats);
      socketService.disconnect();
    };
  }, []);

  return (
    <ServerContext.Provider value={{ servers }}>
      {children}
    </ServerContext.Provider>
  );
};

export const useServers = () => useContext(ServerContext); 