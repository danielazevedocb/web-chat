import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, senha: string): Promise<any> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!usuario.ativo) {
      throw new UnauthorizedException('Usuário inativo');
    }

    const isPasswordValid = await bcrypt.compare(senha, usuario.senha);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const { senha: _, ...result } = usuario;
    return result;
  }

  async login(loginDto: LoginDto) {
    const usuario = await this.validateUser(loginDto.email, loginDto.senha);

    const payload = {
      sub: usuario.id,
      email: usuario.email,
      role: usuario.role,
      empresaId: usuario.empresaId,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '24h'),
    });

    const refreshToken = this.jwtService.sign(
      { sub: usuario.id, type: 'refresh' },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_EXPIRES_IN',
          '7d',
        ),
      },
    );

    // Atualizar último login
    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        ultimoLogin: new Date(),
      },
    });

    return {
      accessToken,
      refreshToken,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        avatar: usuario.avatar,
        role: usuario.role,
        empresaId: usuario.empresaId,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUsuario = await this.prisma.usuario.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUsuario) {
      throw new BadRequestException('Email já está em uso');
    }

    const senhaHash = await bcrypt.hash(registerDto.senha, 10);

    const usuario = await this.prisma.usuario.create({
      data: {
        nome: registerDto.nome,
        email: registerDto.email,
        senha: senhaHash,
        role: 'AGENTE', // Role padrão, pode ser ajustado conforme necessidade
        ativo: true,
      },
    });

    const { senha: _, ...result } = usuario;
    return result;
  }

  async validateUserById(userId: string) {
    return this.prisma.usuario.findUnique({
      where: { id: userId },
    });
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Token inválido');
      }

      const usuario = await this.validateUserById(payload.sub);

      if (!usuario || !usuario.ativo) {
        throw new UnauthorizedException('Usuário não encontrado ou inativo');
      }

      const newPayload = {
        sub: usuario.id,
        email: usuario.email,
        role: usuario.role,
        empresaId: usuario.empresaId,
      };

      const accessToken = this.jwtService.sign(newPayload, {
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '24h'),
      });

      return {
        accessToken,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          avatar: usuario.avatar,
          role: usuario.role,
          empresaId: usuario.empresaId,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }
  }

  async logout(userId: string) {
    await this.prisma.usuario.update({
      where: { id: userId },
      data: {
        ultimoLogin: new Date(),
      },
    });
    return { message: 'Logout realizado com sucesso' };
  }
}
