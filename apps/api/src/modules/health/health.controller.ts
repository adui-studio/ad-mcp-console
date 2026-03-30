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
import { PrismaHealthIndicator } from './indicators/prisma.health.js';
import { Public } from '../../common/http/decorators/public.decorator.js';

@ApiTags('health')
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
    summary: 'Health check',
    description: 'Returns application, database, memory, and disk health status',
  })
  @ApiOkResponse({
    description: 'Health check result',
  })
  async check(): Promise<HealthCheckResult> {
    const heapMb = this.configService.get<number>('HEALTH_MEMORY_HEAP_MB', 256);
    const rssMb = this.configService.get<number>('HEALTH_MEMORY_RSS_MB', 512);
    const thresholdPercent = this.configService.get<number>('HEALTH_DISK_THRESHOLD_PERCENT', 0.9);
    const diskPath = this.configService.get<string>(
      'HEALTH_DISK_PATH',
      process.platform === 'win32' ? 'C:\\' : '/',
    );

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
}
