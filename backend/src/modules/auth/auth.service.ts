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

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    // LoginDto usa 'senha', mas vamos usar 'password' internamente
    const user = await this.validateUser(loginDto.email, loginDto.senha);

    const payload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload);

    // Atualizar último login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { 
        lastSeen: new Date(),
        isOnline: true,
      },
    });

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email já está em uso');
    }

    const passwordHash = await bcrypt.hash(registerDto.senha, 10);

    const user = await this.prisma.user.create({
      data: {
        name: registerDto.nome,
        email: registerDto.email,
        password: passwordHash,
      },
    });

    const { password: _, ...result } = user;
    return result;
  }

  async validateUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async logout(userId: string) {
    // Atualizar status offline
    await this.prisma.user.update({
      where: { id: userId },
      data: { 
        isOnline: false,
        lastSeen: new Date(),
      },
    });
    return { message: 'Logout realizado com sucesso' };
  }
}
