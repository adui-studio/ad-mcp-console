import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { type Server } from '../../generated/prisma/client.js';
import { CreateServerDto } from './dto/create-server.dto.js';
import { ListServersQueryDto } from './dto/list-servers-query.dto.js';
import { ServerResponseDto } from './dto/server-response.dto.js';
import { UpdateServerDto } from './dto/update-server.dto.js';
import { ServersService } from './servers.service.js';

@ApiTags('服务器管理 / Servers')
@Controller('servers')
export class ServersController {
  constructor(private readonly serversService: ServersService) {}

  @Get()
  @ApiOperation({
    summary: '查询 Server 列表 / List servers',
    description: '按名称或传输类型查询 Server 列表 / Query servers by name or transport type',
  })
  @ApiResponse({
    status: 200,
    description: '查询成功 / Query succeeded',
    type: ServerResponseDto,
    isArray: true,
  })
  async list(@Query() query: ListServersQueryDto): Promise<ServerResponseDto[]> {
    const servers = await this.serversService.list(query);
    return servers.map((server) => this.toResponse(server));
  }

  @Get(':id')
  @ApiOperation({
    summary: '获取 Server 详情 / Get server detail',
    description: '根据 ID 获取单个 Server 详情 / Get a single server by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Server ID / Server 唯一标识',
  })
  @ApiResponse({
    status: 200,
    description: '获取成功 / Fetch succeeded',
    type: ServerResponseDto,
  })
  async getById(@Param('id') id: string): Promise<ServerResponseDto> {
    const server = await this.serversService.getById(id);
    return this.toResponse(server);
  }

  @Post()
  @ApiOperation({
    summary: '创建 Server / Create server',
    description: '创建一个新的 MCP Server 配置 / Create a new MCP server configuration',
  })
  @ApiResponse({
    status: 201,
    description: '创建成功 / Created successfully',
    type: ServerResponseDto,
  })
  async create(@Body() dto: CreateServerDto): Promise<ServerResponseDto> {
    const server = await this.serversService.create(dto);
    return this.toResponse(server);
  }

  @Patch(':id')
  @ApiOperation({
    summary: '更新 Server / Update server',
    description: '根据 ID 更新 MCP Server 配置 / Update an MCP server configuration by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Server ID / Server 唯一标识',
  })
  @ApiResponse({
    status: 200,
    description: '更新成功 / Updated successfully',
    type: ServerResponseDto,
  })
  async update(@Param('id') id: string, @Body() dto: UpdateServerDto): Promise<ServerResponseDto> {
    const server = await this.serversService.update(id, dto);
    return this.toResponse(server);
  }

  @Delete(':id')
  @ApiOperation({
    summary: '删除 Server / Delete server',
    description: '根据 ID 删除 MCP Server 配置 / Delete an MCP server configuration by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Server ID / Server 唯一标识',
  })
  @ApiResponse({
    status: 200,
    description: '删除成功 / Deleted successfully',
    schema: {
      example: {
        id: 'ckxxxxxxxxxxxxxxxxxxxxxxx',
      },
    },
  })
  async remove(@Param('id') id: string): Promise<{ id: string }> {
    return this.serversService.remove(id);
  }

  private toResponse(server: Server): ServerResponseDto {
    return {
      id: server.id,
      name: server.name,
      transportType: server.transportType,
      baseUrl: server.baseUrl,
      command: server.command,
      argsJson: this.toStringArray(server.argsJson),
      envJson: this.toStringRecord(server.envJson),
      createdAt: server.createdAt.toISOString(),
      updatedAt: server.updatedAt.toISOString(),
    };
  }

  private toStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter((item): item is string => typeof item === 'string');
  }

  private toStringRecord(value: unknown): Record<string, string> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(value).filter(
        (entry): entry is [string, string] => typeof entry[1] === 'string',
      ),
    );
  }
}
