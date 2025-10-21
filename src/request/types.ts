import type { AxiosRequestConfig } from 'axios';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions extends AxiosRequestConfig {
  /** 是否在响应中直接返回 data 字段 */
  unwrapData?: boolean;
}
