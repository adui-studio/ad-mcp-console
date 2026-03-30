import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ListServersQueryDto {
  @ApiPropertyOptional({
    description: '按名称模糊搜索 / Fuzzy search by name',
    example: 'filesystem',
  })
  @IsString()
  @IsOptional()
  q?: string;

  @ApiPropertyOptional({
    enum: ['stdio', 'streamable_http'],
    description: '按传输类型过滤 / Filter by transport type',
  })
  @IsEnum(['stdio', 'streamable_http'])
  @IsOptional()
  transportType?: 'stdio' | 'streamable_http';
}
