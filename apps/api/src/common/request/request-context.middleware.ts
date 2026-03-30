import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { RequestContextService } from './request-context.service.js';
import { REQUEST_ID_HEADER } from '../http/constants/http.constants.js';

type RequestWithId = Request & { id?: string };

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(private readonly requestContext: RequestContextService) {}

  use(req: RequestWithId, res: Response, next: NextFunction): void {
    const headerValue = req.header(REQUEST_ID_HEADER);
    const requestId = headerValue?.trim() || nanoid();

    req.id = requestId;
    res.setHeader(REQUEST_ID_HEADER, requestId);

    this.requestContext.run(
      {
        requestId,
        method: req.method,
        path: req.originalUrl || req.url,
      },
      () => next(),
    );
  }
}
