import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { type Prisma, type Server } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateServerDto } from './dto/create-server.dto.js';
import { ListServersQueryDto } from './dto/list-servers-query.dto.js';
import { UpdateServerDto } from './dto/update-server.dto.js';
import { parseArgsJson, parseEnvJson } from './schemas/server-json.schema.js';

@Injectable()
export class ServersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListServersQueryDto): Promise<Server[]> {
    const where: Prisma.ServerWhereInput = {
      ...(query.q
        ? {
            name: {
              contains: query.q,
            },
          }
        : {}),
      ...(query.transportType
        ? {
            transportType: query.transportType,
          }
        : {}),
    };

    return this.prisma.server.findMany({
      where,
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async getById(id: string): Promise<Server> {
    const server = await this.prisma.server.findUnique({
      where: { id },
    });

    if (!server) {
      throw new NotFoundException(`Server not found: ${id}`);
    }

    return server;
  }

  async create(dto: CreateServerDto): Promise<Server> {
    this.assertTransportFields(dto.transportType, dto.baseUrl, dto.command);

    return this.prisma.server.create({
      data: {
        name: dto.name,
        transportType: dto.transportType,
        baseUrl: dto.transportType === 'streamable_http' ? (dto.baseUrl ?? null) : null,
        command: dto.transportType === 'stdio' ? (dto.command ?? null) : null,
        argsJson: parseArgsJson(dto.argsJson),
        envJson: parseEnvJson(dto.envJson),
      },
    });
  }

  async update(id: string, dto: UpdateServerDto): Promise<Server> {
    const current = await this.getById(id);

    const nextTransportType = dto.transportType ?? current.transportType;
    const nextBaseUrl = dto.baseUrl ?? current.baseUrl ?? undefined;
    const nextCommand = dto.command ?? current.command ?? undefined;

    this.assertTransportFields(nextTransportType, nextBaseUrl, nextCommand);

    return this.prisma.server.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.transportType !== undefined ? { transportType: dto.transportType } : {}),
        baseUrl:
          nextTransportType === 'streamable_http' ? (dto.baseUrl ?? current.baseUrl ?? null) : null,
        command: nextTransportType === 'stdio' ? (dto.command ?? current.command ?? null) : null,
        ...(dto.argsJson !== undefined ? { argsJson: parseArgsJson(dto.argsJson) } : {}),
        ...(dto.envJson !== undefined ? { envJson: parseEnvJson(dto.envJson) } : {}),
      },
    });
  }

  async remove(id: string): Promise<{ id: string }> {
    await this.getById(id);

    await this.prisma.server.delete({
      where: { id },
    });

    return { id };
  }

  private assertTransportFields(
    transportType: 'stdio' | 'streamable_http',
    baseUrl?: string,
    command?: string,
  ): void {
    if (transportType === 'streamable_http' && !baseUrl) {
      throw new BadRequestException('baseUrl is required when transportType is streamable_http');
    }

    if (transportType === 'stdio' && !command) {
      throw new BadRequestException('command is required when transportType is stdio');
    }
  }
}
