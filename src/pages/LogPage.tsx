import React, { useState, useRef, useEffect, useMemo } from 'react';
import { getString } from '../consts/strings';
import { IMAGES } from '../consts/images';
import { COLORS } from '../consts/colors';
import { useServers } from '../contexts/ServerContext';
import { useLogs } from '../contexts/LogContext';
import Toast from '../components/Toast';

const LogPage: React.FC = () => {
  const { servers } = useServers();
  const { 
    logs = [], 
    total, 
    currentPage, 
    pageSize, 
    setPage, 
    isLoading, 
    error,
    selectedType,
    setSelectedType,
    searchQuery,
    setSearchQuery,
    selectedServer,
    setSelectedServer,
    fetchLogs
  } = useLogs();
  const [toastMessage, setToastMessage] = useState<{ text: string; id: number } | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1); // 검색 시 첫 페이지로 이동
  };

  const handleTypeChange = (type: string) => {
    console.log('타입 변경:', type);
    setSelectedType(type);
    fetchLogs({ 
      page: 1, 
      limit: pageSize,
      type: type,
      search: searchQuery,
      serverCode: selectedServer 
    });
  };

  const handleServerChange = (server: string) => {
    setSelectedServer(server);
    fetchLogs({ 
      page: 1, 
      limit: pageSize,
      type: selectedType,
      search: searchQuery,
      serverCode: server 
    });
  };

  const totalPages = Math.ceil(total / pageSize);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setPage(page);
    }
  };

  return (
    <div className="space-y-4">
      <Toast message={toastMessage} />
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          {getString('log.page.title')}
        </h2>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={getString('log.filter.searchPlaceholder')}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          />
          <select
            value={selectedServer}
            onChange={(e) => handleServerChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">{getString('log.filter.all')}</option>
            {servers.map((server) => (
              <option key={server.code} value={server.code}>
                {server.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            {getString('log.list.title')}
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">{getString('log.filter.type')} :</span>
            <select
              value={selectedType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">{getString('log.filter.all')}</option>
              <option value="error">{getString('log.type.error')}</option>
              <option value="warning">{getString('log.type.warning')}</option>
              <option value="info">{getString('log.type.info')}</option>
            </select>
          </div>
        </div>
        <div className="border-t border-gray-200">
          {isLoading ? (
            <div className="px-4 py-5 text-center text-gray-500">
              {getString('log.pagination.loading')}
            </div>
          ) : error ? (
            <div className="px-4 py-5 text-center text-red-500">
              {error}
            </div>
          ) : logs.length === 0 ? (
            <div className="px-4 py-5 text-center text-gray-500">
              {getString('log.list.noLogs')}
            </div>
          ) : (
            <>
              <div ref={logContainerRef} className="max-h-[600px] overflow-y-auto">
                <ul className="divide-y divide-gray-200">
                  {logs.map((log, index) => (
                    <li key={`${log.serverCode}-${log.timestamp.getTime()}-${index}`} className="px-4 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            log.type === 'error' ? 'bg-red-100 text-red-800' :
                            log.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {getString(`log.type.${log.type}`)}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {servers.find(server => server.code === log.serverCode)?.name || 'Unknown Server'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {log.timestamp.toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-700">
                        {log.message}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 페이지네이션 */}
              <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 sm:px-6 gap-4">
                <div className="text-sm text-gray-700 whitespace-nowrap">
                  {getString('log.pagination.total')
                    .replace('{total}', total.toString())
                    .replace('{start}', ((currentPage - 1) * pageSize + 1).toString())
                    .replace('{end}', Math.min(currentPage * pageSize, total).toString())}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {getString('log.pagination.prev')}
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        // 현재 페이지 주변 2페이지와 처음/끝 페이지만 표시
                        return page === 1 || 
                               page === totalPages || 
                               Math.abs(page - currentPage) <= 2;
                      })
                      .map((page, index, array) => {
                        // 페이지 번호 사이에 ... 표시
                        const showEllipsis = index > 0 && array[index - 1] !== page - 1;
                        return (
                          <React.Fragment key={page}>
                            {showEllipsis && (
                              <span className="px-2 text-gray-500">...</span>
                            )}
                            <button
                              onClick={() => handlePageChange(page)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === page
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        );
                      })}
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {getString('log.pagination.next')}
                    다음
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogPage; 