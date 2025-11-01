import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto, UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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
        empresaId: true,
        ativo: true,
        ultimoLogin: true,
        createdAt: true,
        updatedAt: true,
        empresa: {
          select: {
            id: true,
            nome: true,
            slug: true,
          },
        },
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

  async searchUsers(search: string, empresaId?: string, excludeUserId?: string) {
    const where: any = {
      AND: [
        {
          OR: [
            { nome: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
        excludeUserId ? { id: { not: excludeUserId } } : {},
        empresaId ? { empresaId } : {},
        { ativo: true },
      ],
    };

    const usuarios = await this.prisma.usuario.findMany({
      where,
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        avatar: true,
        role: true,
        ultimoLogin: true,
      },
      take: 20,
    });

    return usuarios;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const usuario = await this.findOne(userId);

    // Verificar se o email já está em uso por outro usuário
    if (updateProfileDto.email && updateProfileDto.email !== usuario.email) {
      const existingUser = await this.findByEmail(updateProfileDto.email);
      if (existingUser) {
        throw new BadRequestException('Email já está em uso');
      }
    }

    const updatedUser = await this.prisma.usuario.update({
      where: { id: userId },
      data: {
        nome: updateProfileDto.name || usuario.nome,
        email: updateProfileDto.email || usuario.email,
        telefone: updateProfileDto.telefone || usuario.telefone,
        avatar: updateProfileDto.avatar || usuario.avatar,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        avatar: true,
        role: true,
        empresaId: true,
        ativo: true,
        ultimoLogin: true,
        createdAt: true,
        updatedAt: true,
        empresa: {
          select: {
            id: true,
            nome: true,
            slug: true,
          },
        },
      },
    });

    return updatedUser;
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: { id: true, senha: true },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      usuario.senha,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha atual incorreta');
    }

    const newPasswordHash = await bcrypt.hash(changePasswordDto.newPassword, 10);

    await this.prisma.usuario.update({
      where: { id: userId },
      data: { senha: newPasswordHash },
    });

    return { message: 'Senha alterada com sucesso' };
  }
}

