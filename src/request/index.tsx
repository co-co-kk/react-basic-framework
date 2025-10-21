import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
axios.defaults.withCredentials = true;
import { message, Space } from 'antd';
import useAuthStore from "@/stores/authStore";
import { refreshAndRetry } from './useTokenRefresh';
interface RequestConfig extends AxiosRequestConfig {
  showLoading?: boolean;
  showError?: boolean;
}
interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  status_code?: number;
  status_message?: string;
}

const customAxios: AxiosInstance = axios.create({});
const noTokenRequestList = [
  '/api/platform/auth/v1/refresh-token',
  '/api/platform/usercenter/login-page/config/detail',
  '/api/platform/auth/v1/login',
];

customAxios.interceptors.request.use(
  (config: RequestConfig) => {
    const tstoken = localStorage.getItem('access_token_lf');
    config.headers['Authorization'] = `${tstoken}`;
    if (noTokenRequestList.includes(config.url!)) {
      config.headers['Authorization'] = '';
    }
    config.headers['Access-Control-Allow-Origin'] = '*';
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);
customAxios.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    if (response.data.status_code === 200 || response.data.code === 200) {
      return response.data;
    }
    if (response.data.code === 0) {
      return response;
    }

    if (response.data.status_code == 500) {
      message.error(response.data.status_message);
      return Promise.reject(response.data.status_message);
    }
    if (!response.data.status_code && !response.data.code) {
      return response;
    }
    switch (response.data.code) {
      case 500:
        message.error(response.data.message);
        return Promise.reject(response.data.message);
      default:
        message.error(response.data.message);
        return Promise.reject(response.data.message);
    }
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (error?.status === 401 && error && !error.config.headers._retry) {
        error.config.headers._retry = true; // 避免无限递归
        return refreshAndRetry(error.config);
      }
      return Promise.reject('登录过期,请重新登录');
    }
    /**
     * 功能:是否强制下线
     * 条件:
     * 409 强制下线,账号在其他客户端登录
     * 刷新token接口特殊处理,它在http层会返回400,但后端在结果里面还是会返回409
     */
    if (error?.response?.status === 409 || (error?.response?.status === 400 && error?.response?.data?.code === 409)) {
      const setIsDownline = useAuthStore((state) => state.setIsDownline);
       setIsDownline(true)
      return Promise.reject(error);
    }
    if (error.code === 'ERR_CANCELED') return Promise.reject(null);
    // window.errorAlerts([error.message])
    return Promise.reject(null);
  },
);

export default customAxios;
// const request = {
//   get: <T = any,>(url: string, config?: RequestConfig): Promise<T> => {
//     return customAxios.get(url, config);
//   },

//   post: <T = any, D = any>(url: string, data?: D, config?: RequestConfig): Promise<T> => {
//     return customAxios.post(url, data, config);
//   },

//   put: <T = any, D = any>(url: string, data?: D, config?: RequestConfig): Promise<T> => {
//     return customAxios.put(url, data, config);
//   },

//   delete: <T = any,>(url: string, config?: RequestConfig): Promise<T> => {
//     return customAxios.delete(url, config);
//   },
// };

// export default request;
// export type { RequestConfig, ApiResponse };
