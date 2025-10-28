import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AgendamentosService {
  constructor(private prisma: PrismaService) {}

  async createAgendamento(data: any) {
    return this.prisma.agendamento.create({ data });
  }

  async findAgendamentos(empresaId: string) {
    return this.prisma.agendamento.findMany({
      where: { empresaId },
      include: {
        cliente: true,
        agente: true,
      },
    });
  }

  async updateAgendamento(id: string, data: any) {
    return this.prisma.agendamento.update({
      where: { id },
      data,
    });
  }
}
