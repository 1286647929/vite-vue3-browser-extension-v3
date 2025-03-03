import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios"

declare module 'axios' {
  interface AxiosRequestConfig {
    showLoading?: boolean;
    retryCount?: number;
  }
}

interface ResponseData<T = any> {
  code: number;
  message: string;
  data: T;
}

class HttpRequest {
  private instance: AxiosInstance;

  constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ResponseData>) => {
        if (response.data.code !== 200) {
          return Promise.reject(response.data);
        }
        return response.data.data;
      },
      error => this.handleError(error)
    );
  }

  private getToken(): string | null {
    // 根据实际存储方案调整
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  private handleError(error: any) {
    if (error.config?.retryCount && error.response?.status === 503) {
      const retryCount = error.config.retryCount;
      if (retryCount > 0) {
        error.config.retryCount = retryCount - 1;
        return this.instance.request(error.config);
      }
    }

    const status = error.response?.status || '未知';
    const message = error.response?.data?.message || error.message;

    console.error(`[HTTP Error] Status: ${status}, Message: ${message}`);
    return Promise.reject({
      status,
      message,
      rawError: error
    });
  }

  // 封装请求方法
  public request<T>(config: AxiosRequestConfig): Promise<T> {
    return this.instance.request(config);
  }

  public get<T>(url: string, params?: any): Promise<T> {
    return this.instance.get(url, { params });
  }

  public post<T>(url: string, data?: any): Promise<T> {
    return this.instance.post(url, data);
  }

  public put<T>(url: string, data?: any): Promise<T> {
    return this.instance.put(url, data);
  }

  public delete<T>(url: string, params?: any): Promise<T> {
    return this.instance.delete(url, { params });
  }

  public upload<T>(url: string, file: File, data?: any): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }
    return this.instance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
}

// 使用 Vite 环境变量
const baseURL = import.meta.env.VITE_API_BASE_URL || '';

export const http = new HttpRequest(baseURL);
