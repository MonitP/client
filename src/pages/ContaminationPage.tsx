import React, { useEffect, useState } from 'react';
import { getString } from '../consts/strings';
import { useServers } from '../contexts/ServerContext';
import { minioDirectApi } from '../services/api';

interface StallData {
  [stallNumber: string]: number;    
}

interface StatusData {
  sidList?: string[];
  images?: string[];
  [sid: string]: StallData | string[] | string[] | undefined;
}

interface AlertData {
  serverCode: string;
  status: string;
  bucket: string;
  date: string;
  detail: string;
    [status: string]: StatusData | string;
}

const ContaminationPage: React.FC = () => {
  const { servers, refreshServers } = useServers();
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedSid, setSelectedSid] = useState<string | null>(null);
  const [selectedSidFilter, setSelectedSidFilter] = useState<string | null>(null);
  const [contaminationData, setContaminationData] = useState<AlertData[]>([]);
  const [imageUrls, setImageUrls] = useState<{[key: string]: string}>({});
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    refreshServers();
    loadMinioData();
  }, []);

  const today = new Date().toLocaleDateString('ko-KR', { 
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\. /g, '').replace('.', '');


  const getServersWithRecentData = () => {
    const todayServers = new Set<string>();
    const weekServers = new Set<string>();
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekAgoStr = oneWeekAgo.toLocaleDateString('ko-KR', { 
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\. /g, '').replace('.', '');
    
    contaminationData.forEach(item => {
      const serverCodeWithSuffix = item.serverCode + '-00';
      
      if (item.date === today) {
        todayServers.add(serverCodeWithSuffix);
      } else if (item.date >= oneWeekAgoStr && item.date < today) {
        weekServers.add(serverCodeWithSuffix);
      }
    });
    
    return { todayServers, weekServers };
  };

  const { todayServers, weekServers } = getServersWithRecentData();

  const loadMinioData = async () => {
    try {
      const allObjects = await minioDirectApi.listObjects('alert');

      const jsonFiles = allObjects.filter((obj: any) => {
        const path = obj.name;
        return path && path.endsWith('.json');
      });

      const jsonDataList: any[] = [];
      for (const jsonFile of jsonFiles) {
        try {
          const fileName = jsonFile.name;
          if (!fileName) continue;

          const jsonData = await minioDirectApi.getObject('alert', fileName);

          if (jsonData) {
            const pathParts = fileName.split('/');
            const serverCode = pathParts[0];
            const date = pathParts[1];

            jsonDataList.push({
              serverCode,
              date,
              data: jsonData,
              fileName: fileName
            });
          }
        } catch (error) {
          console.error(`JSON 파일 읽기 실패: ${jsonFile.name}`, error);
        }
      }

      const newContaminationData: AlertData[] = jsonDataList.map(item => {
        const alertData: AlertData = {
          serverCode: item.serverCode,
          status: '',
          bucket: 'alert',
          date: item.date,
          detail: '',
        };
        if (item.data.warning) {
          alertData.warning = item.data.warning;
        }
        if (item.data.critical) {
          alertData.critical = item.data.critical;
        }
        return alertData;
      });
      setContaminationData(newContaminationData);

    } catch (error) {
      console.error('MinIO 데이터 로드 실패:', error);
    }
  };

  useEffect(() => {
    if (servers.length > 0 && contaminationData.length > 0 && !selectedServer) {
      const availableServers = contaminationData.map(item => item.serverCode);
      if (availableServers.length > 0) {
        setSelectedServer(availableServers[0]);
      }
    } else if (servers.length > 0 && !selectedServer) {
      setSelectedServer(servers[0].code);
    }
  }, [servers, contaminationData, selectedServer]);

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

  const extractStallInfo = (fileName: string) => {
    const match = fileName.match(/DS-[A-Z0-9]+-(\d{3}-\d{3})-(\d+-\d+-\d+)/);
    if (!match) return null;

    const sid = match[1];
    const stall = match[2];

    return { sid, stall };
  };

  const getAvailableDates = () => {
    const dates = new Set<string>();
    contaminationData.forEach(item => {
      const itemServerCode = item.serverCode;
      const selectedServerCode = selectedServer?.replace(/-00$/, '');
      if (selectedServer === null || itemServerCode === selectedServerCode) {
        dates.add(item.date);
      }
    });
    const result = Array.from(dates).sort();
    return result;
  };

  const getAvailableSids = () => {
    const sids = new Set<string>();
    contaminationData.forEach(item => {
      const itemServerCode = item.serverCode;
      const selectedServerCode = selectedServer?.replace(/-00$/, '');
      if (selectedServer === null || itemServerCode === selectedServerCode) {
        if (selectedStatus === null || selectedStatus === 'warning' || selectedStatus === 'critical') {
          if (selectedSid === null || item.date === selectedSid) {
            const warningData = item.warning as any;
            const criticalData = item.critical as any;

            if (warningData && (selectedStatus === null || selectedStatus === 'warning')) {
              if (warningData.sidList) {
                warningData.sidList.forEach((sid: string) => sids.add(sid));
              } else {
                Object.keys(warningData).forEach(key => {
                  if (key !== 'sidList' && typeof warningData[key] === 'object') {
                    sids.add(key);
                  }
                });
              }
            }
            if (criticalData && (selectedStatus === null || selectedStatus === 'critical')) {
              if (criticalData.sidList) {
                criticalData.sidList.forEach((sid: string) => sids.add(sid));
              } else {
                Object.keys(criticalData).forEach(key => {
                  if (key !== 'sidList' && typeof criticalData[key] === 'object') {
                    sids.add(key);
                  }
                });
              }
            }
          }
        }
      }
    });
    const result = Array.from(sids).sort();
    return result;
  };

  const getAvailableImages = () => {
    const images: any[] = [];

    contaminationData.forEach(item => {
      const itemServerCode = item.serverCode;
      const selectedServerCode = selectedServer?.replace(/-00$/, '');

      if (selectedServer === null || itemServerCode === selectedServerCode) {
        if (selectedStatus === null || selectedStatus === 'warning' || selectedStatus === 'critical') {
          if (selectedSid === null || item.date === selectedSid) {
            const warningData = item.warning as any;
            const criticalData = item.critical as any;

            if (warningData && (selectedStatus === null || selectedStatus === 'warning')) {
              Object.keys(warningData).forEach(key => {
                if (key !== 'sidList' && typeof warningData[key] === 'object') {
                  if (selectedSidFilter !== null && key !== selectedSidFilter) {
                    return;
                  }
                  
                  const stallData = warningData[key];

                  Object.keys(stallData).forEach(stallId => {
                    const stallInfo = stallData[stallId];

                    if (stallInfo && stallInfo.image) {
                      images.push({
                        serverCode: item.serverCode,
                        status: 'warning',
                        bucket: item.bucket,
                        date: item.date,
                        sid: key,
                        stallId: stallId,
                        image: stallInfo.image,
                        count: stallInfo.count,
                        max: stallInfo.max,
                        path: `${item.serverCode}/${item.date}/warning/${stallInfo.image}.jpg`
                      });
                    }
                  });
                }
              });
            }
            if (criticalData && (selectedStatus === null || selectedStatus === 'critical')) {
              Object.keys(criticalData).forEach(key => {
                if (key !== 'sidList' && typeof criticalData[key] === 'object') {
                  if (selectedSidFilter !== null && key !== selectedSidFilter) {
                    return;
                  }
                  
                  const stallData = criticalData[key];

                  Object.keys(stallData).forEach(stallId => {
                    const stallInfo = stallData[stallId];

                    if (stallInfo && stallInfo.image) {
                      images.push({
                        serverCode: item.serverCode,
                        status: 'critical',
                        bucket: item.bucket,
                        date: item.date,
                        sid: key,
                        stallId: stallId,
                        image: stallInfo.image,
                        count: stallInfo.count,
                        max: stallInfo.max,
                        path: `${item.serverCode}/${item.date}/critical/${stallInfo.image}.jpg`
                      });
                    }
                  });
                }
              });
            }
          }
        }
      }
    });
    return images;
  };

  useEffect(() => {
    const generateUrls = async () => {
      const images = getAvailableImages();
      const newUrls: {[key: string]: string} = {};
      
      for (const imageData of images) {
        const key = `${imageData.serverCode}-${imageData.status}-${imageData.path}`;
        if (!imageUrls[key]) {
          try {
            const url = await minioDirectApi.getImageUrl(
              'alert',
              imageData.serverCode,
              imageData.date,
              imageData.status,
              imageData.image
            );
            newUrls[key] = url;
          } catch (error) {
            console.error('이미지 URL 생성 실패:', error);
            newUrls[key] = '';
          }
        }
      }
      
      if (Object.keys(newUrls).length > 0) {
        setImageUrls(prev => ({ ...prev, ...newUrls }));
      }
    };
    
    if (contaminationData.length > 0) {
      generateUrls();
    }
  }, [contaminationData, selectedServer, selectedStatus, selectedSid]);

  const getFilteredImages = () => {
    const allImages = getAvailableImages();
    const uniqueImages = allImages.filter((image, index, self) =>
      index === self.findIndex(img => img.path === image.path)
    );

    if (!searchQuery) return uniqueImages;

    return uniqueImages.filter(image => 
      image.stallId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const ImageComponent = React.useCallback(({ imageData, index }: { imageData: any; index: number }) => {
    const key = `${imageData.serverCode}-${imageData.status}-${imageData.path}`;
    const imageUrl = imageUrls[key] || '';
    const fileName = imageData.path.split('/').pop() || '';

    const handleImageClick = () => {
      setSelectedImage(imageData);
      setIsModalOpen(true);
    };

    if (!imageUrl) {
      return (
        <div
          key={`${key}-${index}`}
          className="aspect-square bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center"
        >
          <div className="text-gray-500">{getString('contamination.image.loading')}</div>
        </div>
      );
    }

    return (
      <div
        key={`${key}-${index}`}
        className="aspect-square bg-gray-100 rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors overflow-hidden relative cursor-pointer"
        onClick={handleImageClick}
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
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1">
                      <div className="text-center">
              <div className="font-medium">
                {imageData.status === 'warning' ? getString('contamination.status.warning') : getString('contamination.status.critical')}
              </div>
              <div>{getString('contamination.image.sid')} : {imageData.sid}</div>
              <div>{getString('contamination.image.stall')} : {imageData.stallId}</div>
              <div>{getString('contamination.image.occurrenceCount')} : {imageData.count}</div>
              <div>{getString('contamination.image.contaminationLevel')} : {imageData.max}%</div>
            </div>
        </div>
      </div>
    );
  }, [imageUrls]);

  const ImageModal = () => {
    if (!isModalOpen || !selectedImage) return null;

    const key = `${selectedImage.serverCode}-${selectedImage.status}-${selectedImage.path}`;
    const imageUrl = imageUrls[key] || '';

    const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        setIsModalOpen(false);
      }
    };

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
        onClick={handleBackdropClick}
      >
        <div className="bg-white rounded-lg max-w-6xl max-h-[90vh] flex overflow-hidden">
          <div className="flex-[2_2_0%] p-4">
            <div className="relative">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={selectedImage.path}
                  className="max-w-full max-h-[70vh] object-contain"
                />
              ) : (
                <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
                  <div className="text-gray-500">{getString('contamination.modal.loading')}</div>
                </div>
              )}
            </div>
          </div>
          
          <div className="w-64 bg-gray-50 p-6 border-l border-gray-200">
            <h3 className="text-xl font-bold mb-6 text-gray-800">{getString('contamination.modal.title')}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">{getString('contamination.modal.serverCode')}</label>
                <div className="text-lg font-semibold text-gray-800">{selectedImage.serverCode}</div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">{getString('contamination.modal.status')}</label>
                <div className={`text-lg font-semibold ${selectedImage.status === 'warning' ? 'text-yellow-600' : 'text-red-600'}`}>
                  {selectedImage.status === 'warning' ? getString('contamination.status.warning') : getString('contamination.status.critical')}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">{getString('contamination.modal.date')}</label>
                <div className="text-lg font-semibold text-gray-800">{selectedImage.date}</div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">{getString('contamination.modal.sid')}</label>
                <div className="text-lg font-semibold text-gray-800">{selectedImage.sid}</div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">{getString('contamination.modal.stallId')}</label>
                <div className="text-lg font-semibold text-gray-800">{selectedImage.stallId}</div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">{getString('contamination.modal.count')}</label>
                <div className="text-lg font-semibold text-gray-800">
                  {selectedImage.count}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">{getString('contamination.modal.maxContimination')}</label>
                <div className="text-lg font-semibold text-gray-800">
                  {selectedImage.max}%
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">{getString('contamination.modal.imageFileName')}</label>
                <div className="text-sm text-gray-600 break-all">{selectedImage.image}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full overflow-auto pb-6">
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">{getString('contamination.page.title')}</h2>

        {/* 서버 선택 */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-4">{getString('contamination.server.title')}</h3>
          <div className="flex flex-wrap gap-2">
            {servers.map(server => {
              const hasTodayData = todayServers.has(server.code);
              const hasWeekData = weekServers.has(server.code);
              
              return (
                <button
                  key={server.code}
                  onClick={() => setSelectedServer(server.code)}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                    selectedServer === server.code
                      ? 'bg-blue-500 text-white'
                      : hasTodayData
                        ? 'bg-red-200 text-red-800 border-2 border-red-400'
                        : hasWeekData
                          ? 'bg-orange-200 text-orange-800 border-2 border-orange-400'
                          : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  <span>{server.code}</span>
                  {hasTodayData && (
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  )}
                  {hasWeekData && !hasTodayData && (
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 상태 선택 */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3">{getString('contamination.status.title')}</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedStatus(null)}
              className={`px-4 py-2 rounded-lg ${selectedStatus === null
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
                }`}
            >
              {getString('contamination.status.allStatus')}
            </button>
            {(() => {
              const selectedServerCode = selectedServer?.replace(/-00$/, '');
              const selectedServerContamination = contaminationData.filter(img => img.serverCode === selectedServerCode);

              return ['warning', 'critical'].map(status => (
                <button
                  key={`${selectedServer}-${status}`}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${selectedStatus === status
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                    }`}
                >
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
                  <span>{getStatusText(status)}</span>
                </button>
              ));
            })()}
          </div>
        </div>

        {/* 날짜 선택 */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3">{getString('contamination.date.title')}</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSid(null)}
              className={`px-4 py-2 rounded-lg ${selectedSid === null
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
                }`}
            >
              {getString('contamination.date.allDates')}
            </button>
            {getAvailableDates().map(date => (
              <button
                key={date}
                onClick={() => setSelectedSid(date)}
                className={`px-4 py-2 rounded-lg ${selectedSid === date
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
                  }`}
              >
                {date}
              </button>
            ))}
          </div>
        </div>

        {/* 라인 선택 */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3">{getString('contamination.line.title')}</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSidFilter(null)}
              className={`px-4 py-2 rounded-lg ${
                selectedSidFilter === null
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {getString('contamination.line.allLines')}
            </button>
            {getAvailableSids().map(sid => (
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
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">{getString('contamination.gallery.title')}</h3>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={getString('contamination.gallery.searchPlaceholder')}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 w-32"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              )}
            </div>
          </div>
          {(() => {
            const filteredImages = getFilteredImages();
            
            if (filteredImages.length === 0) {
              return (
                <div className="text-center py-8">
                  <div className="text-gray-500">
                    {searchQuery ? getString('contamination.gallery.noSearchResults') : getString('contamination.gallery.noImages')}
                  </div>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                {filteredImages.map((imageData, index) => (
                  <ImageComponent key={index} imageData={imageData} index={index} />
                ))}
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
              <span className="font-medium">{getString('contamination.stats.totalImages')} :</span> {getFilteredImages().length}{getString('contamination.stats.unit.images')}
            </div>
          </div>
        </div>
      </div>
      <ImageModal />
    </div>
  );
};

export default ContaminationPage; 