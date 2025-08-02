import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ServerStatus } from '../types/server';
import { serverApi, contaminationApi } from '../services/api';
import { socketService } from '../services/socket';

interface ContaminationImage {
  serverCode: string;
  status: string;
  bucket: string;
  date: string;
  images: string[];
  detail?: any;
}

interface ServerContextType {
  servers: ServerStatus[];
  contaminationImages: ContaminationImage[];
  setServers: React.Dispatch<React.SetStateAction<ServerStatus[]>>;
  addServer: (newServer: ServerStatus) => void;
  refreshServers: () => Promise<void>;
}

const defaultContextValue: ServerContextType = {
  servers: [],
  contaminationImages: [],
  setServers: () => {},
  addServer: () => {},
  refreshServers: async () => {}
};

const ServerContext = createContext<ServerContextType>(defaultContextValue);

export const ServerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [servers, setServers] = useState<ServerStatus[]>([]);
  const [contaminationImages, setContaminationImages] = useState<ContaminationImage[]>([]);

  const refreshServers = useCallback(async () => {
    try {
      const response = await serverApi.getAllData();
      setServers(response);
    } catch (error) {
      console.error('서버 목록 조회 실패:', error);
    }
  }, []);

  const refreshContaminationData = useCallback(async () => {
    try {
        const response = await contaminationApi.getAll();
      
      const dataArray: any[] = response && typeof response === 'object' && 'data' in response 
        ? (response as any).data 
        : Array.isArray(response) ? response : [];
      
      const mappedImages = dataArray.map((item: any) => ({
        ...item,
        serverCode: item.serverCode,
        detail: null,
      }));
      
      const allContaminationData = [...mappedImages];
      
      for (const server of servers) {
        const serverCode = server.code;
        
        const today = new Date();
        for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          
          const year = date.getFullYear().toString().slice(-2);
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const day = date.getDate().toString().padStart(2, '0');
          const dateStr = `${year}${month}${day}`;
          
          for (const status of ['warning', 'critical']) {
            const existingData = allContaminationData.find(
              data => data.serverCode === serverCode && 
                     data.date === dateStr && 
                     data.status === status
            );
            
            if (!existingData) {
              allContaminationData.push({
                serverCode: serverCode,
                status: status,
                bucket: 'alert',
                date: dateStr,
                images: [],
                detail: null
              });
            }
          }
        }
      }
      
      setContaminationImages(allContaminationData);
    } catch (error) {
      console.error('오염도 데이터 조회 실패:', error);
      setContaminationImages([]);
    }
  }, []);

  useEffect(() => {
    refreshServers();
    refreshContaminationData();
  }, [refreshServers, refreshContaminationData]);

  useEffect(() => {
    if (!socketService) return;

    const handleContaminationImages = (data: any) => {
      setContaminationImages(prevImages => {
        const newImage = {
          serverCode: data.serverCode,
          status: data.status,
          bucket: data.bucket,
          date: data.date,
          images: data.images,
          detail: null,
        };

        const existingIndex = prevImages.findIndex(
          img => img.serverCode === data.serverCode && 
                 img.bucket === data.bucket && 
                 img.date === data.date && 
                 img.status === data.status
        );

        if (existingIndex !== -1) {
          const updatedImages = [...prevImages];
          updatedImages[existingIndex] = newImage;
          return updatedImages;
        } else {
          return [...prevImages, newImage];
        }
      });
    };

    socketService.onContaminationImages(handleContaminationImages);

    return () => {
      if (socketService) {
        socketService.offContaminationImages(handleContaminationImages);
      }
    };
  }, [socketService]);

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
    <ServerContext.Provider value={{ servers, contaminationImages, setServers, addServer, refreshServers }}>
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