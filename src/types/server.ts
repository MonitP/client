export interface ProcessStatus {
  id: string;
  name: string;
  status: 'running' | 'stopped';
}

export interface ServerStatus {
  serverId: string;
  serverName: string;
  status: 'connected' | 'disconnected';
  cpu: number;
  memory: number;
  disk: number;
  processes: ProcessStatus[];
  lastUpdate: Date;
  cpuHistory: number[];
  memoryHistory: number[];
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