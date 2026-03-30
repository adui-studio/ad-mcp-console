import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ServerResponseDto {
  @ApiProperty({
    description: 'Server ID / Server 唯一标识',
  })
  id!: string;

  @ApiProperty({
    description: 'Server 名称 / Server display name',
  })
  name!: string;

  @ApiProperty({
    enum: ['stdio', 'streamable_http'],
    description: '传输类型 / Transport type',
  })
  transportType!: 'stdio' | 'streamable_http';

  @ApiPropertyOptional({
    description: 'HTTP 地址 / Base URL',
  })
  baseUrl?: string | null;

  @ApiPropertyOptional({
    description: '启动命令 / Command',
  })
  command?: string | null;

  @ApiProperty({
    type: [String],
    description: '命令参数数组 / Command arguments array',
  })
  argsJson!: string[];

  @ApiProperty({
    additionalProperties: { type: 'string' },
    description: '环境变量对象 / Environment variables object',
  })
  envJson!: Record<string, string>;

  @ApiProperty({
    description: '创建时间 / Created time',
  })
  createdAt!: string;

  @ApiProperty({
    description: '更新时间 / Updated time',
  })
  updatedAt!: string;
}
