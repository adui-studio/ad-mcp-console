import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { I18nContext } from 'nestjs-i18n';
import { AppLoggerService } from '../../logger/app-logger.service.js';
import { RequestContextService } from '../../request/request-context.service.js';
import { type ApiErrorResponse } from '../types/api-response.type.js';
import { Prisma } from '../../../generated/prisma/client.js';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly logger: AppLoggerService,
    private readonly requestContext: RequestContextService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const i18n = I18nContext.current(host);

    const normalized = this.normalizeException(exception, i18n);
    const requestId = this.requestContext.getRequestId();

    this.logger.error(exception instanceof Error ? exception : new Error(String(exception)), {
      type: 'http_exception',
      method: request.method,
      path: request.originalUrl,
      statusCode: normalized.statusCode,
      code: normalized.code,
      requestId,
    });

    const payload: ApiErrorResponse = {
      success: false,
      requestId,
      timestamp: new Date().toISOString(),
      error: {
        code: normalized.code,
        message: normalized.message,
        details: normalized.details,
      },
    };

    response.status(normalized.statusCode).json(payload);
  }

  private normalizeException(
    exception: unknown,
    i18n?: I18nContext,
  ): {
    statusCode: number;
    code: string;
    message: string;
    details?: unknown;
  } {
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.mapPrismaKnownError(exception, i18n);
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'PRISMA_VALIDATION_ERROR',
        message:
          i18n?.translate('common.prisma.validation_error') ?? 'Invalid database operation payload',
      };
    }

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        return {
          statusCode,
          code: 'HTTP_EXCEPTION',
          message: exceptionResponse,
        };
      }

      if (typeof exceptionResponse === 'object' && exceptionResponse) {
        const body = exceptionResponse as Record<string, unknown>;

        return {
          statusCode,
          code:
            typeof body.error === 'string'
              ? body.error.toUpperCase().replace(/\s+/g, '_')
              : 'HTTP_EXCEPTION',
          message:
            typeof body.message === 'string'
              ? body.message
              : Array.isArray(body.message)
                ? body.message.join(', ')
                : exception.message,
          details: body,
        };
      }

      return {
        statusCode,
        code: 'HTTP_EXCEPTION',
        message: exception.message,
      };
    }

    if (exception instanceof Error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: 'INTERNAL_SERVER_ERROR',
        message:
          i18n?.translate('common.error.internal_server_error') ??
          exception.message ??
          'Internal server error',
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR',
      message: i18n?.translate('common.error.internal_server_error') ?? 'Internal server error',
      details: exception,
    };
  }

  private mapPrismaKnownError(
    error: Prisma.PrismaClientKnownRequestError,
    i18n?: I18nContext,
  ): {
    statusCode: number;
    code: string;
    message: string;
    details?: unknown;
  } {
    switch (error.code) {
      case 'P2002':
        return {
          statusCode: HttpStatus.CONFLICT,
          code: 'PRISMA_UNIQUE_CONSTRAINT',
          message:
            i18n?.translate('common.prisma.unique_constraint') ??
            'A unique constraint would be violated',
          details: error.meta,
        };
      case 'P2025':
        return {
          statusCode: HttpStatus.NOT_FOUND,
          code: 'PRISMA_RECORD_NOT_FOUND',
          message:
            i18n?.translate('common.prisma.record_not_found') ??
            'The requested record was not found',
          details: error.meta,
        };
      default:
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          code: error.code,
          message: error.message,
          details: error.meta,
        };
    }
  }
}
