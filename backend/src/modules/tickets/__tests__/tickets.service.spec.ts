import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { TicketsService } from '../tickets.service';
import { CreateTicketDto, UpdateTicketDto } from '../dto/create-ticket.dto';

describe('TicketsService', () => {
  let service: TicketsService;
  let prismaService: PrismaService;

  const mockEmpresaId = 'empresa-1';
  const mockClienteId = 'cliente-1';
  const mockAgenteId = 'agente-1';

  const mockCliente = {
    id: mockClienteId,
    nome: 'Test Cliente',
    email: 'cliente@example.com',
    empresaId: mockEmpresaId,
  };

  const mockAgente = {
    id: mockAgenteId,
    nome: 'Test Agente',
    email: 'agente@example.com',
    empresaId: mockEmpresaId,
    role: 'AGENTE' as const,
  };

  const mockTicket = {
    id: 'ticket-1',
    titulo: 'Test Ticket',
    status: 'ABERTO' as const,
    prioridade: 'MEDIA' as const,
    canal: 'WEB',
    empresaId: mockEmpresaId,
    clienteId: mockClienteId,
    agenteId: mockAgenteId,
    cliente: mockCliente,
    agente: mockAgente,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: PrismaService,
          useValue: {
            conversa: {
              create: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            cliente: {
              findFirst: jest.fn(),
            },
            usuario: {
              findFirst: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTicket', () => {
    const createDto: CreateTicketDto = {
      titulo: 'Test Ticket',
      canal: 'WEB',
      clienteId: mockClienteId,
      agenteId: mockAgenteId,
      empresaId: mockEmpresaId,
    };

    it('should create a ticket successfully', async () => {
      jest.spyOn(prismaService.cliente, 'findFirst').mockResolvedValue(mockCliente as any);
      jest.spyOn(prismaService.usuario, 'findFirst').mockResolvedValue(mockAgente as any);
      jest.spyOn(prismaService.conversa, 'create').mockResolvedValue(mockTicket as any);

      const result = await service.createTicket(createDto, mockEmpresaId);

      expect(result).toBeDefined();
      expect(prismaService.conversa.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if cliente not found', async () => {
      jest.spyOn(prismaService.cliente, 'findFirst').mockResolvedValue(null);

      await expect(
        service.createTicket(createDto, mockEmpresaId)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if agente not found', async () => {
      jest.spyOn(prismaService.cliente, 'findFirst').mockResolvedValue(mockCliente as any);
      jest.spyOn(prismaService.usuario, 'findFirst').mockResolvedValue(null);

      await expect(
        service.createTicket(createDto, mockEmpresaId)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findTickets', () => {
    it('should return tickets for empresa', async () => {
      jest.spyOn(prismaService.conversa, 'findMany').mockResolvedValue([mockTicket] as any);

      const result = await service.findTickets(mockEmpresaId);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(prismaService.conversa.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { empresaId: mockEmpresaId },
        })
      );
    });
  });

  describe('updateTicket', () => {
    const updateDto: UpdateTicketDto = {
      status: 'RESOLVIDO',
    };

    it('should update ticket successfully', async () => {
      jest.spyOn(prismaService.conversa, 'findFirst').mockResolvedValue(mockTicket as any);
      jest.spyOn(prismaService.conversa, 'update').mockResolvedValue({
        ...mockTicket,
        ...updateDto,
        fechadaEm: new Date(),
      } as any);

      const result = await service.updateTicket('ticket-1', updateDto, mockEmpresaId);

      expect(result).toBeDefined();
      expect(prismaService.conversa.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if ticket not found', async () => {
      jest.spyOn(prismaService.conversa, 'findFirst').mockResolvedValue(null);

      await expect(
        service.updateTicket('non-existent', updateDto, mockEmpresaId)
      ).rejects.toThrow(NotFoundException);
    });

    it('should update fechadaEm when status is FECHADO or RESOLVIDO', async () => {
      const updateDtoFechado: UpdateTicketDto = {
        status: 'FECHADO',
      };

      jest.spyOn(prismaService.conversa, 'findFirst').mockResolvedValue(mockTicket as any);
      jest.spyOn(prismaService.conversa, 'update').mockResolvedValue({
        ...mockTicket,
        ...updateDtoFechado,
        fechadaEm: new Date(),
      } as any);

      const result = await service.updateTicket('ticket-1', updateDtoFechado, mockEmpresaId);

      expect(result).toBeDefined();
      expect(prismaService.conversa.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            fechadaEm: expect.any(Date),
          }),
        })
      );
    });
  });
});

