import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateServerDto {
  @ApiProperty({
    example: 'Local Files MCP',
    description: 'Server 名称 / Server display name',
  })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({
    enum: ['stdio', 'streamable_http'],
    example: 'stdio',
    description: '传输类型 / Transport type',
  })
  @IsEnum(['stdio', 'streamable_http'])
  transportType!: 'stdio' | 'streamable_http';

  @ApiPropertyOptional({
    example: 'https://example.com/mcp',
    description:
      'HTTP 地址，仅在 transportType 为 streamable_http 时必填 / Base URL, required when transportType is streamable_http',
  })
  @ValidateIf((dto: CreateServerDto) => dto.transportType === 'streamable_http')
  @IsString()
  @MinLength(1)
  @IsOptional()
  baseUrl?: string;

  @ApiPropertyOptional({
    example: 'npx',
    description:
      '启动命令，仅在 transportType 为 stdio 时必填 / Command, required when transportType is stdio',
  })
  @ValidateIf((dto: CreateServerDto) => dto.transportType === 'stdio')
  @IsString()
  @MinLength(1)
  @IsOptional()
  command?: string;

  @ApiPropertyOptional({
    example: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp'],
    type: [String],
    description: '命令参数数组 / Command arguments array',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  argsJson?: string[];

  @ApiPropertyOptional({
    example: {
      NODE_ENV: 'development',
      MCP_LOG_LEVEL: 'debug',
    },
    additionalProperties: { type: 'string' },
    description: '环境变量对象 / Environment variables object',
  })
  @IsObject()
  @IsOptional()
  envJson?: Record<string, string>;
}
