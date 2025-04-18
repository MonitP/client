import React, { useEffect, useState } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { getString } from '../consts/strings';
import { serverApi } from '../services/api';
import { ServerStatus } from '../types/server';
import { useServers } from '../contexts/ServerContext';

const HomePage: React.FC = () => {
  const { servers } = useServers();

  const stats = {
    total: servers.length,
    connected: servers.filter(s => s.status === 'connected').length,
    disconnected: servers.filter(s => s.status === 'disconnected').length,
    avgCpu: servers.length > 0 ? servers.reduce((acc, s) => acc + (s.cpu || 0), 0) / servers.length : 0,
    avgRAM: servers.length > 0 ? servers.reduce((acc, s) => acc + (s.ram || 0), 0) / servers.length : 0,
    avgGpu: servers.length > 0 ? servers.reduce((acc, s) => acc + (s.gpu || 0), 0) / servers.length : 0,
    totalProcesses: servers.length > 0
    ? servers.reduce((acc, s) => acc + (s.processes?.length ?? 0), 0)
    : 0,
  runningProcesses: servers.length > 0
    ? servers.reduce(
        (acc, s) => acc + (s.processes?.filter(p => p.status === 'running').length ?? 0),
        0
      )
    : 0,
  };

  return (
    <div className="h-full overflow-auto pb-6">
      <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">{getString('home.title')}</h2>
        {/* 전체 시스템 상태 요약 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{getString('home.summary.totalServers')}</h3>
            <div className="text-3xl font-bold text-blue-600">{stats.total}{getString('home.summary.unit')}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{getString('home.summary.connectedServers')}</h3>
            <div className="text-3xl font-bold text-green-500">{stats.connected}{getString('home.summary.unit')}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{getString('home.summary.disconnectedServers')}</h3>
            <div className="text-3xl font-bold text-red-500">{stats.disconnected}{getString('home.summary.unit')}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{getString('home.summary.totalProcesses')}</h3>
            <div className="text-3xl font-bold text-purple-500">
              {stats.runningProcesses}/{stats.totalProcesses}
            </div>
          </div>
        </div>

        {/* 리소스 사용량 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">{getString('home.resources.title')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* CPU */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-32">
                <CircularProgressbar
                  value={stats.avgCpu}
                  text={`${stats.avgCpu.toFixed(1)}%`}
                  styles={buildStyles({
                    pathColor: stats.avgCpu > 80 ? '#EF4444' : '#10B981',
                    textColor: '#374151',
                  })}
                />
              </div>
              <div>
                <h4 className="text-lg font-medium text-gray-700">{getString('home.resources.avgCpu.title')}</h4>
                <p className="text-sm text-gray-500">{getString('home.resources.avgCpu.description')}</p>
              </div>
            </div>

            {/* RAM */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-32">
                <CircularProgressbar
                  value={stats.avgRAM}
                  text={`${stats.avgRAM.toFixed(1)}%`}
                  styles={buildStyles({
                    pathColor: stats.avgRAM > 80 ? '#EF4444' : '#10B981',
                    textColor: '#374151',
                  })}
                />
              </div>
              <div>
                <h4 className="text-lg font-medium text-gray-700">{getString('home.resources.avgRAM.title')}</h4>
                <p className="text-sm text-gray-500">{getString('home.resources.avgRAM.description')}</p>
              </div>
            </div>

            {/* GPU */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-32">
                <CircularProgressbar
                  value={stats.avgGpu}
                  text={`${stats.avgGpu.toFixed(1)}%`}
                  styles={buildStyles({
                    pathColor: stats.avgGpu > 80 ? '#EF4444' : '#10B981',
                    textColor: '#374151',
                  })}
                />
              </div>
              <div>
              <h4 className="text-lg font-medium text-gray-700">{getString('home.resources.avgGpu.title')}</h4>
              <p className="text-sm text-gray-500">{getString('home.resources.avgGpu.description')}</p>
              </div>
            </div>
          </div>
        </div>


        {/* 최근 문제 발생 서버 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">{getString('home.issues.title')}</h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {servers
              .filter(server => server.status === 'disconnected' || server.cpu > 80 || server.ram > 8192)
              .map(server => (
                <div key={server.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg">
                  <div className="flex items-center space-x-4 mb-2 md:mb-0">
                    <div className={`w-3 h-3 rounded-full ${server.status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div className="min-w-[150px]">
                      <h4 className="font-medium text-gray-800">{server.name}</h4>
                    </div>
                    <div className="flex space-x-4">
                      <p className="text-sm text-gray-500 whitespace-nowrap">
                        {getString('home.issues.stats.cpu')} : {server.cpu || 0}%
                      </p>
                      <p className="text-sm text-gray-500 whitespace-nowrap">
                        {getString('home.issues.stats.ram')} : {server.ram || 0}%
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 whitespace-nowrap">
                    {new Date(server.lastUpdate || Date.now()).toLocaleString()}
                  </div>
                </div>
              ))}
              {servers.filter(server => server.status === 'disconnected' || server.cpu > 80 || server.ram > 8192).length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  {getString('home.issues.noIssues')}
                </div>
              )}
          </div>
        </div>

        {/* 경고 발생 서버 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">{getString('home.warnings.title')}</h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {servers
              .filter(server => server.status === 'connected' && 
                ((server.cpu > 60 && server.cpu <= 80) || (server.ram > 6144 && server.ram <= 8192)))
              .map(server => (
                <div key={server.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg">
                  <div className="flex items-center space-x-4 mb-2 md:mb-0">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="min-w-[150px]">
                      <h4 className="font-medium text-gray-800">{server.name}</h4>
                    </div>
                    <div className="flex space-x-4">
                      <p className="text-sm text-gray-500 whitespace-nowrap">
                        {getString('home.issues.stats.cpu')} : {server.cpu}%
                      </p>
                      <p className="text-sm text-gray-500 whitespace-nowrap">
                      {getString('home.issues.stats.ram')} : {server.ram || 0}%
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 whitespace-nowrap">
                    {new Date(server.lastUpdate || Date.now()).toLocaleString()}
                  </div>
                </div>
              ))}
              {servers.filter(server => server.status === 'connected' && 
                ((server.cpu > 60 && server.cpu <= 80) || (server.ram > 6144 && server.ram <= 8192))).length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  {getString('home.warnings.noWarnings')}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 