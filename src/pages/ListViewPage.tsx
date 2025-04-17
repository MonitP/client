import React from 'react';
import { useServers } from '../contexts/ServerContext';
import { getColor } from '../consts/colors';

const ListViewPage: React.FC = () => {
  const { servers } = useServers();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">서버 목록</h2>

      <div className="w-full overflow-x-auto">
        <table className="min-w-full table-fixed border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 w-1/4 text-left text-sm font-semibold text-gray-700 border-b">서버명</th>
              <th className="px-4 py-2 w-1/3 text-left text-sm font-semibold text-gray-700 border-b">아이피</th>
              <th className="px-4 py-2 w-1/6 text-left text-sm font-semibold text-gray-700 border-b">포트</th>
              <th className="px-4 py-2 w-1/6 text-left text-sm font-semibold text-gray-700 border-b">상태</th>
            </tr>
          </thead>
          <tbody>
            {servers.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-500">
                  등록된 서버가 없습니다.
                </td>
              </tr>
            ) : (
              servers.map((server, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-800 border-b">{server.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-800 border-b">{server.ip}</td>
                  <td className="px-4 py-2 text-sm text-gray-800 border-b">{server.port}</td>
                  <td
                    className={`px-4 py-2 text-sm font-semibold border-b ${
                      server.status === 'connected'
                        ? getColor.text('emerald')
                        : server.status === 'warning'
                        ? getColor.text('amber')
                        : server.status === 'disconnected'
                        ? getColor.text('red')
                        : getColor.text('gray')
                    }`}
                  >
                    {server.status}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListViewPage;
