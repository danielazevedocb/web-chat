import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationQuery } from '../../shared/types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClienteDto, UpdateClienteDto } from './dto/create-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  async create(createClienteDto: CreateClienteDto, empresaId: string) {
    return this.prisma.cliente.create({
      data: {
        ...createClienteDto,
        empresaId,
      },
      include: {
        empresa: {
          select: {
            id: true,
            nome: true,
            slug: true,
          },
        },
        _count: {
          select: {
            conversas: true,
            agendamentos: true,
          },
        },
      },
    });
  }

  async findAll(pagination: PaginationQuery, empresaId: string) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'nome',
      sortOrder = 'asc',
    } = pagination;
    const skip = (page - 1) * limit;

    const where: any = { empresaId };

    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { telefone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [clientes, total] = await Promise.all([
      this.prisma.cliente.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          empresa: {
            select: {
              id: true,
              nome: true,
              slug: true,
            },
          },
          _count: {
            select: {
              conversas: true,
              agendamentos: true,
            },
          },
        },
      }),
      this.prisma.cliente.count({ where }),
    ]);

    return {
      data: clientes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, empresaId: string) {
    const cliente = await this.prisma.cliente.findFirst({
      where: { id, empresaId },
      include: {
        empresa: {
          select: {
            id: true,
            nome: true,
            slug: true,
          },
        },
        conversas: {
          orderBy: { updatedAt: 'desc' },
          take: 5,
          select: {
            id: true,
            titulo: true,
            status: true,
            canal: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        agendamentos: {
          orderBy: { dataHora: 'desc' },
          take: 5,
          select: {
            id: true,
            titulo: true,
            dataHora: true,
            status: true,
            tipo: true,
          },
        },
        _count: {
          select: {
            conversas: true,
            agendamentos: true,
          },
        },
      },
    });

    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return cliente;
  }

  async findByTelefone(telefone: string, empresaId: string) {
    return this.prisma.cliente.findFirst({
      where: { telefone, empresaId },
    });
  }

  async findByEmail(email: string, empresaId: string) {
    return this.prisma.cliente.findFirst({
      where: { email, empresaId },
    });
  }

  async update(
    id: string,
    updateClienteDto: UpdateClienteDto,
    empresaId: string,
  ) {
    const cliente = await this.findOne(id, empresaId);

    return this.prisma.cliente.update({
      where: { id },
      data: updateClienteDto,
      include: {
        empresa: {
          select: {
            id: true,
            nome: true,
            slug: true,
          },
        },
        _count: {
          select: {
            conversas: true,
            agendamentos: true,
          },
        },
      },
    });
  }

  async remove(id: string, empresaId: string) {
    await this.findOne(id, empresaId);

    return this.prisma.cliente.delete({
      where: { id },
    });
  }

  async toggleStatus(id: string, empresaId: string) {
    const cliente = await this.findOne(id, empresaId);

    return this.prisma.cliente.update({
      where: { id },
      data: { ativo: !cliente.ativo },
      select: {
        id: true,
        nome: true,
        email: true,
        ativo: true,
      },
    });
  }
}
