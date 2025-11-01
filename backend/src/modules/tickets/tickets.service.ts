import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto, UpdateTicketDto } from './dto/create-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async createTicket(createTicketDto: CreateTicketDto, empresaId: string) {
    // Validar que o cliente pertence à empresa
    const cliente = await this.prisma.cliente.findFirst({
      where: {
        id: createTicketDto.clienteId,
        empresaId,
      },
    });

    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado ou não pertence à sua empresa');
    }

    // Se houver agenteId, validar que pertence à empresa
    if (createTicketDto.agenteId) {
      const agente = await this.prisma.usuario.findFirst({
        where: {
          id: createTicketDto.agenteId,
          empresaId,
          role: { in: ['AGENTE', 'ADMIN'] },
        },
      });

      if (!agente) {
        throw new NotFoundException('Agente não encontrado ou não pertence à sua empresa');
      }
    }

    return this.prisma.conversa.create({
      data: {
        ...createTicketDto,
        empresaId,
        status: createTicketDto.status || 'ABERTO',
        prioridade: createTicketDto.prioridade || 'MEDIA',
      },
      include: {
        cliente: true,
        agente: true,
        empresa: {
          select: {
            id: true,
            nome: true,
            slug: true,
          },
        },
      },
    });
  }

  async findTickets(empresaId: string) {
    return this.prisma.conversa.findMany({
      where: { empresaId },
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
            avatar: true,
          },
        },
        agente: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            mensagens: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async updateTicket(id: string, updateTicketDto: UpdateTicketDto, empresaId: string) {
    const ticket = await this.prisma.conversa.findFirst({
      where: {
        id,
        empresaId,
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket não encontrado ou não pertence à sua empresa');
    }

    // Se estiver atualizando clienteId, validar que pertence à empresa
    if (updateTicketDto.clienteId && updateTicketDto.clienteId !== ticket.clienteId) {
      const cliente = await this.prisma.cliente.findFirst({
        where: {
          id: updateTicketDto.clienteId,
          empresaId,
        },
      });

      if (!cliente) {
        throw new NotFoundException('Cliente não encontrado ou não pertence à sua empresa');
      }
    }

    // Se estiver atualizando agenteId, validar que pertence à empresa
    if (updateTicketDto.agenteId && updateTicketDto.agenteId !== ticket.agenteId) {
      const agente = await this.prisma.usuario.findFirst({
        where: {
          id: updateTicketDto.agenteId,
          empresaId,
          role: { in: ['AGENTE', 'ADMIN'] },
        },
      });

      if (!agente) {
        throw new NotFoundException('Agente não encontrado ou não pertence à sua empresa');
      }
    }

    // Se o status for FECHADO ou RESOLVIDO, atualizar fechadaEm
    const updateData: any = { ...updateTicketDto };
    if (
      updateTicketDto.status === 'FECHADO' ||
      updateTicketDto.status === 'RESOLVIDO'
    ) {
      if (!ticket.fechadaEm) {
        updateData.fechadaEm = new Date();
      }
    }

    return this.prisma.conversa.update({
      where: { id },
      data: updateData,
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
            avatar: true,
          },
        },
        agente: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatar: true,
          },
        },
      },
    });
  }
}
