import React, { useState, useEffect } from 'react';
import { getString } from '../consts/strings';
import { IMAGES } from '../consts/images';
import Toast from '../components/Toast';
import { mailApi } from '../services/api';

interface Mail {
  id: number;
  email: string;
  createdAt: string;
  updatedAt: string;
}

const MailServicePage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [mails, setMails] = useState<Mail[]>([]);
  const [toastMessage, setToastMessage] = useState<{ text: string; id: number } | null>(null);

  useEffect(() => {
    loadMails();
  }, []);

  const loadMails = async () => {
    try {
      const mails = await mailApi.getAll();
      setMails(mails);
    } catch (error) {
      console.error('메일 목록 로드 실패:', error);
      setToastMessage({ text: getString('mail.load.error'), id: Date.now() });
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setToastMessage({ text: getString('mail.validation.required'), id: Date.now() });
      return;
    }

    if (!validateEmail(email)) {
      setToastMessage({ text: getString('mail.validation.invalid'), id: Date.now() });
      return;
    }

    try {
      await mailApi.add(email);
      setEmail('');
      setToastMessage({ text: getString('mail.add.success'), id: Date.now() });
      loadMails();
    } catch (error) {
      console.error('메일 등록 실패:', error);
      setToastMessage({ text: getString('mail.add.error'), id: Date.now() });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await mailApi.delete(id);
      loadMails();
    } catch (error) {
      console.error('메일 삭제 실패:', error);
      setToastMessage({ text: getString('mail.delete.error'), id: Date.now() });
    }
  };

  return (
    <div className="space-y-4">
      <Toast message={toastMessage} />
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          {getString('mail.page.title')}
        </h2>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {getString('mail.form.email.label')}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={getString('mail.form.email.placeholder')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {getString('mail.form.submit')}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {getString('mail.list.title')}
        </h3>
        {mails.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            {getString('mail.list.noEmails')}
          </div>
        ) : (
          <div className="space-y-2">
            {mails.map((mail) => (
              <div key={mail.id} className="flex justify-between items-center p-4 border rounded-lg">
                <span>{mail.email}</span>
                <button
                  onClick={() => handleDelete(mail.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  {getString('mail.list.delete')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MailServicePage; 