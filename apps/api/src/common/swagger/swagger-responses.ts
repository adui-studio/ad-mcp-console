import { applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiResponse,
  getSchemaPath,
  type ApiResponseOptions,
} from '@nestjs/swagger';

import { ApiErrorResponseDto } from './dto/api-error-response.dto.js';
import { ApiSuccessResponseDto } from './dto/api-success-response.dto.js';

export type SwaggerErrorResponseOptions = {
  status: number;
  code: string;
  messageZh: string;
  messageEn: string;
  details?: unknown;
};

type SwaggerErrorExample = {
  success: false;
  timestamp: string;
  requestId: string;
  error: {
    statusCode: number;
    code: string;
    message: string;
    details?: unknown;
  };
};

function buildErrorSchemaExample(options: SwaggerErrorResponseOptions): SwaggerErrorExample {
  return {
    success: false,
    timestamp: '2026-03-31T12:00:00.000Z',
    requestId: 'req_demo_123456',
    error: {
      statusCode: options.status,
      code: options.code,
      message: `${options.messageZh} / ${options.messageEn}`,
      ...(options.details !== undefined ? { details: options.details } : {}),
    },
  };
}

function buildErrorResponseOptions(options: SwaggerErrorResponseOptions): ApiResponseOptions {
  return {
    status: options.status,
    description: `${options.messageZh} / ${options.messageEn}`,
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiErrorResponseDto) },
        {
          example: buildErrorSchemaExample(options),
        },
      ],
    },
  };
}

export function createApiErrorResponse(
  options: SwaggerErrorResponseOptions,
): MethodDecorator & ClassDecorator {
  return applyDecorators(
    ApiExtraModels(ApiErrorResponseDto),
    ApiResponse(buildErrorResponseOptions(options)),
  );
}

export function ApiBadRequestError(options?: {
  code?: string;
  messageZh?: string;
  messageEn?: string;
  details?: unknown;
}): MethodDecorator & ClassDecorator {
  return createApiErrorResponse({
    status: 400,
    code: options?.code ?? 'BAD_REQUEST',
    messageZh: options?.messageZh ?? '请求参数不合法',
    messageEn: options?.messageEn ?? 'Invalid request parameters',
    details: options?.details,
  });
}

export function ApiNotFoundError(options?: {
  code?: string;
  messageZh?: string;
  messageEn?: string;
  details?: unknown;
}): MethodDecorator & ClassDecorator {
  return createApiErrorResponse({
    status: 404,
    code: options?.code ?? 'NOT_FOUND',
    messageZh: options?.messageZh ?? '资源不存在',
    messageEn: options?.messageEn ?? 'Resource not found',
    details: options?.details,
  });
}

export function ApiConflictError(options?: {
  code?: string;
  messageZh?: string;
  messageEn?: string;
  details?: unknown;
}): MethodDecorator & ClassDecorator {
  return createApiErrorResponse({
    status: 409,
    code: options?.code ?? 'CONFLICT',
    messageZh: options?.messageZh ?? '资源冲突',
    messageEn: options?.messageEn ?? 'Resource conflict',
    details: options?.details,
  });
}

export function ApiServiceUnavailableError(options?: {
  code?: string;
  messageZh?: string;
  messageEn?: string;
  details?: unknown;
}): MethodDecorator & ClassDecorator {
  return createApiErrorResponse({
    status: 503,
    code: options?.code ?? 'SERVICE_UNAVAILABLE',
    messageZh: options?.messageZh ?? '服务暂不可用',
    messageEn: options?.messageEn ?? 'Service unavailable',
    details: options?.details,
  });
}

export function ApiInternalServerErrorDoc(options?: {
  code?: string;
  messageZh?: string;
  messageEn?: string;
  details?: unknown;
}): MethodDecorator & ClassDecorator {
  return createApiErrorResponse({
    status: 500,
    code: options?.code ?? 'INTERNAL_SERVER_ERROR',
    messageZh: options?.messageZh ?? '服务器内部错误',
    messageEn: options?.messageEn ?? 'Internal server error',
    details: options?.details,
  });
}

export function ApiOkResponseWrapped(options: {
  description: string;
  dataExample: unknown;
}): MethodDecorator & ClassDecorator {
  return applyDecorators(
    ApiExtraModels(ApiSuccessResponseDto),
    ApiOkResponse({
      description: options.description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiSuccessResponseDto) },
          {
            example: {
              success: true,
              timestamp: '2026-03-31T12:00:00.000Z',
              requestId: 'req_demo_123456',
              data: options.dataExample,
            },
          },
        ],
      },
    }),
  );
}
