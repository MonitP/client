import React, { useState } from 'react';
import { getString } from '../consts/strings';
import { useServers } from '../contexts/ServerContext';
import { serverApi } from '../services/api';
import { COLORS } from '../consts/colors';
import YesNoDialog from '../components/YesNoDialog';
import ServerEditDialog from '../components/ServerEditDialog';
import { ServerStatus } from '../types/server';
import Toast from '../components/Toast';

const ServerListPage: React.FC = () => {
  const { servers, refreshServers } = useServers();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<ServerStatus | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  const onYesClicked = async (id: string) => {
    setDeleteTargetId(id);
  };

  const onNoClicked = async () => {
    if (deleteTargetId) {
      try {
        await serverApi.delete(deleteTargetId);
        setToastMessage(getString('list.deleteSuccess'));
        await refreshServers();
      } catch (error) {
        console.error('서버 삭제 실패:', error);
      }
      setDeleteTargetId(null);
    }
  };

  const setDeleteId = () => {
    setDeleteTargetId(null);
  };

  const handleEdit = async (data: { name: string; ip: string; port: string }) => {
    if (editTarget) {
      try {
        await serverApi.update(editTarget.id, data);
        setToastMessage(getString('list.editSuccess'));
        await refreshServers();
      } catch (error) {
        console.error('서버 수정 실패:', error);
      }
    }
  };

  return (
    <div className="space-y-4">
      <Toast message={toastMessage} />
      {servers.map((server) => (
        <div key={server.id} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 w-full">
              <div className={`w-3 h-3 rounded-full ${
                server.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <div className="flex items-center w-full">
                <div className="w-1/3 px-4">
                  <h3 className="text-lg font-semibold truncate">{server.name}</h3>
                </div>
                <div className="w-1/3 px-4 border-l border-gray-200">
                  <span className="text-sm text-gray-500 truncate">{server.ip}</span>
                </div>
                <div className="w-1/3 px-4 border-l border-gray-200">
                  <span className="text-sm text-gray-500">{server.port}</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2 ml-4">
              <button
                onClick={() => setEditTarget(server)}
                className="px-3 py-1.5 text-sm text-white rounded hover:opacity-90 transition-colors whitespace-nowrap"
                style={{ backgroundColor: COLORS.main }}
              >
                {getString('list.edit')}
              </button>
              <button
                onClick={() => onYesClicked(server.id)}
                className="px-3 py-1.5 text-sm text-white rounded hover:opacity-90 transition-colors whitespace-nowrap"
                style={{ backgroundColor: COLORS.red }}
              >
                {getString('list.delete')}
              </button>
            </div>
          </div>
        </div>
      ))}
      {servers.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          {getString('home.issues.noIssues')}
        </div>
      )}
      {deleteTargetId && (
        <YesNoDialog
          message={getString('list.confirmDelete')}
          onYes={onNoClicked}
          onNo={setDeleteId}
        />
      )}
      {editTarget && (
        <ServerEditDialog
          server={editTarget}
          onClose={() => setEditTarget(null)}
          onSubmit={handleEdit}
        />
      )}
    </div>
  );
};

export default ServerListPage; 