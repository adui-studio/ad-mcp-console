import { type MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nJsonLoader,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { join } from 'node:path';

import { validateEnv } from './common/config/env.schema.js';
import { AppHttpClientModule } from './common/http-client/http-client.module.js';
import { HttpGuard } from './common/http/guards/http.guard.js';
import { LoggingInterceptor } from './common/http/interceptors/logging.interceptor.js';
import { ResponseInterceptor } from './common/http/interceptors/response.interceptor.js';
import { TimeoutInterceptor } from './common/http/interceptors/timeout.interceptor.js';
import { LoggerModule } from './common/logger/logger.module.js';
import { PinoHttpMiddleware } from './common/logger/pino-http.middleware.js';
import { RequestContextMiddleware } from './common/request/request-context.middleware.js';
import { RequestContextModule } from './common/request/request-context.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { PrismaModule } from './modules/prisma/prisma.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
    }),
    I18nModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.get<string>('I18N_FALLBACK_LANGUAGE', 'zh'),
        loader: I18nJsonLoader,
        loaderOptions: {
          path: join(process.cwd(), 'src/i18n'),
          watch: true,
        },
      }),
      resolvers: [
        { use: QueryResolver, options: ['lang', 'locale'] },
        AcceptLanguageResolver,
        new HeaderResolver(['x-lang', 'x-locale']),
      ],
    }),
    RequestContextModule,
    LoggerModule,
    PrismaModule,
    AppHttpClientModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: HttpGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        new TimeoutInterceptor(configService.get<number>('REQUEST_TIMEOUT_MS', 15000)),
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestContextMiddleware, PinoHttpMiddleware).forRoutes('*');
  }
}
