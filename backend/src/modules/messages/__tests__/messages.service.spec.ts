import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { MessagesService } from '../messages.service';
import { CreateMessageDto } from '../dto/create-message.dto';

describe('MessagesService', () => {
  let service: MessagesService;
  let prismaService: PrismaService;

  const mockEmpresaId = 'empresa-1';
  const mockUserId = 'user-1';
  const mockConversaId = 'conversa-1';
  const mockClienteId = 'cliente-1';

  const mockUsuario = {
    id: mockUserId,
    nome: 'Test User',
    email: 'test@example.com',
    role: 'AGENTE' as const,
    empresaId: mockEmpresaId,
  };

  const mockCliente = {
    id: mockClienteId,
    nome: 'Test Cliente',
    email: 'cliente@example.com',
  };

  const mockConversa = {
    id: mockConversaId,
    empresaId: mockEmpresaId,
    clienteId: mockClienteId,
    cliente: mockCliente,
    agente: mockUsuario,
  };

  const mockMensagem = {
    id: 'mensagem-1',
    conversaId: mockConversaId,
    conteudo: 'Test message',
    tipo: 'TEXTO' as const,
    remetente: 'agente' as const,
    isLida: false,
    agenteId: mockUserId,
    agente: mockUsuario,
    conversa: {
      cliente: mockCliente,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        {
          provide: PrismaService,
          useValue: {
            conversa: {
              findUnique: jest.fn(),
            },
            usuario: {
              findUnique: jest.fn(),
            },
            cliente: {
              findFirst: jest.fn(),
            },
            mensagem: {
              create: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateMessageDto = {
      chatId: mockConversaId,
      content: 'Test message',
      type: 'TEXTO',
    };

    it('should create a message successfully', async () => {
      jest.spyOn(prismaService.conversa, 'findUnique').mockResolvedValue(mockConversa as any);
      jest.spyOn(prismaService.usuario, 'findUnique').mockResolvedValue(mockUsuario as any);
      jest.spyOn(prismaService.mensagem, 'create').mockResolvedValue(mockMensagem as any);
      jest.spyOn(prismaService.conversa, 'update').mockResolvedValue(mockConversa as any);

      const result = await service.create(mockUserId, mockEmpresaId, createDto);

      expect(result).toBeDefined();
      expect(prismaService.mensagem.create).toHaveBeenCalled();
      expect(prismaService.conversa.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if conversa not found', async () => {
      jest.spyOn(prismaService.conversa, 'findUnique').mockResolvedValue(null);

      await expect(
        service.create(mockUserId, mockEmpresaId, createDto)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if empresaId does not match', async () => {
      const conversaWithDifferentEmpresa = {
        ...mockConversa,
        empresaId: 'different-empresa',
      };

      jest.spyOn(prismaService.conversa, 'findUnique').mockResolvedValue(conversaWithDifferentEmpresa as any);

      await expect(
        service.create(mockUserId, mockEmpresaId, createDto)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAll', () => {
    it('should return messages for conversa', async () => {
      jest.spyOn(prismaService.conversa, 'findUnique').mockResolvedValue(mockConversa as any);
      jest.spyOn(prismaService.usuario, 'findUnique').mockResolvedValue(mockUsuario as any);
      jest.spyOn(prismaService.mensagem, 'findMany').mockResolvedValue([mockMensagem] as any);

      const result = await service.findAll(mockConversaId, mockUserId, mockEmpresaId);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(prismaService.mensagem.findMany).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if empresaId does not match', async () => {
      const conversaWithDifferentEmpresa = {
        ...mockConversa,
        empresaId: 'different-empresa',
      };

      jest.spyOn(prismaService.conversa, 'findUnique').mockResolvedValue(conversaWithDifferentEmpresa as any);

      await expect(
        service.findAll(mockConversaId, mockUserId, mockEmpresaId)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('markAsRead', () => {
    it('should mark message as read', async () => {
      const mensagemWithConversa = {
        ...mockMensagem,
        conversa: mockConversa,
      };

      jest.spyOn(prismaService.mensagem, 'findUnique').mockResolvedValue(mensagemWithConversa as any);
      jest.spyOn(prismaService.mensagem, 'update').mockResolvedValue({
        ...mockMensagem,
        isLida: true,
      } as any);

      const result = await service.markAsRead('mensagem-1', mockUserId, mockEmpresaId);

      expect(result).toBeDefined();
      expect(prismaService.mensagem.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'mensagem-1' },
          data: { isLida: true },
        })
      );
    });

    it('should throw NotFoundException if message not found', async () => {
      jest.spyOn(prismaService.mensagem, 'findUnique').mockResolvedValue(null);

      await expect(
        service.markAsRead('non-existent', mockUserId, mockEmpresaId)
      ).rejects.toThrow(NotFoundException);
    });
  });
});

