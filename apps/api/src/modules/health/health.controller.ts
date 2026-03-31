import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DiskHealthIndicator,
  HealthCheck,
  type HealthCheckResult,
  HealthCheckService,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';

import { Public } from '../../common/http/decorators/public.decorator.js';
import { ApiServiceUnavailableError } from '../../common/swagger/swagger-responses.js';
import { PrismaHealthIndicator } from './indicators/prisma.health.js';

@ApiTags('健康检查 / health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly configService: ConfigService,
    private readonly i18n: I18nService,
  ) {}

  @Get()
  @Public()
  @HealthCheck()
  @ApiOperation({
    summary: '健康检查 / Health check',
    description:
      '返回应用、数据库、内存和磁盘健康状态 / Returns application, database, memory, and disk health status',
  })
  @ApiOkResponse({
    description: '健康检查成功 / Health check succeeded',
    schema: {
      example: {
        status: 'ok',
        info: {
          database: {
            status: 'up',
          },
          memory_heap: {
            status: 'up',
          },
          memory_rss: {
            status: 'up',
          },
          storage: {
            status: 'up',
          },
          message: '服务运行正常 / Service is healthy',
        },
        error: {},
        details: {
          database: {
            status: 'up',
          },
          memory_heap: {
            status: 'up',
          },
          memory_rss: {
            status: 'up',
          },
          storage: {
            status: 'up',
          },
          message: '服务运行正常 / Service is healthy',
        },
      },
    },
  })
  @ApiServiceUnavailableError({
    code: 'HEALTH_CHECK_FAILED',
    messageZh: '健康检查失败',
    messageEn: 'Health check failed',
    details: {
      example: {
        storage: {
          status: 'down',
          message: 'ENOSPC: no space left on device',
        },
      },
    },
  })
  async check(): Promise<HealthCheckResult> {
    const heapMb = this.configService.get<number>('HEALTH_MEMORY_HEAP_MB', 256);
    const rssMb = this.configService.get<number>('HEALTH_MEMORY_RSS_MB', 512);
    const thresholdPercent = this.configService.get<number>('HEALTH_DISK_THRESHOLD_PERCENT', 0.9);

    const configuredDiskPath = this.configService.get<string>('HEALTH_DISK_PATH')?.trim() || '';

    const diskPath =
      process.platform === 'win32'
        ? this.normalizeWindowsDiskPath(configuredDiskPath)
        : configuredDiskPath || '/';

    const result = await this.health.check([
      () => this.prismaHealth.isHealthy('database'),
      () => this.memory.checkHeap('memory_heap', heapMb * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', rssMb * 1024 * 1024),
      () =>
        this.disk.checkStorage('storage', {
          path: diskPath,
          thresholdPercent,
        }),
    ]);

    return {
      ...result,
      info: {
        ...result.info,
        message: this.i18n.translate('common.health.ok'),
      },
    };
  }

  private normalizeWindowsDiskPath(input: string): string {
    if (!input || input === '/' || input === '\\') {
      return 'C:\\';
    }

    if (/^[A-Za-z]:\\?$/.test(input)) {
      return input.endsWith('\\') ? input : `${input}\\`;
    }

    return 'C:\\';
  }
}
