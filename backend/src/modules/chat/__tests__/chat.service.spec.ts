import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { ChatService } from '../chat.service';

describe('ChatService', () => {
  let service: ChatService;
  let prismaService: PrismaService;

  const mockEmpresaId = 'empresa-1';
  const mockUserId = 'user-1';
  const mockClienteId = 'cliente-1';

  const mockUsuario = {
    id: mockUserId,
    nome: 'Test User',
    email: 'test@example.com',
    role: 'AGENTE' as const,
    empresaId: mockEmpresaId,
    ativo: true,
  };

  const mockCliente = {
    id: mockClienteId,
    nome: 'Test Cliente',
    email: 'cliente@example.com',
    empresaId: mockEmpresaId,
  };

  const mockConversa = {
    id: 'conversa-1',
    titulo: 'Test Conversa',
    status: 'ABERTO' as const,
    prioridade: 'MEDIA' as const,
    canal: 'WEB',
    empresaId: mockEmpresaId,
    clienteId: mockClienteId,
    agenteId: mockUserId,
    cliente: mockCliente,
    agente: mockUsuario,
    mensagens: [],
    _count: { mensagens: 0 },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: PrismaService,
          useValue: {
            usuario: {
              findUnique: jest.fn(),
            },
            cliente: {
              findFirst: jest.fn(),
            },
            conversa: {
              findFirst: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
            },
            mensagem: {
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new conversa', async () => {
      const createDto = {
        userEmail: 'cliente@example.com',
        initialMessage: 'Hello',
      };

      jest.spyOn(prismaService.usuario, 'findUnique').mockResolvedValue(mockUsuario as any);
      jest.spyOn(prismaService.cliente, 'findFirst').mockResolvedValue(mockCliente as any);
      jest.spyOn(prismaService.conversa, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prismaService.conversa, 'create').mockResolvedValue(mockConversa as any);
      jest.spyOn(prismaService.mensagem, 'create').mockResolvedValue({} as any);

      const result = await service.create(mockUserId, createDto, mockEmpresaId);

      expect(result).toBeDefined();
      expect(prismaService.conversa.create).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if empresaId does not match', async () => {
      const createDto = {
        userEmail: 'cliente@example.com',
      };

      const usuarioWithDifferentEmpresa = {
        ...mockUsuario,
        empresaId: 'different-empresa',
      };

      jest.spyOn(prismaService.usuario, 'findUnique').mockResolvedValue(usuarioWithDifferentEmpresa as any);

      await expect(
        service.create(mockUserId, createDto, mockEmpresaId)
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if cliente not found', async () => {
      const createDto = {
        userEmail: 'cliente@example.com',
      };

      jest.spyOn(prismaService.usuario, 'findUnique').mockResolvedValue(mockUsuario as any);
      jest.spyOn(prismaService.cliente, 'findFirst').mockResolvedValue(null);

      await expect(
        service.create(mockUserId, createDto, mockEmpresaId)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return conversas for empresa', async () => {
      jest.spyOn(prismaService.usuario, 'findUnique').mockResolvedValue(mockUsuario as any);
      jest.spyOn(prismaService.conversa, 'findMany').mockResolvedValue([mockConversa] as any);

      const result = await service.findAll(mockUserId, mockEmpresaId);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(prismaService.conversa.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            empresaId: mockEmpresaId,
          }),
        })
      );
    });

    it('should throw ForbiddenException if empresaId does not match', async () => {
      const usuarioWithDifferentEmpresa = {
        ...mockUsuario,
        empresaId: 'different-empresa',
      };

      jest.spyOn(prismaService.usuario, 'findUnique').mockResolvedValue(usuarioWithDifferentEmpresa as any);

      await expect(
        service.findAll(mockUserId, mockEmpresaId)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findOne', () => {
    it('should return conversa by id', async () => {
      jest.spyOn(prismaService.conversa, 'findUnique').mockResolvedValue(mockConversa as any);
      jest.spyOn(prismaService.usuario, 'findUnique').mockResolvedValue(mockUsuario as any);

      const result = await service.findOne('conversa-1', mockUserId, mockEmpresaId);

      expect(result).toBeDefined();
      expect(result.id).toBe('conversa-1');
    });

    it('should throw NotFoundException if conversa not found', async () => {
      jest.spyOn(prismaService.conversa, 'findUnique').mockResolvedValue(null);

      await expect(
        service.findOne('non-existent', mockUserId, mockEmpresaId)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if empresaId does not match', async () => {
      const conversaWithDifferentEmpresa = {
        ...mockConversa,
        empresaId: 'different-empresa',
      };

      jest.spyOn(prismaService.conversa, 'findUnique').mockResolvedValue(conversaWithDifferentEmpresa as any);

      await expect(
        service.findOne('conversa-1', mockUserId, mockEmpresaId)
      ).rejects.toThrow(ForbiddenException);
    });
  });
});

