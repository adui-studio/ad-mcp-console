import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module.js';
import { AppLoggerService } from './common/logger/app-logger.service.js';
import {
  createSwaggerConfigEn,
  createSwaggerConfigZh,
  getSwaggerDocumentOptions,
} from './common/swagger/swagger.factory.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = app.get(AppLoggerService);
  app.useLogger(logger);

  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT', 3001);
  const apiPrefix = configService.get<string>('API_PREFIX', 'api');

  app.setGlobalPrefix(apiPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: true,
    }),
  );

  const swaggerDocumentOptions = getSwaggerDocumentOptions();

  const zhDocument = SwaggerModule.createDocument(
    app,
    createSwaggerConfigZh(),
    swaggerDocumentOptions,
  );

  const enDocument = SwaggerModule.createDocument(
    app,
    createSwaggerConfigEn(),
    swaggerDocumentOptions,
  );

  SwaggerModule.setup('docs', app, zhDocument, {
    explorer: true,
    customSiteTitle: 'MCP Console Docs',
    jsonDocumentUrl: 'docs/json',
    yamlDocumentUrl: 'docs/yaml',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'list',
      filter: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      tryItOutEnabled: true,
    },
  });

  SwaggerModule.setup('docs-en', app, enDocument, {
    explorer: true,
    customSiteTitle: 'MCP Console Docs (EN)',
    jsonDocumentUrl: 'docs-en/json',
    yamlDocumentUrl: 'docs-en/yaml',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'list',
      filter: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      tryItOutEnabled: true,
    },
  });

  await app.listen(port);

  Logger.log(`Server running at http://localhost:${port}`, 'Bootstrap');
  Logger.log(`Swagger (ZH): http://localhost:${port}/docs`, 'Bootstrap');
  Logger.log(`Swagger (EN): http://localhost:${port}/docs-en`, 'Bootstrap');
  Logger.log(`API Prefix: /${apiPrefix}`, 'Bootstrap');
}

void bootstrap();
