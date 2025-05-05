import React, { createContext, useContext, useState, useEffect } from 'react';
import { socketService } from '../services/socket';

interface ServerLog {
  serverCode: string;
  serverName: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
}

interface LogContextType {
  logs: ServerLog[];
  addLog: (log: ServerLog) => void;
}

const LogContext = createContext<LogContextType | undefined>(undefined);

export const LogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<ServerLog[]>([]);

  const addLog = (log: ServerLog) => {
    setLogs(prevLogs => [log, ...prevLogs]);
  };

  useEffect(() => {
    const handleLog = (log: ServerLog) => {
      console.log('로그 수신:', log);
      addLog(log);
    };

    socketService.onServerLog(handleLog);

    return () => {
      socketService.offServerLog(handleLog);
    };
  }, []);

  return (
    <LogContext.Provider value={{ logs, addLog }}>
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