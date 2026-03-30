import type { AxiosRequestConfig, AxiosResponseHeaders, RawAxiosResponseHeaders } from 'axios';

export interface AppHttpRequestConfig<TData = unknown> extends AxiosRequestConfig<TData> {
  serviceName?: string;
  retryCount?: number;
  retryDelayMs?: number;
  requestId?: string;
}

export interface AppHttpResponse<T = unknown> {
  data: T;
  status: number;
  headers: RawAxiosResponseHeaders | AxiosResponseHeaders;
  durationMs: number;
  url: string;
}
