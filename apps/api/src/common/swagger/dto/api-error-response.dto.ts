import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiErrorBodyDto {
  @ApiProperty({
    example: 400,
    description: 'HTTP 状态码 / HTTP status code',
  })
  statusCode!: number;

  @ApiProperty({
    example: 'BAD_REQUEST',
    description: '业务错误码 / Business error code',
  })
  code!: string;

  @ApiProperty({
    example: '请求参数不合法 / Invalid request parameters',
    description: '错误信息 / Error message',
  })
  message!: string;

  @ApiPropertyOptional({
    example: {
      field: 'transportType',
      reason: 'unsupported value',
    },
    description: '错误详情 / Error details',
  })
  details?: unknown;
}

export class ApiErrorResponseDto {
  @ApiProperty({
    example: false,
    description: '是否成功 / Whether the request succeeded',
  })
  success!: false;

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

  @ApiProperty({
    type: ApiErrorBodyDto,
    description: '错误对象 / Error payload',
  })
  error!: ApiErrorBodyDto;
}
