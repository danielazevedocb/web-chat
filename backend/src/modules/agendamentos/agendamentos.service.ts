import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgendamentoDto, UpdateAgendamentoDto } from './dto/create-agendamento.dto';

@Injectable()
export class AgendamentosService {
  constructor(private prisma: PrismaService) {}

  async createAgendamento(createAgendamentoDto: CreateAgendamentoDto, empresaId: string) {
    // Validar que o cliente pertence à empresa
    const cliente = await this.prisma.cliente.findFirst({
      where: {
        id: createAgendamentoDto.clienteId,
        empresaId,
      },
    });

    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado ou não pertence à sua empresa');
    }

    // Se houver agenteId, validar que pertence à empresa
    if (createAgendamentoDto.agenteId) {
      const agente = await this.prisma.usuario.findFirst({
        where: {
          id: createAgendamentoDto.agenteId,
          empresaId,
          role: { in: ['AGENTE', 'ADMIN'] },
        },
      });

      if (!agente) {
        throw new NotFoundException('Agente não encontrado ou não pertence à sua empresa');
      }
    }

    return this.prisma.agendamento.create({
      data: {
        ...createAgendamentoDto,
        empresaId,
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

  async updateAgendamento(id: string, updateAgendamentoDto: UpdateAgendamentoDto, empresaId: string) {
    const agendamento = await this.prisma.agendamento.findFirst({
      where: {
        id,
        empresaId,
      },
    });

    if (!agendamento) {
      throw new NotFoundException('Agendamento não encontrado ou não pertence à sua empresa');
    }

    // Se estiver atualizando clienteId, validar que pertence à empresa
    if (updateAgendamentoDto.clienteId && updateAgendamentoDto.clienteId !== agendamento.clienteId) {
      const cliente = await this.prisma.cliente.findFirst({
        where: {
          id: updateAgendamentoDto.clienteId,
          empresaId,
        },
      });

      if (!cliente) {
        throw new NotFoundException('Cliente não encontrado ou não pertence à sua empresa');
      }
    }

    // Se estiver atualizando agenteId, validar que pertence à empresa
    if (updateAgendamentoDto.agenteId && updateAgendamentoDto.agenteId !== agendamento.agenteId) {
      const agente = await this.prisma.usuario.findFirst({
        where: {
          id: updateAgendamentoDto.agenteId,
          empresaId,
          role: { in: ['AGENTE', 'ADMIN'] },
        },
      });

      if (!agente) {
        throw new NotFoundException('Agente não encontrado ou não pertence à sua empresa');
      }
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
