// src/api/api-client.ts
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Get the API URL from environment variables
// export const API_URL = import.meta.env.VITE_BACKEND_URL || 'https://api.likes.io/api';
export const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5005/api';

// Create an Axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach authentication token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor for common error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const { response } = error;
    
    // Handle authentication errors
    if (response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Helper methods for API calls
export const apiGet = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await apiClient.get(url, config);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const apiPost = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await apiClient.post(url, data, config);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const apiPut = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await apiClient.put(url, data, config);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const apiDelete = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await apiClient.delete(url, config);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Error handling utility
const handleApiError = (error: any) => {
  if (axios.isAxiosError(error)) {
    const { response } = error;
    
    // Log detailed error for debugging
    console.error('API Error:', {
      status: response?.status,
      statusText: response?.statusText,
      data: response?.data,
      url: response?.config?.url
    });
  } else {
    console.error('Unexpected API error:', error);
  }
};

export default apiClient;