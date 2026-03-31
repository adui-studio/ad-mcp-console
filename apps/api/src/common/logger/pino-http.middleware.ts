import { Inject, Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import type { Logger } from 'pino';
import { nanoid } from 'nanoid';
import { pinoHttp } from 'pino-http';

import { PINO_LOGGER } from './app-logger.service.js';

type RequestWithId = Request & {
  id?: string;
  log?: Logger;
};

@Injectable()
export class PinoHttpMiddleware implements NestMiddleware {
  private readonly middleware: (req: RequestWithId, res: Response, next: NextFunction) => void;

  constructor(@Inject(PINO_LOGGER) private readonly logger: Logger) {
    this.middleware = pinoHttp({
      logger: this.logger,
      quietReqLogger: true,
      quietResLogger: true,
      customAttributeKeys: {
        req: 'httpRequest',
        res: 'httpResponse',
        err: 'httpError',
        responseTime: 'durationMs',
      },
      genReqId: (req) => {
        const requestWithId = req as RequestWithId;
        return requestWithId.id ?? nanoid();
      },
      customProps: (req) => {
        const requestWithId = req as RequestWithId;
        return {
          requestId: requestWithId.id ?? null,
        };
      },
      customLogLevel: (_req, res, err) => {
        if (err || res.statusCode >= 500) {
          return 'error';
        }
        if (res.statusCode >= 400) {
          return 'warn';
        }
        return 'info';
      },
      serializers: {
        req(req) {
          const request = req as RequestWithId | undefined;

          const forwardedFor = request?.headers?.['x-forwarded-for'];
          const realIp = request?.headers?.['x-real-ip'];

          const remoteAddress =
            (typeof forwardedFor === 'string' && forwardedFor.split(',')[0]?.trim()) ||
            (typeof realIp === 'string' && realIp.trim()) ||
            request?.ip ||
            request?.socket?.remoteAddress ||
            null;

          const remotePort = request?.socket?.remotePort ?? null;

          return {
            id: request?.id ?? null,
            method: request?.method ?? null,
            url: request?.originalUrl ?? request?.url ?? null,
            remoteAddress,
            remotePort,
            userAgent: request?.headers?.['user-agent'] ?? null,
          };
        },
        res(res) {
          return {
            statusCode: res?.statusCode ?? null,
          };
        },
      },
    });
  }

  use(req: RequestWithId, res: Response, next: NextFunction): void {
    this.middleware(req, res, next);
  }
}
