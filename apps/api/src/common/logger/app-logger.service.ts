import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import pino, { type Logger, type LoggerOptions } from 'pino';
import { RequestContextService } from '../request/request-context.service.js';

export const PINO_LOGGER = 'PINO_LOGGER';

@Injectable()
export class AppLoggerService implements LoggerService {
  private readonly logger: Logger;

  constructor(
    @Inject(PINO_LOGGER) logger: Logger,
    private readonly requestContext: RequestContextService,
    private readonly configService: ConfigService,
  ) {
    this.logger = logger;
  }

  static createPino(configService: ConfigService): Logger {
    const pretty = configService.get<boolean>('LOG_PRETTY', true);
    const level = configService.get<string>('LOG_LEVEL', 'info');
    const nodeEnv = configService.get<string>('NODE_ENV', 'development');

    const options: LoggerOptions = {
      level,
      base: {
        service: 'mcp-console-api',
        env: nodeEnv,
      },
      redact: {
        paths: [
          'req.headers.authorization',
          'req.headers.cookie',
          'authorization',
          'cookie',
          'password',
          'token',
          '*.password',
          '*.token',
        ],
        censor: '[REDACTED]',
      },
      transport: pretty
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
              singleLine: false,
              ignore: 'pid,hostname',
            },
          }
        : undefined,
    };

    return pino(options);
  }

  child(bindings: Record<string, unknown>): Logger {
    return this.logger.child(bindings);
  }

  private withRequestContext(meta?: Record<string, unknown>): Record<string, unknown> {
    return {
      requestId: this.requestContext.getRequestId(),
      ...meta,
    };
  }

  log(message: unknown, ...optionalParams: unknown[]): void {
    this.logger.info(this.withRequestContext(), this.stringify(message, optionalParams));
  }

  error(message: unknown, ...optionalParams: unknown[]): void {
    const payload = this.extractPayload(optionalParams);
    const msg = payload.msg ?? this.stringify(message);

    if (payload.err) {
      this.logger.error(
        {
          ...this.withRequestContext(payload.meta),
          err: payload.err,
        },
        msg,
      );
      return;
    }

    this.logger.error(this.withRequestContext(payload.meta), msg);
  }

  warn(message: unknown, ...optionalParams: unknown[]): void {
    this.logger.warn(this.withRequestContext(), this.stringify(message, optionalParams));
  }

  debug(message: unknown, ...optionalParams: unknown[]): void {
    this.logger.debug(this.withRequestContext(), this.stringify(message, optionalParams));
  }

  verbose(message: unknown, ...optionalParams: unknown[]): void {
    this.logger.trace(this.withRequestContext(), this.stringify(message, optionalParams));
  }

  private stringify(message: unknown, optionalParams: unknown[] = []): string {
    if (typeof message === 'string') {
      return optionalParams.length ? `${message} ${optionalParams.join(' ')}` : message;
    }

    try {
      return JSON.stringify(message);
    } catch {
      return String(message);
    }
  }

  private extractPayload(optionalParams: unknown[]): {
    err?: Error;
    msg?: string;
    meta?: Record<string, unknown>;
  } {
    const [first, second] = optionalParams;
    const err = first instanceof Error ? first : second instanceof Error ? second : undefined;
    const msg = typeof first === 'string' ? first : typeof second === 'string' ? second : undefined;
    const meta =
      typeof first === 'object' && first && !(first instanceof Error)
        ? (first as Record<string, unknown>)
        : typeof second === 'object' && second && !(second instanceof Error)
          ? (second as Record<string, unknown>)
          : undefined;

    return { err, msg, meta };
  }
}
