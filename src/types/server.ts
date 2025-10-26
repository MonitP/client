export interface ProcessStatus {
  id: string;
  name: string;
  version: string;
  status: 'running' | 'stopped';
  lastUpdate: string;
  startTime?: string;
  runningTime?: string;
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
  network: number;
  processes: ProcessStatus[];
  lastUpdate: string;
  cpuHistory: number[];
  ramHistory: number[];
  gpuHistory: number[];
  networkHistory: number[];
  historyDate: string[];
  upTime: number;
  downTime: number;
  availability?: number;
  lastChecked?: string;
  startTime?: string;
  lastRestart?: string;
  isNoServer?: boolean;
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