import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginationQuery } from '../../shared/types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto, UpdateUsuarioDto } from './dto/create-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    const existingUser = await this.findByEmail(createUsuarioDto.email);

    if (existingUser) {
      throw new BadRequestException('Email já está em uso');
    }

    return this.prisma.usuario.create({
      data: createUsuarioDto,
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        avatar: true,
        role: true,
        ativo: true,
        ultimoLogin: true,
        empresaId: true,
        empresa: {
          select: {
            id: true,
            nome: true,
            slug: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findAll(pagination: PaginationQuery, empresaId?: string) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'nome',
      sortOrder = 'asc',
    } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (empresaId) {
      where.empresaId = empresaId;
    }

    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [usuarios, total] = await Promise.all([
      this.prisma.usuario.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          nome: true,
          email: true,
          telefone: true,
          avatar: true,
          role: true,
          ativo: true,
          ultimoLogin: true,
          empresaId: true,
          empresa: {
            select: {
              id: true,
              nome: true,
              slug: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.usuario.count({ where }),
    ]);

    return {
      data: usuarios,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        avatar: true,
        role: true,
        ativo: true,
        ultimoLogin: true,
        empresaId: true,
        empresa: {
          select: {
            id: true,
            nome: true,
            slug: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return usuario;
  }

  async findByEmail(email: string) {
    return this.prisma.usuario.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.prisma.usuario.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    const usuario = await this.findOne(id);

    if (updateUsuarioDto.email && updateUsuarioDto.email !== usuario.email) {
      const existingUser = await this.findByEmail(updateUsuarioDto.email);

      if (existingUser) {
        throw new BadRequestException('Email já está em uso');
      }
    }

    return this.prisma.usuario.update({
      where: { id },
      data: updateUsuarioDto,
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        avatar: true,
        role: true,
        ativo: true,
        ultimoLogin: true,
        empresaId: true,
        empresa: {
          select: {
            id: true,
            nome: true,
            slug: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.usuario.delete({
      where: { id },
    });
  }

  async toggleStatus(id: string) {
    const usuario = await this.findOne(id);

    return this.prisma.usuario.update({
      where: { id },
      data: { ativo: !usuario.ativo },
      select: {
        id: true,
        nome: true,
        email: true,
        ativo: true,
      },
    });
  }
}
