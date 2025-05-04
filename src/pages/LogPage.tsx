import React, { useState } from 'react';
import { getString } from '../consts/strings';
import { IMAGES } from '../consts/images';
import { COLORS } from '../consts/colors';
import { useServers } from '../contexts/ServerContext';
import Toast from '../components/Toast';

const LogPage: React.FC = () => {
  const { servers } = useServers();
  const [selectedServer, setSelectedServer] = useState<string>('');
  const [logs, setLogs] = useState<any[]>([]);
  const [toastMessage, setToastMessage] = useState<{ text: string; id: number } | null>(null);

  return (
    <div className="space-y-4">
      <Toast message={toastMessage} />
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        {getString('log.page.title')}
      </h2>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {getString('log.form.server')}
            </label>
            <select
              value={selectedServer}
              onChange={(e) => setSelectedServer(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{getString('log.filter.all')}</option>
              {servers.map((server) => (
                <option key={server.code} value={server.code}>
                  {server.name} ({server.code})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            {logs.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                {getString('log.list.noLogs')}
              </div>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">
                            {log.serverName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{log.message}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          log.type === 'error'
                            ? 'bg-red-100 text-red-800'
                            : log.type === 'warning'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {log.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogPage; 