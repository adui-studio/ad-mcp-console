import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiSuccessResponseDto {
  @ApiProperty({
    example: true,
    description: '是否成功 / Whether the request succeeded',
  })
  success!: true;

  @ApiProperty({
    example: '2026-03-31T12:00:00.000Z',
    description: '响应时间 / Response timestamp',
  })
  timestamp!: string;

  @ApiProperty({
    example: 'req_demo_123456',
    description: '请求 ID / Request ID',
  })
  requestId!: string;

  @ApiPropertyOptional({
    example: {},
    description: '响应数据 / Response data',
  })
  data?: unknown;
}
