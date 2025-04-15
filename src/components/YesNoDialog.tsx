import React from 'react';
import { COLORS } from '../consts/colors';
import { getString } from '../consts/strings';

interface YesNoDialogProps {
  message: string;
  onYes: () => void;
  onNo: () => void;
}

const YesNoDialog: React.FC<YesNoDialogProps> = ({ message, onYes, onNo }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-auto min-w-[300px] mx-4">
        <p className="text-gray-800 mb-4">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onNo}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            {getString('dialog.cancel')}
          </button>
          <button
            onClick={onYes}
            className="px-4 py-2 text-sm text-white rounded hover:opacity-90 transition-colors whitespace-nowrap"
            style={{ backgroundColor: COLORS.main }}
          >
            {getString('dialog.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default YesNoDialog; 