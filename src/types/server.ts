export interface Process {
  id: number;
  name: string;
  status: 'running' | 'stopped';
}

export interface Server {
  id: number;
  name: string;
  status: 'connected' | 'disconnected';
  cpu: number;
  ram: number;
  disk: number;
  processes: Process[];
} 