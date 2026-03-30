import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { type Observable, tap } from 'rxjs';
import { AppLoggerService } from '../../logger/app-logger.service.js';

type HttpRequestLike = Request & {
  originalUrl?: string;
  url: string;
};

type HttpErrorLike = Error & {
  status?: number;
};

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<HttpRequestLike>();
    const response = http.getResponse<Response & { statusCode: number }>();
    const startedAt = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.log({
            type: 'http_request_completed',
            method: request.method,
            path: request.originalUrl ?? request.url,
            statusCode: response.statusCode,
            durationMs: Date.now() - startedAt,
          });
        },
        error: (error: unknown) => {
          const httpError = error as HttpErrorLike;

          this.logger.error(error, {
            type: 'http_request_failed',
            method: request.method,
            path: request.originalUrl ?? request.url,
            statusCode: httpError.status ?? response.statusCode,
            durationMs: Date.now() - startedAt,
          });
        },
      }),
    );
  }
}
