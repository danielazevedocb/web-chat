import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto, UpdateTicketDto } from './dto/create-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async createTicket(createTicketDto: CreateTicketDto) {
    return this.prisma.conversa.create({
      data: {
        ...createTicketDto,
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

  async updateTicket(id: string, updateTicketDto: UpdateTicketDto) {
    const ticket = await this.prisma.conversa.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket não encontrado');
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
