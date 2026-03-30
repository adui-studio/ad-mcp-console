import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RequestContextModule } from '../request/request-context.module.js';
import { AppLoggerService, PINO_LOGGER } from './app-logger.service.js';

@Global()
@Module({
  imports: [RequestContextModule],
  providers: [
    {
      provide: PINO_LOGGER,
      inject: [ConfigService],
      useFactory: AppLoggerService.createPino,
    },
    AppLoggerService,
  ],
  exports: [PINO_LOGGER, AppLoggerService],
})
export class LoggerModule {}
