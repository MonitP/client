import React from 'react';
import { IMAGES } from '../consts/images';

const ListViewPage: React.FC = () => {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-4">
            <img src={IMAGES.listView} alt={`list-${index}`} className="w-8 h-8" />
            <div>
              <h3 className="text-lg font-semibold">리스트 {index + 1}</h3>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListViewPage; 