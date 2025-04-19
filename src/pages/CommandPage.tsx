import React, { useState, useEffect } from 'react';
import { getString } from '../consts/strings';
import { useServers } from '../contexts/ServerContext';
import { COLORS } from '../consts/colors';
import Toast from '../components/Toast';
import { socketService } from '../services/socket';

interface CommandResult {
  serverCode: string;
  serverName: string;
  command: string;
  result: string;
  timestamp: string;
}

const CommandPage: React.FC = () => {
  const { servers } = useServers();
  const [selectedServer, setSelectedServer] = useState<string>('');
  const [command, setCommand] = useState<string>('');
  const [commandHistory, setCommandHistory] = useState<CommandResult[]>([]);
  const [toastMessage, setToastMessage] = useState<{ text: string; id: number } | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  useEffect(() => {
    const handler = (data: { serverCode: string; result: string; command: string }) => {
      const server = servers.find(s => s.code === data.serverCode);
      if (server) {
        setCommandHistory(prev => [{
          serverCode: server.code,
          serverName: server.name,
          command: data.command,
          result: data.result,
          timestamp: new Date().toLocaleString(),
        }, ...prev]);
      }
      setIsExecuting(false);
    };

    socketService.off('command_show', handler);
    socketService.on('command_show', handler);

    return () => {
      socketService.off('command_show', handler);
    };
  }, [servers]);
  

  const handleCommandSubmit = async () => {
    if (!selectedServer || !command.trim()) {
      setToastMessage({ text: getString('command.error.empty'), id: Date.now() });
      return;
    }

    const server = servers.find(s => s.code === selectedServer);
    if (!server) {
      setToastMessage({ text: getString('command.error.serverNotFound'), id: Date.now() });
      return;
    }

    console.log('command_send : ', selectedServer, command.trim());

    setIsExecuting(true);
    socketService.sendCommand(selectedServer, command.trim());
    setCommand('');
  };

  return (
    <div className="space-y-6">
      <Toast message={toastMessage} />
      <h2 className="text-2xl font-semibold text-gray-800">{getString('command.title')}</h2>
      
      {/* 명령어 입력 섹션 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {getString('command.selectServer')}
            </label>
            <select
              value={selectedServer}
              onChange={(e) => setSelectedServer(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isExecuting}
            >
              <option value="">{getString('command.selectServerPlaceholder')}</option>
              {servers.map(server => (
                <option key={server.code} value={server.code}>
                  {server.name} ({server.ip}:{server.port})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {getString('command.commandInput')}
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder={getString('command.commandPlaceholder')}
                className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isExecuting}
              />
              <button
                onClick={handleCommandSubmit}
                className="px-4 py-2 text-white rounded-md hover:opacity-90 transition-colors disabled:opacity-50"
                style={{ backgroundColor: COLORS.main }}
                disabled={isExecuting}
              >
                {isExecuting ? '실행 중...' : getString('command.execute')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 명령어 실행 결과 섹션 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          {getString('command.history')}
        </h3>
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {commandHistory.map((item, index) => (
            <div key={index} className="border-b border-gray-200 pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-800">{item.serverName}</span>
                  <span className="text-sm text-gray-500">{item.timestamp}</span>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">$</span> {item.command}
                </div>
                <div className="text-sm text-gray-800 whitespace-pre-wrap">
                  {item.result}
                </div>
              </div>
            </div>
          ))}
          {commandHistory.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              {getString('command.noHistory')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPage;
