import { BadGatewayException, GatewayTimeoutException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import axios, { type AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { AppLoggerService } from '../logger/app-logger.service.js';
import { RequestContextService } from '../request/request-context.service.js';
import { type AppHttpRequestConfig, type AppHttpResponse } from './http-client.types.js';
import { REQUEST_ID_HEADER } from '../http/constants/http.constants.js';

@Injectable()
export class AppHttpClientService {
  constructor(
    private readonly httpService: HttpService,
    private readonly logger: AppLoggerService,
    private readonly requestContext: RequestContextService,
    private readonly configService: ConfigService,
  ) {}

  async request<TResponse = unknown, TData = unknown>(
    config: AppHttpRequestConfig<TData>,
  ): Promise<AppHttpResponse<TResponse>> {
    const startedAt = Date.now();

    const retryCount =
      config.retryCount ?? this.configService.get<number>('HTTP_CLIENT_RETRY_COUNT', 1);

    const retryDelayMs =
      config.retryDelayMs ?? this.configService.get<number>('HTTP_CLIENT_RETRY_DELAY_MS', 300);

    const requestId = config.requestId ?? this.requestContext.getRequestId() ?? undefined;

    const finalConfig: AxiosRequestConfig<TData> = {
      timeout: this.configService.get<number>('HTTP_CLIENT_TIMEOUT_MS', 10_000),
      ...config,
      headers: {
        ...(config.headers ?? {}),
        ...(requestId ? { [REQUEST_ID_HEADER]: requestId } : {}),
        'user-agent': 'mcp-console-api/0.1',
      },
    };

    let attempt = 0;

    while (true) {
      attempt += 1;

      try {
        this.logger.debug({
          type: 'outbound_http_request',
          serviceName: config.serviceName ?? 'external',
          attempt,
          method: (finalConfig.method ?? 'GET').toUpperCase(),
          url: this.buildUrlForLog(finalConfig),
        });

        const response = await this.httpService.axiosRef.request<
          TResponse,
          AxiosResponse<TResponse>,
          TData
        >(finalConfig);

        const durationMs = Date.now() - startedAt;

        this.logger.log({
          type: 'outbound_http_response',
          serviceName: config.serviceName ?? 'external',
          attempt,
          method: (finalConfig.method ?? 'GET').toUpperCase(),
          url: this.buildUrlForLog(finalConfig),
          status: response.status,
          durationMs,
        });

        return {
          data: response.data,
          status: response.status,
          headers: response.headers,
          durationMs,
          url: this.buildUrlForLog(finalConfig),
        };
      } catch (error) {
        const isAxiosError = axios.isAxiosError(error);
        const shouldRetry = isAxiosError && attempt <= retryCount && this.isRetryable(error);

        this.logger.warn({
          type: 'outbound_http_error',
          serviceName: config.serviceName ?? 'external',
          attempt,
          method: (finalConfig.method ?? 'GET').toUpperCase(),
          url: this.buildUrlForLog(finalConfig),
          message: error instanceof Error ? error.message : String(error),
          shouldRetry,
        });

        if (shouldRetry) {
          await this.sleep(retryDelayMs * attempt);
          continue;
        }

        throw this.normalizeError(error);
      }
    }
  }

  async get<TResponse = unknown>(
    url: string,
    config?: Omit<AppHttpRequestConfig<never>, 'url' | 'method' | 'data'>,
  ): Promise<AppHttpResponse<TResponse>> {
    return this.request<TResponse>({
      ...config,
      url,
      method: 'GET',
    });
  }

  async post<TResponse = unknown, TData = unknown>(
    url: string,
    data?: TData,
    config?: Omit<AppHttpRequestConfig<TData>, 'url' | 'method' | 'data'>,
  ): Promise<AppHttpResponse<TResponse>> {
    return this.request<TResponse, TData>({
      ...config,
      url,
      method: 'POST',
      data,
    });
  }

  async put<TResponse = unknown, TData = unknown>(
    url: string,
    data?: TData,
    config?: Omit<AppHttpRequestConfig<TData>, 'url' | 'method' | 'data'>,
  ): Promise<AppHttpResponse<TResponse>> {
    return this.request<TResponse, TData>({
      ...config,
      url,
      method: 'PUT',
      data,
    });
  }

  async patch<TResponse = unknown, TData = unknown>(
    url: string,
    data?: TData,
    config?: Omit<AppHttpRequestConfig<TData>, 'url' | 'method' | 'data'>,
  ): Promise<AppHttpResponse<TResponse>> {
    return this.request<TResponse, TData>({
      ...config,
      url,
      method: 'PATCH',
      data,
    });
  }

  async delete<TResponse = unknown>(
    url: string,
    config?: Omit<AppHttpRequestConfig<never>, 'url' | 'method' | 'data'>,
  ): Promise<AppHttpResponse<TResponse>> {
    return this.request<TResponse>({
      ...config,
      url,
      method: 'DELETE',
    });
  }

  private normalizeError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        return new GatewayTimeoutException(`Upstream timeout: ${error.message}`);
      }

      const status = error.response?.status;
      const data = error.response?.data;

      return new BadGatewayException({
        code: 'UPSTREAM_HTTP_ERROR',
        message: error.message,
        status,
        data,
      });
    }

    return error instanceof Error ? error : new Error(String(error));
  }

  private isRetryable(error: AxiosError): boolean {
    if (error.code === 'ECONNABORTED') {
      return true;
    }

    const status = error.response?.status;
    return status === undefined || status >= 500;
  }

  private buildUrlForLog(config: AxiosRequestConfig): string {
    if (!config.baseURL) {
      return config.url ?? '';
    }

    if (!config.url) {
      return config.baseURL;
    }

    return new URL(config.url, config.baseURL).toString();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
