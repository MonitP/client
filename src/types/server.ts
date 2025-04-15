export interface ProcessStatus {
  id: string;
  name: string;
  status: 'running' | 'stopped';
}

export interface ServerStatus {
  id: string;
  name: string;
  ip: string;
  port: number;
  status: 'connected' | 'disconnected' | 'error';
  cpu: number;
  memory: number;
  disk: number;
  processes: ProcessStatus[];
  lastUpdate: Date;
  cpuHistory: number[];
  memoryHistory: number[];
  lastChecked?: string;
  error?: string;
}

export interface Server {
  id: string;
  name: string;
  ip: string;
  port: string;
  lastChecked: string;
}

export interface AddServerRequest {
  name: string;
  ip: string;
  port: string;
}

export interface AddServerResponse {
  id: string;
  name: string;
  ip: string;
  port: string;
} 