import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginationQuery } from '../../shared/types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmpresaDto, UpdateEmpresaDto } from './dto/create-empresa.dto';

@Injectable()
export class EmpresasService {
  constructor(private prisma: PrismaService) {}

  async create(createEmpresaDto: CreateEmpresaDto) {
    // Verificar se o slug já existe
    const existingEmpresa = await this.prisma.empresa.findUnique({
      where: { slug: createEmpresaDto.slug },
    });

    if (existingEmpresa) {
      throw new BadRequestException('Slug já está em uso');
    }

    return this.prisma.empresa.create({
      data: createEmpresaDto,
      include: {
        usuarios: {
          select: {
            id: true,
            nome: true,
            email: true,
            role: true,
            ativo: true,
          },
        },
        _count: {
          select: {
            usuarios: true,
            clientes: true,
            conversas: true,
          },
        },
      },
    });
  }

  async findAll(pagination: PaginationQuery) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'nome',
      sortOrder = 'asc',
    } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [empresas, total] = await Promise.all([
      this.prisma.empresa.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: {
              usuarios: true,
              clientes: true,
              conversas: true,
            },
          },
        },
      }),
      this.prisma.empresa.count({ where }),
    ]);

    return {
      data: empresas,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id },
      include: {
        usuarios: {
          select: {
            id: true,
            nome: true,
            email: true,
            role: true,
            ativo: true,
            ultimoLogin: true,
          },
        },
        configuracaoIA: true,
        _count: {
          select: {
            usuarios: true,
            clientes: true,
            conversas: true,
            agendamentos: true,
          },
        },
      },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa não encontrada');
    }

    return empresa;
  }

  async findBySlug(slug: string) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { slug },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa não encontrada');
    }

    return empresa;
  }

  async update(id: string, updateEmpresaDto: UpdateEmpresaDto) {
    const empresa = await this.findOne(id);

    if (updateEmpresaDto.slug && updateEmpresaDto.slug !== empresa.slug) {
      const existingEmpresa = await this.prisma.empresa.findUnique({
        where: { slug: updateEmpresaDto.slug },
      });

      if (existingEmpresa) {
        throw new BadRequestException('Slug já está em uso');
      }
    }

    return this.prisma.empresa.update({
      where: { id },
      data: updateEmpresaDto,
      include: {
        usuarios: {
          select: {
            id: true,
            nome: true,
            email: true,
            role: true,
            ativo: true,
          },
        },
        _count: {
          select: {
            usuarios: true,
            clientes: true,
            conversas: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Verificar se há usuários vinculados
    const usuariosCount = await this.prisma.usuario.count({
      where: { empresaId: id },
    });

    if (usuariosCount > 0) {
      throw new BadRequestException(
        'Não é possível excluir empresa com usuários vinculados',
      );
    }

    return this.prisma.empresa.delete({
      where: { id },
    });
  }

  async toggleStatus(id: string) {
    const empresa = await this.findOne(id);

    return this.prisma.empresa.update({
      where: { id },
      data: { ativo: !empresa.ativo },
      select: {
        id: true,
        nome: true,
        slug: true,
        ativo: true,
      },
    });
  }

  async getMetrics(id: string) {
    const empresa = await this.findOne(id);

    const [
      totalUsuarios,
      totalClientes,
      totalConversas,
      conversasAbertas,
      conversasFechadas,
      totalAgendamentos,
      agendamentosHoje,
    ] = await Promise.all([
      this.prisma.usuario.count({ where: { empresaId: id } }),
      this.prisma.cliente.count({ where: { empresaId: id } }),
      this.prisma.conversa.count({ where: { empresaId: id } }),
      this.prisma.conversa.count({
        where: {
          empresaId: id,
          status: { in: ['ABERTO', 'EM_ANDAMENTO', 'AGUARDANDO'] },
        },
      }),
      this.prisma.conversa.count({
        where: {
          empresaId: id,
          status: { in: ['RESOLVIDO', 'FECHADO'] },
        },
      }),
      this.prisma.agendamento.count({ where: { empresaId: id } }),
      this.prisma.agendamento.count({
        where: {
          empresaId: id,
          dataHora: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
    ]);

    return {
      empresa: {
        id: empresa.id,
        nome: empresa.nome,
        slug: empresa.slug,
      },
      metrics: {
        totalUsuarios,
        totalClientes,
        totalConversas,
        conversasAbertas,
        conversasFechadas,
        totalAgendamentos,
        agendamentosHoje,
      },
    };
  }
}
