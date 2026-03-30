import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
  RequestTimeoutException,
} from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { catchError, type Observable, throwError, timeout } from 'rxjs';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private readonly timeoutMs = 15_000) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      timeout(this.timeoutMs),
      catchError((error) => {
        if (error?.name === 'TimeoutError') {
          const i18n = I18nContext.current(context);

          return throwError(
            () =>
              new RequestTimeoutException(
                i18n?.translate('common.http.request_timeout', {
                  args: { timeoutMs: this.timeoutMs },
                }) ?? `Request timeout after ${this.timeoutMs}ms`,
              ),
          );
        }

        return throwError(() => error);
      }),
    );
  }
}
