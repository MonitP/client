import React, { useRef, useEffect } from 'react';
import { getString } from '../../../consts/strings';
import { ServerStatus } from '../../../types/server';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { COLORS } from '../../../consts/colors';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { IMAGES } from '../../../consts/images';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DetailServerDialogProps {
  server: ServerStatus;
  onClose: () => void;
  onDeleteProcess?: (processName: string) => void;
}

const DetailServerDialog: React.FC<DetailServerDialogProps> = ({ server, onClose, onDeleteProcess }) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const outsideClick = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', outsideClick);
    return () => {
      document.removeEventListener('mousedown', outsideClick);
    };
  }, [onClose]);

  useEffect(() => {
    console.log('DetailServerDialog 마운트됨:', server);
    console.log('프로세스 정보:', server.processes);
    console.log('서버 시간 정보:', {
      upTime: server.upTime,
      downTime: server.downTime,
      status: server.status
    });
  }, [server]);

  const getProgressColor = (value: number) => {
    if (value >= 80) return '#EF4444'; // red-500
    if (value >= 60) return '#F59E0B'; // amber-500
    return '#10B981'; // emerald-500
  };

  const formatTime = (minutes: number) => {
    const days = Math.floor(minutes / (24 * 60));
    const hours = Math.floor((minutes % (24 * 60)) / 60);
    const mins = minutes % 60;
    
    if (days > 0) {
      return `${days}일 ${hours}시간 ${mins}분`;
    } else if (hours > 0) {
      return `${hours}시간 ${mins}분`;
    } else {
      return `${mins}분`;
    }
  };

  const formatDateTime = (date: Date | string | number) => {
    const d = new Date(date);
    return d.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const closeDialog = () => {
    onClose();
  };

  const handleDeleteProcess = (processName: string) => {
    if (onDeleteProcess) {
      onDeleteProcess(processName);
    }
  };

  const saveConfig = async (processName: string) => {
    try {
      const response = await fetch(`http://${server.ip}:${server.port}/download/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          process_name: processName,
          ip: server.ip
        }),
      });
  
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "다운로드 실패");
      }
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${processName}_config.js`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(`설정 파일 다운로드 중 오류 발생: ${(error as Error).message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div ref={dialogRef} className="bg-white rounded-lg w-[1200px] max-h-[80vh] overflow-y-auto">
        {/* 다이얼로그 헤더 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">{server.name}</h2>
              <span className="text-sm text-gray-500">{server.ip}</span>
            </div>
            <button 
              onClick={closeDialog}
              className="text-gray-500 hover:text-gray-700"
            >
              <img src={IMAGES.close} alt="닫기" className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 다이얼로그 컨텐츠 */}
        <div className="p-6">
          {/* 상태 정보 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">{getString('server.detail.status')}</h3>
            <div className="grid grid-cols-4 gap-4">
              {/* 서버 상태 카드 */}
              <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-gray-600">{getString('server.detail.status')}</div>
                  <div className={`w-2 h-2 rounded-full ${server.status === 'connected' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                </div>
                <div className="text-xl font-medium text-gray-900 mb-1">{getString(`server.status.${server.status}`)}</div>
                <div className="text-xs text-gray-400">{getString('server.detail.lastUpdate')}: {new Date(server.lastUpdate).toLocaleString()}</div>
              </div>

              {/* 가동률 카드 */}
              <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-sm font-medium text-gray-600 mb-3">{getString('server.detail.availability')}</div>
                <div className="flex items-end space-x-2 mb-2">
                  <div className="text-xl font-medium text-gray-900">{server.availability?.toFixed(1) || 0}%</div>
                  <div className="text-xs text-gray-400 mb-1">{getString('server.detail.monthly')}</div>
                </div>
                <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                    style={{ width: `${server.availability || 0}%` }}
                  ></div>
                </div>
              </div>

              {/* 가동 시간 카드 */}
              <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-sm font-medium text-gray-600 mb-3">{getString('server.detail.uptime')}</div>
                <div className="text-xl font-medium text-gray-900 mb-1">{formatTime(server.upTime || 0)}</div>
                <div className="text-xs text-gray-400">{getString('server.detail.startTime')} : {server.startTime ? new Date(server.startTime).toLocaleString() : '-'}</div>
              </div>

              {/* 다운타임 카드 */}
              <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-sm font-medium text-gray-600 mb-3">{getString('server.detail.downTime')}</div>
                <div className="text-xl font-medium text-gray-900 mb-1">{formatTime(server.downTime || 0)}</div>
                <div className="text-xs text-gray-400 space-y-1">
                  <div>{getString('server.detail.lastRestart')}: {server.lastRestart ? formatDateTime(server.lastRestart) : '-'}</div>
                  {server.status === 'disconnected' && (
                    <div>{getString('server.detail.disconnectedTime')} : {formatDateTime(server.lastUpdate)}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 프로세스 목록 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">{getString('server.detail.processes')}</h3>
            <div className="space-y-2">
              {server.processes
                .sort((a, b) => {
                  if (a.name === 'RSS') return -1;
                  if (b.name === 'RSS') return 1;
                  if (a.name === 'SCI') return -1;
                  if (b.name === 'SCI') return 1;
                  return a.name.localeCompare(b.name);
                })
                .map((process, index) => (
                <div key={`${server.id}-${process.name}-${index}`} 
                  className={`rounded-lg p-4 group transition-all duration-200 ${
                    process.status === 'running' 
                      ? 'bg-white border border-emerald-100 hover:border-emerald-200' 
                      : 'bg-white border border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`w-1.5 h-1.5 rounded-full mt-2 ${process.status === 'running' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`font-medium ${process.status === 'running' ? 'text-gray-900' : 'text-gray-600'}`}>
                            {process.name}
                          </span>
                          <span className="text-xs text-gray-400">{process.version || '버전 없음'}</span>
                        </div>
                        {process.status === 'running' && (
                          <div className="mt-1">
                            <div className="text-xs text-gray-500">{getString('server.detail.runningTime')}: {formatTime(Number(process.runningTime) || 0)}</div>
                            <div className="text-xs text-gray-400">{getString('server.detail.startTime')}: {process.startTime ? new Date(process.startTime).toLocaleString() : '-'}</div>
                          </div>
                        )}
                        {process.status === 'stopped' && process.lastUpdate && (
                          <div className="mt-1">
                            <div className="text-xs text-gray-400">{getString('server.detail.disconnectedTime')} : {formatDateTime(process.lastUpdate)}</div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => saveConfig(process.name)}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-all"
                      >
                        <img src={IMAGES.save} alt="저장" className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProcess(process.name)}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-all"
                      >
                        <img src={IMAGES.close} alt="삭제" className="w-4 h-4" />
                      </button>
                      <span className={`text-xs font-medium ${process.status === 'running' ? 'text-emerald-600' : 'text-gray-400'}`}>
                        {getString(`server.process.${process.status}`)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 리소스 사용량 추이 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{getString('server.detail.history.title')}</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <Line
                data={{
                  labels: Array.from({ length: 24 }, (_, i) => `${i}시`),
                  datasets: [
                    {
                      label: getString('server.detail.history.cpu'),
                      data: server.cpuHistory || Array(24).fill(0),
                      borderColor: '#EF4444',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      tension: 0.4,
                    },
                    {
                      label: getString('server.detail.history.ram'),
                      data: server.ramHistory || Array(24).fill(0),
                      borderColor: '#3B82F6',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      tension: 0.4,
                    },
                    {
                      label: getString('server.detail.history.gpu'),
                      data: server.gpuHistory || Array(24).fill(0),
                      borderColor: '#10B981',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      tension: 0.4,
                    },
                    {
                      label: getString('server.detail.history.network'),
                      data: server.networkHistory || Array(24).fill(0),
                      borderColor: '#8B5CF6',
                      backgroundColor: 'rgba(139, 92, 246, 0.1)',
                      tension: 0.4,
                    },
                  ],                  
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      min: 0,
                      max: 100,
                      ticks: {
                        stepSize: 10
                      }
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailServerDialog; 