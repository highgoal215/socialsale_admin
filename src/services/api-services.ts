// src/services/api-service.ts

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

// const API_URL = import.meta.env.VITE_BACKEND_URL || 'https://api.likes.io/api';
const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5005/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding the auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    if (error.response && error.response.status === 401) {
      // Handle expired token
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const ApiService = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.get(url, config)
      .then((response: AxiosResponse) => {
        // Return the response.data which contains what the API returned
        return response.data;
      })
      .catch(error => {
        console.error(`Error fetching ${url}:`, error);
        throw error;
      });
  },
  
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.post(url, data, config)
      .then((response: AxiosResponse) => {
        return response.data;
      })
      .catch(error => {
        console.error(`Error posting to ${url}:`, error);
        throw error;
      });
  },
  
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.put(url, data, config)
      .then((response: AxiosResponse) => {
        return response.data;
      })
      .catch(error => {
        console.error(`Error putting to ${url}:`, error);
        throw error;
      });
  },
  
  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.delete(url, config)
      .then((response: AxiosResponse) => {
        return response.data;
      })
      .catch(error => {
        console.error(`Error deleting ${url}:`, error);
        throw error;
      });
  }
};
export default ApiService;