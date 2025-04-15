import React, { useState } from 'react';
import { getString } from '../consts/strings';
import { serverApi } from '../services/api';
import { AddServerRequest, ServerStatus } from '../types/server';
import Toast from '../components/Toast';
import { useServers } from '../contexts/ServerContext';

const AddPage: React.FC = () => {
  const { addServer } = useServers();

  const [formData, setFormData] = useState<AddServerRequest>({
    name: '',
    code: '',
    ip: '',
    port: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    code: '',
    ip: '',
    port: ''
  });

  const [toastMessage, setToastMessage] = useState<{ text: string; id: number } | null>(null);
  
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
      code: '',
      ip: '',
      port: ''
    };

    if (!formData.name) {
      newErrors.name = getString('add.form.required');
    }
    if (!formData.code) {
      newErrors.code = getString('add.form.required');
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
        const newServer = await serverApi.add(formData) as ServerStatus;
        addServer(newServer);
        setToastMessage({ text: getString('add.form.success'), id: Date.now() });
        setFormData({ name: '', code: '', ip: '', port: '' });
      } catch (error) {
        console.error('서버 추가 실패:', error);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Toast message={toastMessage} />
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">{getString('add.title')}</h2>
      
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
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
            {getString('add.form.serverCode.label')}
          </label>
          <input
            type="text"
            id="code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.code ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={getString('add.form.serverCode.placeholder')}
          />
          {errors.code && (
            <p className="mt-1 text-sm text-red-500">{errors.code}</p>
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
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {getString('add.form.submit')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPage; 