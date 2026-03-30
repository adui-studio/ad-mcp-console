import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AppHttpClientService } from './http-client.service.js';
import { LoggerModule } from '../logger/logger.module.js';

@Global()
@Module({
  imports: [
    LoggerModule,
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        timeout: configService.get<number>('HTTP_CLIENT_TIMEOUT_MS', 10_000),
        maxRedirects: 3,
      }),
    }),
  ],
  providers: [AppHttpClientService],
  exports: [AppHttpClientService],
})
export class AppHttpClientModule {}
