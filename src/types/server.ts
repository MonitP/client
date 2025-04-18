export interface ProcessStatus {
  id: string;
  name: string;
  version: string;
  status: 'running' | 'stopped';
}

export interface ServerStatus {
  id: string;
  name: string;
  code: string;
  ip: string;
  port: number;
  status: 'connected' | 'disconnected' | 'warning';
  cpu: number;
  ram: number;
  disk: number;
  gpu: number;
  processes: ProcessStatus[];
  lastUpdate: Date;
  cpuHistory: number[];
  ramHistory: number[];
  lastChecked?: string;
  error?: string;
}

export interface Server {
  id: string;
  name: string;
  code: string;
  ip: string;
  port: string;
  lastChecked: string;
}

export interface AddServerRequest {
  name: string;
  code: string;
  ip: string;
  port: string;
}