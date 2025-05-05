import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { socketService } from '../services/socket';
import axios from 'axios';
import { API_URLS } from '../consts/api_urls';
import { useServers } from './ServerContext';

interface ServerLog {
  serverCode: string;
  serverName: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
}

interface LogResponse {
  statusCode: number;
  message: string;
  data: {
    logs: ServerLog[];
    total: number;
  };
}

interface LogContextType {
  logs: ServerLog[];
  total: number;
  currentPage: number;
  pageSize: number;
  fetchLogs: (params: {
    serverCode?: string;
    page?: number;
    limit?: number;
    startDate?: Date;
    endDate?: Date;
    type?: string;
  }) => Promise<void>;
  setPage: (page: number) => void;
  isLoading: boolean;
  error: string | null;
}

const LogContext = createContext<LogContextType | undefined>(undefined);

export const LogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<ServerLog[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { servers } = useServers();
  const isFirstLoad = useRef(true);

  const fetchLogs = useCallback(async (params: {
    serverCode?: string;
    page?: number;
    limit?: number;
    startDate?: Date;
    endDate?: Date;
    type?: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get<LogResponse>(
        `${process.env.REACT_APP_SERVER_URL}${API_URLS.logs.base}`,
        { params }
      );
      
      if (response.data.statusCode === 200 && response.data.data?.logs) {
        const processedLogs = response.data.data.logs.map(log => ({
          ...log,
          timestamp: new Date(log.timestamp),
          serverName: servers.find(server => server.code === log.serverCode)?.name || 'Unknown Server'
        }));
        setLogs(processedLogs);
        setTotal(response.data.data.total);
      } else {
        setLogs([]);
        setTotal(0);
      }
    } catch (err) {
      console.error('로그 조회 실패:', err);
      setError('로그를 불러오는데 실패했습니다.');
      setLogs([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [servers]);

  const handleLog = useCallback((log: ServerLog) => {
    const server = servers.find(server => server.code === log.serverCode);
    const newLog = {
      ...log,
      timestamp: new Date(log.timestamp),
      serverName: server ? server.name : 'Unknown Server'
    };
    
    setLogs(prevLogs => {
      if (prevLogs.length === 0 || currentPage === 1) {
        const updatedLogs = [newLog, ...prevLogs];
        setTotal(prev => prev + 1);
        return updatedLogs;
      }
      return prevLogs;
    });
  }, [servers, currentPage]);

  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // 초기 로딩
  useEffect(() => {
    if (isFirstLoad.current) {
      fetchLogs({ page: 1, limit: pageSize });
      isFirstLoad.current = false;
    }
  }, [fetchLogs, pageSize]);

  // Socket.IO 이벤트 리스너
  useEffect(() => {
    socketService.off('server-log', handleLog);
    socketService.on('server-log', handleLog);

    return () => {
      socketService.off('server-log', handleLog);
    };
  }, [handleLog]);

  const contextValue = React.useMemo(() => ({
    logs,
    total,
    currentPage,
    pageSize,
    fetchLogs,
    setPage,
    isLoading,
    error
  }), [total, currentPage, pageSize, fetchLogs, setPage, isLoading, error]);

  return (
    <LogContext.Provider value={contextValue}>
      {children}
    </LogContext.Provider>
  );
};

export const useLogs = () => {
  const context = useContext(LogContext);
  if (!context) {
    throw new Error('useLogs must be used within a LogProvider');
  }
  return context;
}; 