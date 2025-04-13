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
}

const DetailServerDialog: React.FC<DetailServerDialogProps> = ({ server, onClose }) => {
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
  }, [server]);

  const getProgressColor = (value: number) => {
    if (value >= 80) return '#EF4444'; // red-500
    if (value >= 60) return '#F59E0B'; // amber-500
    return '#10B981'; // emerald-500
  };

  const closeDialog = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div ref={dialogRef} className="bg-white rounded-lg w-[800px] max-h-[80vh] overflow-y-auto">
        {/* 다이얼로그 헤더 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-800">{server.serverName}</h2>
            <button 
              onClick={closeDialog}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 다이얼로그 컨텐츠 */}
        <div className="p-6">
          {/* 상태 정보 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">{getString('server.detail.status')}</h3>
            <div className="flex items-center space-x-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${server.status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-gray-700">
                {getString(`server.status.${server.status}`)}
              </span>
            </div>
          </div>

          {/* 리소스 사용량 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">{getString('server.detail.resources')}</h3>
            <div className="grid grid-cols-3 gap-4">
              {/* CPU 사용량 */}
              <div className="p-4 bg-gray-50 rounded-lg flex flex-col items-center">
                <div className="w-24 h-24 mb-2">
                  <CircularProgressbar
                    value={server.cpu}
                    text={`${server.cpu}%`}
                    styles={buildStyles({
                      pathColor: getProgressColor(server.cpu),
                      textColor: '#374151',
                      textSize: '24px',
                      trailColor: '#E5E7EB',
                    })}
                  />
                </div>
                <div className="text-sm text-gray-500">{getString('server.resources.cpu')}</div>
              </div>

              {/* RAM 사용량 */}
              <div className="p-4 bg-gray-50 rounded-lg flex flex-col items-center">
                <div className="w-24 h-24 mb-2">
                  <CircularProgressbar
                    value={(server.memory / 1024) * 10}
                    text={`${(server.memory / 1024).toFixed(1)}GB`}
                    styles={buildStyles({
                      pathColor: getProgressColor((server.memory / 1024) * 10),
                      textColor: '#374151',
                      textSize: '24px',
                      trailColor: '#E5E7EB',
                    })}
                  />
                </div>
                <div className="text-sm text-gray-500">{getString('server.resources.memory')}</div>
              </div>

              {/* Disk 사용량 */}
              <div className="p-4 bg-gray-50 rounded-lg flex flex-col items-center">
                <div className="w-24 h-24 mb-2">
                  <CircularProgressbar
                    value={server.disk || 0}
                    text={`${server.disk || 0}%`}
                    styles={buildStyles({
                      pathColor: getProgressColor(server.disk || 0),
                      textColor: '#374151',
                      textSize: '24px',
                      trailColor: '#E5E7EB',
                    })}
                  />
                </div>
                <div className="text-sm text-gray-500">{getString('server.resources.disk')}</div>
              </div>
            </div>
          </div>

          {/* 프로세스 목록 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">{getString('server.detail.processes')}</h3>
            <div className="space-y-3">
              {server.processes.map((process) => (
                <div key={process.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${process.status === 'running' ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-gray-700">{process.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {getString(`server.process.${process.status}`)}
                  </span>
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
                      label: getString('server.detail.history.memory'),
                      data: (server.memoryHistory || Array(24).fill(0)).map(v => Number((v / 16384 * 100).toFixed(1))),
                      borderColor: '#3B82F6',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
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