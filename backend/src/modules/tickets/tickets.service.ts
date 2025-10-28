import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async createTicket(data: any) {
    return this.prisma.conversa.create({ data });
  }

  async findTickets(empresaId: string) {
    return this.prisma.conversa.findMany({
      where: { empresaId },
      include: {
        cliente: true,
        agente: true,
      },
    });
  }

  async updateTicket(id: string, data: any) {
    return this.prisma.conversa.update({
      where: { id },
      data,
    });
  }
}
