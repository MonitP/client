import React, { useState } from 'react';
import { getString } from '../consts/strings';
import { AddServerRequest, ServerStatus } from '../types/server';
import { COLORS } from '../consts/colors';

interface ServerEditDialogProps {
  server?: ServerStatus;
  onClose: () => void;
  onSubmit: (data: AddServerRequest) => Promise<void>;
}

const ServerEditDialog: React.FC<ServerEditDialogProps> = ({ server, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<AddServerRequest>({
    name: server?.name || '',
    ip: server?.ip || '',
    port: server?.port?.toString() || '',
  });

  const [errors, setErrors] = useState({
    name: '',
    ip: '',
    port: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'ip') {
      const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
      if (koreanRegex.test(value)) {
        setErrors(prev => ({ ...prev, ip: getString('add.form.serverIp.error.korean') }));
        return;
      }
      setErrors(prev => ({ ...prev, ip: '' }));
    }
    
    if (name === 'port') {
      const numberRegex = /^[0-9]*$/;
      if (!numberRegex.test(value)) {
        setErrors(prev => ({ ...prev, port: getString('add.form.port.error.number') }));
        return;
      }
      setErrors(prev => ({ ...prev, port: '' }));
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {
      name: '',
      ip: '',
      port: ''
    };

    if (!formData.name) {
      newErrors.name = getString('add.form.required');
    }
    if (!formData.ip) {
      newErrors.ip = getString('add.form.required');
    }
    if (!formData.port) {
      newErrors.port = getString('add.form.required');
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => !error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await onSubmit(formData);
        onClose();
      } catch (error) {
        console.error('서버 수정 실패:', error);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-auto min-w-[400px] mx-4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">{getString('list.serverEdit')}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              {getString('add.form.serverName.label')}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={getString('add.form.serverName.placeholder')}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="ip" className="block text-sm font-medium text-gray-700 mb-1">
              {getString('add.form.serverIp.label')}
            </label>
            <input
              type="text"
              id="ip"
              name="ip"
              value={formData.ip}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.ip ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={getString('add.form.serverIp.placeholder')}
            />
            {errors.ip && (
              <p className="mt-1 text-sm text-red-500">{errors.ip}</p>
            )}
          </div>

          <div>
            <label htmlFor="port" className="block text-sm font-medium text-gray-700 mb-1">
              {getString('add.form.port.label')}
            </label>
            <input
              type="text"
              id="port"
              name="port"
              value={formData.port}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.port ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={getString('add.form.port.placeholder')}
            />
            {errors.port && (
              <p className="mt-1 text-sm text-red-500">{errors.port}</p>
            )}
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              {getString('dialog.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white rounded hover:opacity-90 transition-colors whitespace-nowrap"
              style={{ backgroundColor: COLORS.main }}
            >
              {getString('dialog.confirm')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServerEditDialog; 