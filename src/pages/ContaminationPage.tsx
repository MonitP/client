import React, { useState, useEffect } from 'react';
import { useServers } from '../contexts/ServerContext';
import { getString } from '../consts/strings';

// 실제 데이터 구조
interface StallData {
  [stallNumber: string]: number; // 스톨 번호: 스톨 수
}

interface StatusData {
  sidList?: string[];
  images?: string[];
  [sid: string]: StallData | string[] | string[] | undefined; // SID: 스톨 데이터 또는 sidList 또는 images
}

interface AlertData {
  serverCode: string;
  status: string;
  bucket: string;
  date: string;
  detail: string;
  [status: string]: StatusData | string; // warning, critical 등: 상태 데이터
}

const ContaminationPage: React.FC = () => {
  const { servers, contaminationImages, refreshServers } = useServers();
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedSid, setSelectedSid] = useState<string | null>(null);
  const [selectedSidFilter, setSelectedSidFilter] = useState<string | null>(null);

  // 페이지 로드 시 데이터 새로고침 (한 번만 실행)
  useEffect(() => {
    refreshServers();
  }, []); // refreshServers 의존성 제거

  // 첫 번째 서버를 기본으로 선택
  useEffect(() => {
    if (servers.length > 0 && !selectedServer) {
      setSelectedServer(servers[0].code);
    }
  }, [servers, selectedServer]);

  // 실제 contamination 이미지 데이터 사용
  const alertData: AlertData[] = contaminationImages.map(img => ({
    serverCode: img.serverCode,
    status: img.status,
    bucket: img.bucket,
    date: img.date,
    detail: `${img.date}.json`,
    [img.status]: {
      sidList: [], // 실제 SID 데이터는 별도로 처리 필요
      images: img.images
    }
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'warning': return getString('contamination.status.warning');
      case 'critical': return getString('contamination.status.critical');
      default: return status;
    }
  };

  // 이미지 파일명에서 SID와 스톨 정보 추출
  const extractStallInfo = (fileName: string) => {
    // 파일명 예시: DS-GG25110-001-005-1-3-16_1753822865175_236322300165.jpg
    // DS-GG25110-001-005까지가 SID, 1-3-16이 스톨 인덱스
    const match = fileName.match(/DS-[A-Z0-9]+-(\d{3}-\d{3})-(\d+-\d+-\d+)/);
    if (!match) return null;
    
    const sid = match[1]; // 001-005
    const stall = match[2]; // 1-3-16
    
    return { sid, stall };
  };

  const getAllSids = () => {
    const allSids = new Set<string>();
    
    const selectedServerImages = contaminationImages.filter(img => img.serverCode === selectedServer);
    
    selectedServerImages.forEach(img => {
      img.images.forEach((imagePath: any) => {
        const fileName = typeof imagePath === 'string' ? imagePath : imagePath.path;
        const stallInfo = extractStallInfo(fileName);
        if (stallInfo) {
          allSids.add(stallInfo.sid);
        }
      });
    });
    
    return Array.from(allSids).sort();
  };

  // 현재 선택된 서버의 contamination 이미지 데이터
  const currentContaminationData = contaminationImages.filter(img => 
    selectedServer === null || img.serverCode === selectedServer
  );

  return (
    <div className="h-full overflow-auto pb-6">
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">{getString('contamination.page.title')}</h2>
        
        {/* 서버 선택 */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3">{getString('contamination.server.title')}</h3>
          <div className="flex flex-wrap gap-2">
            {servers.map(server => {
              const hasContaminationData = contaminationImages.some(img => img.serverCode === server.code);
              return (
                <button 
                  key={server.code}
                  onClick={() => setSelectedServer(server.code)}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                    selectedServer === server.code 
                      ? 'bg-blue-500 text-white' 
                      : hasContaminationData 
                        ? 'bg-orange-200 text-orange-800 border-2 border-orange-400' 
                        : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  <span>{server.code}</span>
                  {hasContaminationData && (
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {selectedServer && (
          <>
            {/* 상태 선택 */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold mb-3">{getString('contamination.status.title')}</h3>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setSelectedStatus(null)}
                  className={`px-4 py-2 rounded-lg ${
                    selectedStatus === null 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {getString('contamination.status.allStatus')}
                </button>
                {(() => {
                  const selectedServerContamination = contaminationImages.filter(img => img.serverCode === selectedServer);
                  if (selectedServerContamination.length > 0) {
                    const uniqueStatuses = Array.from(new Set(selectedServerContamination.map(img => img.status)));
                    return uniqueStatuses.map(status => (
                      <button 
                        key={`${selectedServer}-${status}`}
                        onClick={() => setSelectedStatus(status)}
                        className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                          selectedStatus === status 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
                        <span>{getStatusText(status)}</span>
                      </button>
                    ));
                  } else {
                    return ['warning', 'critical'].map(status => (
                      <button 
                        key={`${selectedServer}-${status}`}
                        onClick={() => setSelectedStatus(status)}
                        className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                          selectedStatus === status 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
                        <span>{getStatusText(status)}</span>
                      </button>
                    ));
                  }
                })()}
              </div>
            </div>

                        {/* 날짜 선택 */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold mb-3">{getString('contamination.date.title')}</h3>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setSelectedSid(null)}
                  className={`px-4 py-2 rounded-lg ${
                    selectedSid === null 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {getString('contamination.date.allDates')}
                </button>
                {Array.from(new Set(currentContaminationData.map(img => img.date))).map(date => (
                  <button 
                    key={date}
                    onClick={() => setSelectedSid(date)}
                    className={`px-4 py-2 rounded-lg ${
                      selectedSid === date 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {date}
                  </button>
                ))}
              </div>
            </div>

                        {/* SID 선택 */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold mb-3">라인 선택</h3>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setSelectedSidFilter(null)}
                  className={`px-4 py-2 rounded-lg ${
                    selectedSidFilter === null 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  전체 라인
                </button>
                {getAllSids().map(sid => (
                  <button 
                    key={sid}
                    onClick={() => setSelectedSidFilter(sid)}
                    className={`px-4 py-2 rounded-lg ${
                      selectedSidFilter === sid 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {sid}
                  </button>
                ))}
              </div>
            </div>

            

            {/* 이미지 갤러리 */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold mb-4">{getString('contamination.gallery.title')}</h3>
              {(() => {
                const selectedServerContamination = contaminationImages.filter(img => 
                  (selectedServer === null || img.serverCode === selectedServer) &&
                  (selectedStatus === null || img.status === selectedStatus) &&
                  (selectedSid === null || img.date === selectedSid)
                );

                if (selectedServerContamination.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <div className="text-gray-500 text-lg">
                        {selectedServer 
                          ? getString('contamination.gallery.noData.withServer').replace('{server}', selectedServer)
                          : getString('contamination.gallery.noData.noServer')
                        }
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                    {(() => {
                      const allImages = selectedServerContamination.flatMap(img => 
                        img.images
                          .filter((imagePath: any) => {
                            const path = typeof imagePath === 'string' ? imagePath : imagePath.path;
                            return path.toLowerCase().endsWith('.jpg') || 
                                   path.toLowerCase().endsWith('.jpeg') || 
                                   path.toLowerCase().endsWith('.png') || 
                                   path.toLowerCase().endsWith('.gif');
                          })
                          .map((imagePath: any) => {
                            const imageData = typeof imagePath === 'string' ? { path: imagePath, url: null } : imagePath;
                            const fileName = imageData.path.split('/').pop() || '';
                            const stallInfo = extractStallInfo(fileName);
                            
                            return {
                              ...imageData,
                              serverCode: img.serverCode,
                              status: img.status,
                              bucket: img.bucket,
                              stallInfo
                            };
                          })
                          .filter(imageData => {
                            // SID 필터 적용
                            if (selectedSidFilter && imageData.stallInfo) {
                              return imageData.stallInfo.sid === selectedSidFilter;
                            }
                            return true;
                          })
                      );
                      
                      // 중복 제거 (같은 path를 가진 이미지는 하나만 표시)
                      const uniqueImages = allImages.filter((image, index, self) => 
                        index === self.findIndex(img => img.path === image.path)
                      );
                      
                      return uniqueImages.map((imageData, index) => {
                        const uniqueKey = `${imageData.serverCode}-${imageData.status}-${imageData.path}-${index}`;
                        const imageUrl = imageData.url || `/api/minio/${imageData.bucket}/${imageData.path}`;
                        const fileName = imageData.path.split('/').pop() || '';
                        
                        return (
                          <div 
                            key={uniqueKey} 
                            className="aspect-square bg-gray-100 rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors overflow-hidden relative"
                          >
                            <img 
                              src={imageUrl} 
                              alt={imageData.path}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.parentElement!.innerHTML = `
                                  <div class="w-full h-full flex flex-col items-center justify-center p-2">
                                    <div class="text-xs font-medium text-gray-700 text-center">${fileName}</div>
                                    <div class="text-xs text-gray-500 text-center">${getString('contamination.gallery.loadError')}</div>
                                  </div>
                                `;
                              }}
                            />
                            {imageData.stallInfo && (
                              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1">
                                <div className="text-center">
                                  <div>{imageData.stallInfo.sid}</div>
                                  <div>{getString('contamination.detail.stall')} {imageData.stallInfo.stall}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                );
              })()}
            </div>

              {/* 통계 정보 */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold mb-3">{getString('contamination.stats.title')}</h3>
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="font-medium">{getString('contamination.stats.selectedServer')} :</span> {selectedServer || getString('contamination.server.allServers')}
                </div>
                <div>
                  <span className="font-medium">{getString('contamination.stats.status')} :</span> {selectedStatus ? getStatusText(selectedStatus) : getString('contamination.status.allStatus')}
                </div>
                <div>
                  <span className="font-medium">{getString('contamination.stats.totalImages')} :</span> {
                    contaminationImages
                      .filter(img => selectedServer === null || img.serverCode === selectedServer)
                      .filter(img => selectedStatus === null || img.status === selectedStatus)
                      .filter(img => selectedSid === null || img.date === selectedSid)
                      .reduce((total, img) => total + img.images.length, 0)
                  }{getString('contamination.stats.unit.images')}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ContaminationPage; 