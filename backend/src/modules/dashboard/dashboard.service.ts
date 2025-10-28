import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getMetrics(empresaId: string) {
    const [
      totalConversas,
      conversasAbertas,
      conversasFechadas,
      totalAgendamentos,
      agentesAtivos,
    ] = await Promise.all([
      this.prisma.conversa.count({ where: { empresaId } }),
      this.prisma.conversa.count({ 
        where: { 
          empresaId, 
          status: { in: ['ABERTO', 'EM_ANDAMENTO', 'AGUARDANDO'] } 
        } 
      }),
      this.prisma.conversa.count({ 
        where: { 
          empresaId, 
          status: { in: ['RESOLVIDO', 'FECHADO'] } 
        } 
      }),
      this.prisma.agendamento.count({ where: { empresaId } }),
      this.prisma.usuario.count({ 
        where: { 
          empresaId, 
          role: 'AGENTE',
          ativo: true 
        } 
      }),
    ]);

    return {
      totalConversas,
      conversasAbertas,
      conversasFechadas,
      totalAgendamentos,
      agentesAtivos,
      tempoMedioResposta: 0, // Calcular baseado nos dados
      satisfacaoMedia: 0, // Calcular baseado nos dados
    };
  }
}
