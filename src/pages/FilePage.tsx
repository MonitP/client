import React, { useState } from 'react';
import { getString } from '../consts/strings';
import { COLORS } from '../consts/colors';
import { useServers } from '../contexts/ServerContext';
import Toast from '../components/Toast';

const FilePage: React.FC = () => {
  const { servers } = useServers();
  const [selectedServer, setSelectedServer] = useState<string>('');
  const [filePath, setFilePath] = useState<string>('');
  const [customFilename, setCustomFilename] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<{ text: string; id: number } | null>(null);

  const handleDownload = () => {
    if (!selectedServer || !filePath) {
      setToastMessage({ text: getString('file.error.required'), id: Date.now() });
      return;
    }

    const server = servers.find(s => s.code === selectedServer);
    if (!server) {
      setToastMessage({ text: getString('file.error.serverNotFound'), id: Date.now() });
      return;
    }

    const encodedPath = encodeURIComponent(filePath);
    const encodedFilename = customFilename ? `&filename=${encodeURIComponent(customFilename)}` : '';
    const fastApiUrl = `http://${server.ip}:${server.port}/download?path=${encodedPath}${encodedFilename}`;
    console.log("fastApiUrl", fastApiUrl);

    const link = document.createElement('a');
    link.href = fastApiUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage({ text: getString('file.success.download'), id: Date.now() });
  };

  return (
    <div className="space-y-4">
      <Toast message={toastMessage} />
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        {getString('file.page.title')}
      </h2>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {getString('file.form.server')}
            </label>
            <select
              value={selectedServer}
              onChange={(e) => setSelectedServer(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{getString('file.form.selectServer')}</option>
              {servers.map((server) => (
                <option key={server.code} value={server.code}>
                  {server.name} ({server.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {getString('file.form.filePath')}
            </label>
            <input
              type="text"
              value={filePath}
              onChange={(e) => setFilePath(e.target.value)}
              placeholder={getString('file.form.filePathPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {getString('file.form.saveAs')}
            </label>
            <input
              type="text"
              value={customFilename}
              onChange={(e) => setCustomFilename(e.target.value)}
              placeholder={getString('file.form.saveAsPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={handleDownload}
            className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
            style={{ backgroundColor: COLORS.main }}
          >
            {getString('file.form.download')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilePage;
