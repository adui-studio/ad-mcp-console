import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';
import { AppLoggerService } from './common/logger/app-logger.service.js';
import { RequestContextService } from './common/request/request-context.service.js';
import { AllExceptionsFilter } from './common/http/filters/all-exceptions.filter.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const logger = app.get(AppLoggerService);
  const requestContext = app.get(RequestContextService);

  app.useLogger(logger);
  app.enableCors();
  app.enableShutdownHooks();

  const apiPrefix = configService.get<string>('API_PREFIX', 'api');
  const port = configService.get<number>('PORT', 3001);

  app.setGlobalPrefix(apiPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter(logger, requestContext));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('MCP Console API')
    .setDescription('REST API for MCP Console')
    .setVersion('0.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
    jsonDocumentUrl: `${apiPrefix}/docs/json`,
  });

  await app.listen(port);

  logger.log({
    type: 'app_bootstrapped',
    port,
    apiPrefix,
    docsUrl: `http://localhost:${port}/${apiPrefix}/docs`,
    env: configService.get<string>('NODE_ENV', 'development'),
    fallbackLanguage: configService.get<string>('I18N_FALLBACK_LANGUAGE', 'zh'),
  });
}

void bootstrap();
