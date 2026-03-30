import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  MethodNotAllowedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { I18nService } from 'nestjs-i18n';
import { IS_PUBLIC_KEY } from '../constants/http.constants.js';

@Injectable()
export class HttpGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly i18n: I18nService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method.toUpperCase();

    const allowed = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'];

    if (!allowed.includes(method)) {
      throw new MethodNotAllowedException(
        this.i18n.translate('common.http.method_not_allowed', {
          args: { method },
        }),
      );
    }

    return true;
  }
}
