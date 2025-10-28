import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { JwtPayload } from '../../shared/types';
import { PrismaService } from '../prisma/prisma.service';
import { UsuariosService } from '../usuarios/usuarios.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, senha: string): Promise<any> {
    const usuario = await this.usuariosService.findByEmail(email);

    if (!usuario) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(senha, usuario.senha);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!usuario.ativo) {
      throw new UnauthorizedException('Usuário inativo');
    }

    const { senha: _, ...result } = usuario;
    return result;
  }

  async login(loginDto: LoginDto) {
    const usuario = await this.validateUser(loginDto.email, loginDto.senha);

    // Atualizar último login
    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: { ultimoLogin: new Date() },
    });

    const payload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email,
      role: usuario.role,
      empresaId: usuario.empresaId,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
    });

    return {
      accessToken,
      refreshToken,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        empresaId: usuario.empresaId,
        avatar: usuario.avatar,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usuariosService.findByEmail(
      registerDto.email,
    );

    if (existingUser) {
      throw new BadRequestException('Email já está em uso');
    }

    // Verificar se a empresa existe (se não for SUPER_ADMIN)
    if (registerDto.role !== 'SUPER_ADMIN' && registerDto.empresaId) {
      const empresa = await this.prisma.empresa.findUnique({
        where: { id: registerDto.empresaId },
      });

      if (!empresa) {
        throw new BadRequestException('Empresa não encontrada');
      }

      if (!empresa.ativo) {
        throw new BadRequestException('Empresa inativa');
      }
    }

    const senhaHash = await bcrypt.hash(registerDto.senha, 10);

    const usuario = await this.prisma.usuario.create({
      data: {
        nome: registerDto.nome,
        email: registerDto.email,
        senha: senhaHash,
        telefone: registerDto.telefone,
        role: registerDto.role,
        empresaId: registerDto.empresaId,
      },
    });

    const { senha: _, ...result } = usuario;
    return result;
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const usuario = await this.usuariosService.findById(payload.sub);

      if (!usuario || !usuario.ativo) {
        throw new UnauthorizedException('Usuário não encontrado ou inativo');
      }

      const newPayload: JwtPayload = {
        sub: usuario.id,
        email: usuario.email,
        role: usuario.role,
        empresaId: usuario.empresaId,
      };

      const newAccessToken = this.jwtService.sign(newPayload);
      const newRefreshToken = this.jwtService.sign(newPayload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Token de refresh inválido');
    }
  }

  async logout(userId: string) {
    // Aqui você pode implementar blacklist de tokens se necessário
    // Por enquanto, apenas retornamos sucesso
    return { message: 'Logout realizado com sucesso' };
  }

  async validateUserById(userId: string) {
    const usuario = await this.usuariosService.findById(userId);
    return usuario;
  }
}
