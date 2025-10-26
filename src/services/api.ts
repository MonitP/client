import { API_URLS } from '../consts/api_urls';
import { Notifications } from '../types/notification';
import { ServerStatus } from '../types/server';
import AWS from 'aws-sdk';

const API_BASE_URL = process.env.REACT_APP_SERVER_URL;

const MINIO_ENDPOINT = process.env.REACT_APP_MINIO_ENDPOINT;
const MINIO_PORT = process.env.REACT_APP_MINIO_PORT;
const MINIO_USE_SSL = process.env.REACT_APP_MINIO_USE_SSL === 'true';
const MINIO_ACCESS_KEY = process.env.REACT_APP_MINIO_ACCESS_KEY;
const MINIO_SECRET_KEY = process.env.REACT_APP_MINIO_SECRET_KEY;

const s3Client = new AWS.S3({
  accessKeyId: MINIO_ACCESS_KEY,
  secretAccessKey: MINIO_SECRET_KEY,
  endpoint: `${MINIO_USE_SSL ? 'https' : 'http'}://${MINIO_ENDPOINT}:${MINIO_PORT}`,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
});

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

export const minioDirectApi = {
  listObjects: async (bucket: string, prefix?: string) => {
    try {
      const params = {
        Bucket: bucket,
        ...(prefix && { Prefix: prefix }),
        MaxKeys: 1000,
      };

      const result = await s3Client.listObjectsV2(params).promise();

      const allObjects = [];

      if (result.Contents) {
        allObjects.push(...result.Contents.map(obj => ({
          name: obj.Key,
          size: obj.Size,
          lastModified: obj.LastModified,
          etag: obj.ETag,
          isFolder: obj.Key?.endsWith('/') || false,
        })));
      }

      return allObjects;
    } catch (error) {
      console.error('MinIO 직접 호출 실패:', error);
      throw error;
    }
  },

  getObject: async (bucket: string, key: string) => {
    try {
      const params = {
        Bucket: bucket,
        Key: key,
      };

      const result = await s3Client.getObject(params).promise();

      if (result.Body) {
        let content: string;

        if (result.Body instanceof ReadableStream) {
          const reader = result.Body.getReader();
          const chunks: Uint8Array[] = [];

          return new Promise((resolve, reject) => {
            function read() {
              reader.read().then(({ done, value }) => {
                if (done) {
                  const buffer = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
                  let offset = 0;
                  chunks.forEach(chunk => {
                    buffer.set(chunk, offset);
                    offset += chunk.length;
                  });
                  const content = new TextDecoder().decode(buffer);
                  try {
                    const jsonData = JSON.parse(content);
                    resolve(jsonData);
                  } catch (error) {
                    reject(error);
                  }
                } else {
                  chunks.push(value);
                  read();
                }
              }).catch(reject);
            }
            read();
          });
        } else if (result.Body instanceof ArrayBuffer) {
          content = new TextDecoder().decode(result.Body);
          return JSON.parse(content);
        } else if (typeof result.Body === 'string') {
          return JSON.parse(result.Body);
        } else {
          content = result.Body.toString('utf8');
          return JSON.parse(content);
        }
      }

      return null;
    } catch (error) {
      console.error('JSON 파일 읽기 실패:', error);
      throw error;
    }
  },

  // 이미지 presigned URL 생성
  getImageUrl: async (bucket: string, farm: string, date: string, alertType: string, image: string) => {
    try {
      const objectName = `${farm}/${date}/${alertType}/${image}.jpg`;
      
      const url = await s3Client.getSignedUrlPromise('getObject', {
        Bucket: bucket,
        Key: objectName,
        Expires: 300 // 5분 유효
      });
      
      return url;
    } catch (error) {
      console.error('이미지 URL 생성 실패:', error);
      throw error;
    }
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
  updateNoServerStatus: (id: string, isNoServer: boolean) => 
    api.put(`${API_URLS.servers.base}/${id}/no-server`, { isNoServer }),
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