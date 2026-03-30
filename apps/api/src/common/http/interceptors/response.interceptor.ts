import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import { map, type Observable } from 'rxjs';
import { type ApiSuccessResponse } from '../types/api-response.type.js';
import { RequestContextService } from '../../request/request-context.service.js';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiSuccessResponse<T>> {
  constructor(private readonly requestContext: RequestContextService) {}

  intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<ApiSuccessResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        requestId: this.requestContext.getRequestId(),
        timestamp: new Date().toISOString(),
        data,
      })),
    );
  }
}
