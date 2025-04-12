import React, { useRef, useEffect } from 'react';
import { getString } from '../../../consts/strings';
import { Server } from '../../../types/server';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { COLORS } from '../../../consts/colors';

interface DetailServerDialogProps {
  server: Server;
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

  const getProgressColor = (value: number) => {
    if (value >= 80) return COLORS.red;
    if (value >= 60) return COLORS.amber;
    return COLORS.emerald;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div ref={dialogRef} className="bg-white rounded-lg w-[800px] max-h-[80vh] overflow-y-auto">
        {/* 다이얼로그 헤더 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-800">{server.name}</h2>
            <button 
              onClick={onClose}
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
                      textColor: COLORS.darkGray,
                      textSize: '24px',
                      trailColor: COLORS.gray,
                    })}
                  />
                </div>
                <div className="text-sm text-gray-500">{getString('server.resources.cpu')}</div>
              </div>

              {/* RAM 사용량 */}
              <div className="p-4 bg-gray-50 rounded-lg flex flex-col items-center">
                <div className="w-24 h-24 mb-2">
                  <CircularProgressbar
                    value={server.ram * 10}
                    text={`${server.ram}GB`}
                    styles={buildStyles({
                      pathColor: getProgressColor(server.ram * 10),
                      textColor: COLORS.darkGray,
                      textSize: '24px',
                      trailColor: COLORS.gray,
                    })}
                  />
                </div>
                <div className="text-sm text-gray-500">{getString('server.resources.ram')}</div>
              </div>

              {/* Disk 사용량 */}
              <div className="p-4 bg-gray-50 rounded-lg flex flex-col items-center">
                <div className="w-24 h-24 mb-2">
                  <CircularProgressbar
                    value={server.disk}
                    text={`${server.disk}%`}
                    styles={buildStyles({
                      pathColor: getProgressColor(server.disk),
                      textColor: COLORS.darkGray,
                      textSize: '24px',
                      trailColor: COLORS.gray,
                    })}
                  />
                </div>
                <div className="text-sm text-gray-500">{getString('server.resources.disk')}</div>
              </div>
            </div>
          </div>

          {/* 프로세스 목록 */}
          <div>
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
        </div>
      </div>
    </div>
  );
};

export default DetailServerDialog; 