import { API_URLS } from '../consts/api_urls';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

export const api = {
  post: async <T>(url: string, data: unknown): Promise<T> => {
    console.log(`Calling URL: ${API_BASE_URL}${url}`); 
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('API 호출에 실패했습니다.');
    }

    return response.json();
  },
  get: async <T>(url: string): Promise<T> => {
    console.log(`Calling URL: ${API_BASE_URL}${url}`);
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('API 호출에 실패했습니다.');
    }

    return response.json();
  },
  delete: async (url: string): Promise<void> => {
    console.log(`Calling URL: ${API_BASE_URL}${url}`);
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('API 호출에 실패했습니다.');
    }
  },
  put: async <T>(url: string, data: unknown): Promise<T> => {
    console.log(`Calling URL: ${API_BASE_URL}${url}`);
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('API 호출에 실패했습니다.');
    }

    return response.json();
  },
};

export const serverApi = {
  add: (data: unknown) => api.post(`${API_URLS.servers.base}${API_URLS.servers.create}`, data),
  getAllData: () => api.get(`${API_URLS.servers.base}${API_URLS.servers.base}`),
  delete: (id: string) => api.delete(`${API_URLS.servers.base}/${id}`),
  update: (id: string, data: unknown) => api.put(`${API_URLS.servers.base}/${id}`, data),
}; 