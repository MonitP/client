import React, { useState } from 'react';
import { getString } from '../consts/strings';

const AddPage: React.FC = () => {
  const [formData, setFormData] = useState({
    serverName: '',
    serverIp: '',
    port: '',
  });

  const [errors, setErrors] = useState({
    serverName: '',
    serverIp: '',
    port: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'serverIp') {
      const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
      if (koreanRegex.test(value)) {
        setErrors(prev => ({ ...prev, serverIp: getString('add.form.serverIp.error.korean') }));
        return;
      }
      setErrors(prev => ({ ...prev, serverIp: '' }));
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
      serverName: '',
      serverIp: '',
      port: ''
    };

    if (!formData.serverName) {
      newErrors.serverName = getString('add.form.required');
    }
    if (!formData.serverIp) {
      newErrors.serverIp = getString('add.form.required');
    }
    if (!formData.port) {
      newErrors.port = getString('add.form.required');
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => !error);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // TODO: API 호출 구현
      console.log('서버 정보:', formData);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">{getString('add.title')}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div>
          <label htmlFor="serverName" className="block text-sm font-medium text-gray-700 mb-1">
            {getString('add.form.serverName.label')}
          </label>
          <input
            type="text"
            id="serverName"
            name="serverName"
            value={formData.serverName}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.serverName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={getString('add.form.serverName.placeholder')}
          />
          {errors.serverName && (
            <p className="mt-1 text-sm text-red-500">{errors.serverName}</p>
          )}
        </div>

        <div>
          <label htmlFor="serverIp" className="block text-sm font-medium text-gray-700 mb-1">
            {getString('add.form.serverIp.label')}
          </label>
          <input
            type="text"
            id="serverIp"
            name="serverIp"
            value={formData.serverIp}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.serverIp ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={getString('add.form.serverIp.placeholder')}
          />
          {errors.serverIp && (
            <p className="mt-1 text-sm text-red-500">{errors.serverIp}</p>
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