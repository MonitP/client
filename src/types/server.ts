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
} 