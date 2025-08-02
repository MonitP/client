import { API_URLS } from '../consts/api_urls';
import { Notifications } from '../types/notification';
import { ServerStatus } from '../types/server';

const API_BASE_URL = process.env.REACT_APP_SERVER_URL;

export const api = {
  post: async <T>(url: string, data: unknown = {}): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('API 호출 실패');
    return response.json();
  },

  get: async <T>(url: string): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${url}`);
    if (!response.ok) throw new Error('API 호출 실패');
    return response.json();
  },

  delete: async (url: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}${url}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('API 호출 실패');
  },

  put: async <T>(url: string, data: unknown): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('API 호출 실패');
    return response.json();
  },
};

export const serverApi = {
  add: (data: unknown) => api.post(`${API_URLS.servers.base}${API_URLS.servers.create}`, data),
  getAllData: async (): Promise<ServerStatus[]> => {
    const res = await api.get<{ statusCode: number; message: string; data: ServerStatus[] }>(
      `${API_URLS.servers.base}`
    );
    return res.data;
  },
  delete: (id: string) => api.delete(`${API_URLS.servers.base}/${id}`),
  update: (id: string, data: unknown) => api.put(`${API_URLS.servers.base}/${id}`, data),
  deleteProcess: (code: string, processName: string) => 
    api.delete(`${API_URLS.servers.base}/${code}/processes/${processName}`),
};

export const notificationApi = {
  getAllNotifications: async (): Promise<Notifications[]> => {
    const res = await api.get<{ statusCode: number; message: string; data: Notifications[] }>(
      `${API_URLS.notification.base}`
    );
    return res.data;
  },
  readNotification: (id: number) => api.post(`${API_URLS.notification.base}/${id}/read`),
  readAllNotification: () => api.post(`${API_URLS.notification.base}/read-all`),
  deleteNotification: (id: number) => api.delete(`${API_URLS.notification.base}/${id}`),
  deleteAllNotifications: () => api.delete(`${API_URLS.notification.base}`),
};

export const mailApi = {
  add: (email: string) => api.post(`${API_URLS.mail.base}`, { email }),
  getAll: async () => {
    const res = await api.get<{ statusCode: number; message: string; data: any[] }>(
      `${API_URLS.mail.base}`
    );
    return res.data;
  },
  delete: (id: number) => api.delete(`${API_URLS.mail.base}/${id}`),
};

export const contaminationApi = {
  getAll: async () => {
    const res = await api.get<{ success: boolean; data: any[] }>(
      `${API_URLS.servers.base}/contamination`
    );
    return res.data;
  },
  getByServer: (serverCode: string) => 
    api.get<{ success: boolean; data: any[] }>(
      `${API_URLS.servers.base}/contamination/${serverCode}`
    ),
};