import React from 'react';
import { IMAGES } from '../consts/images';

const CardGridPage: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-4">
            <img src={IMAGES.cardGrid} alt={`card-${index}`} className="w-8 h-8" />
            <div>
              <h3 className="text-lg font-semibold">카드 {index + 1}</h3>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardGridPage; 