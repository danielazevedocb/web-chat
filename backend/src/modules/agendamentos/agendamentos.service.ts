import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgendamentoDto, UpdateAgendamentoDto } from './dto/create-agendamento.dto';

@Injectable()
export class AgendamentosService {
  constructor(private prisma: PrismaService) {}

  async createAgendamento(createAgendamentoDto: CreateAgendamentoDto) {
    return this.prisma.agendamento.create({
      data: {
        ...createAgendamentoDto,
        dataHora: new Date(createAgendamentoDto.dataHora),
        status: createAgendamentoDto.status || 'AGENDADO',
      },
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

  async findAgendamentos(empresaId: string) {
    return this.prisma.agendamento.findMany({
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
      },
      orderBy: {
        dataHora: 'asc',
      },
    });
  }

  async updateAgendamento(id: string, updateAgendamentoDto: UpdateAgendamentoDto) {
    const agendamento = await this.prisma.agendamento.findUnique({
      where: { id },
    });

    if (!agendamento) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    const updateData: any = { ...updateAgendamentoDto };
    if (updateAgendamentoDto.dataHora) {
      updateData.dataHora = new Date(updateAgendamentoDto.dataHora);
    }

    return this.prisma.agendamento.update({
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
