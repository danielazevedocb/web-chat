import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { UsuariosService } from '../../usuarios/usuarios.service';
import { AuthService } from '../auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let usuariosService: UsuariosService;
  let jwtService: JwtService;
  let prismaService: PrismaService;

  const mockUsuario = {
    id: '1',
    nome: 'Test User',
    email: 'test@example.com',
    senha: 'hashedPassword',
    role: 'ADMIN' as const,
    empresaId: 'empresa1',
    ativo: true,
  };

  const mockJwtPayload = {
    sub: '1',
    email: 'test@example.com',
    role: 'ADMIN' as const,
    empresaId: 'empresa1',
  };

  const mockLoginDto = {
    email: 'test@example.com',
    senha: 'password123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsuariosService,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, any> = {
                JWT_SECRET: 'test-secret',
                JWT_EXPIRES_IN: '1h',
                JWT_REFRESH_SECRET: 'refresh-secret',
                JWT_REFRESH_EXPIRES_IN: '7d',
              };
              return config[key];
            }),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            usuario: {
              update: jest.fn(),
            },
            empresa: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usuariosService = module.get<UsuariosService>(UsuariosService);
    jwtService = module.get<JwtService>(JwtService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = { ...mockUsuario, senha: hashedPassword };

      jest.spyOn(usuariosService, 'findByEmail').mockResolvedValue(mockUser as any);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toBeDefined();
      expect(result.email).toBe('test@example.com');
      expect(result).not.toHaveProperty('senha');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      jest.spyOn(usuariosService, 'findByEmail').mockResolvedValue(null);

      await expect(
        service.validateUser('test@example.com', 'password123')
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const hashedPassword = await bcrypt.hash('wrongpassword', 10);
      const mockUser = { ...mockUsuario, senha: hashedPassword };

      jest.spyOn(usuariosService, 'findByEmail').mockResolvedValue(mockUser as any);

      await expect(
        service.validateUser('test@example.com', 'password123')
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = { ...mockUsuario, senha: hashedPassword, ativo: false };

      jest.spyOn(usuariosService, 'findByEmail').mockResolvedValue(mockUser as any);

      await expect(
        service.validateUser('test@example.com', 'password123')
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should login successfully and return tokens', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = { ...mockUsuario, senha: hashedPassword };

      jest.spyOn(usuariosService, 'findByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(prismaService.usuario, 'update').mockResolvedValue(mockUser as any);
      jest.spyOn(jwtService, 'sign').mockReturnValue('mock-access-token');
      
      (jwtService.sign as jest.Mock).mockReturnValueOnce('mock-access-token');
      (jwtService.sign as jest.Mock).mockReturnValueOnce('mock-refresh-token');

      const result = await service.login(mockLoginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('usuario');
      expect(result.usuario.email).toBe('test@example.com');
    });
  });

  describe('validateUserById', () => {
    it('should return user by id', async () => {
      jest.spyOn(usuariosService, 'findById').mockResolvedValue(mockUsuario as any);

      const result = await service.validateUserById('1');

      expect(result).toBeDefined();
      expect(result).toEqual(mockUsuario);
      expect(usuariosService.findById).toHaveBeenCalledWith('1');
    });
  });
});
