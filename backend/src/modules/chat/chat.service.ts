import { Injectable } from '@nestjs/common';
import { IAService } from '../ia/ia.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private iaService: IAService,
  ) {}

  async createConversa(data: any) {
    return this.prisma.conversa.create({
      data: {
        ...data,
        status: 'ABERTO',
        prioridade: 'MEDIA',
        tags: [],
      },
    });
  }

  async findConversas(empresaId: string, filters?: any) {
    const where: any = { empresaId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.prioridade) {
      where.prioridade = filters.prioridade;
    }

    if (filters?.canal) {
      where.canal = filters.canal;
    }

    if (filters?.search) {
      where.OR = [
        {
          cliente: { nome: { contains: filters.search, mode: 'insensitive' } },
        },
        {
          cliente: { email: { contains: filters.search, mode: 'insensitive' } },
        },
        { titulo: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.conversa.findMany({
      where,
      include: {
        cliente: true,
        agente: true,
        mensagens: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            mensagens: {
              where: {
                remetente: { not: 'agente' },
                isLida: false,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findConversaById(id: string) {
    return this.prisma.conversa.findUnique({
      where: { id },
      include: {
        cliente: true,
        agente: true,
        mensagens: {
          orderBy: { createdAt: 'asc' },
          include: {
            arquivos: true,
            agente: true,
          },
        },
      },
    });
  }

  async createMensagem(data: any) {
    const mensagem = await this.prisma.mensagem.create({
      data: {
        ...data,
        isLida: data.remetente === 'agente',
      },
      include: {
        arquivos: true,
        agente: true,
      },
    });

    // Atualizar timestamp da conversa
    await this.prisma.conversa.update({
      where: { id: data.conversaId },
      data: { updatedAt: new Date() },
    });

    return mensagem;
  }

  async findMensagens(
    conversaId: string,
    page: number = 1,
    limit: number = 50,
  ) {
    const skip = (page - 1) * limit;

    return this.prisma.mensagem.findMany({
      where: { conversaId },
      orderBy: { createdAt: 'asc' },
      include: {
        arquivos: true,
        agente: true,
      },
      skip,
      take: limit,
    });
  }

  async markMessagesAsRead(conversaId: string, agenteId: string) {
    return this.prisma.mensagem.updateMany({
      where: {
        conversaId,
        remetente: { not: 'agente' },
        isLida: false,
      },
      data: {
        isLida: true,
        lidaEm: new Date(),
      },
    });
  }

  async updateConversaStatus(id: string, status: string, agenteId?: string) {
    const updateData: any = { status };

    if (status === 'EM_ANDAMENTO' && agenteId) {
      updateData.agenteId = agenteId;
    }

    if (status === 'FECHADO') {
      updateData.fechadaEm = new Date();
    }

    return this.prisma.conversa.update({
      where: { id },
      data: updateData,
    });
  }

  async updateConversaPrioridade(
    id: string,
    prioridade: 'BAIXA' | 'MEDIA' | 'ALTA',
  ) {
    return this.prisma.conversa.update({
      where: { id },
      data: { prioridade },
    });
  }

  async addTagsToConversa(id: string, tags: string[]) {
    const conversa = await this.prisma.conversa.findUnique({
      where: { id },
      select: { tags: true },
    });

    const existingTags = conversa?.tags || [];
    const newTags = [...new Set([...existingTags, ...tags])];

    return this.prisma.conversa.update({
      where: { id },
      data: { tags: newTags },
    });
  }

  async removeTagFromConversa(id: string, tag: string) {
    const conversa = await this.prisma.conversa.findUnique({
      where: { id },
      select: { tags: true },
    });

    const updatedTags = (conversa?.tags || []).filter((t) => t !== tag);

    return this.prisma.conversa.update({
      where: { id },
      data: { tags: updatedTags },
    });
  }

  async generateIAResponse(
    empresaId: string,
    conversaId: string,
    mensagem: string,
  ) {
    // Buscar histórico da conversa
    const conversa = await this.findConversaById(conversaId);
    if (!conversa) {
      throw new Error('Conversa não encontrada');
    }

    // Preparar histórico para a IA
    const historico = conversa.mensagens.map((msg) => ({
      remetente: msg.remetente,
      conteudo: msg.conteudo,
      isIA: msg.isIA,
    }));

    // Gerar resposta com IA
    const respostaIA = await this.iaService.generateResponse(
      empresaId,
      mensagem,
      historico,
    );

    // Criar mensagem da IA
    const mensagemIA = await this.createMensagem({
      conversaId,
      conteudo: respostaIA,
      tipo: 'TEXTO',
      remetente: 'ia',
      isIA: true,
    });

    return mensagemIA;
  }

  async getChatMetrics(empresaId: string) {
    const [
      totalConversas,
      conversasAbertas,
      conversasFechadas,
      tempoMedioResposta,
      satisfacaoMedia,
      mensagensIA,
    ] = await Promise.all([
      this.prisma.conversa.count({
        where: { empresaId },
      }),
      this.prisma.conversa.count({
        where: { empresaId, status: 'ABERTO' },
      }),
      this.prisma.conversa.count({
        where: { empresaId, status: 'FECHADO' },
      }),
      this.prisma.conversa.aggregate({
        where: { empresaId, tempoResposta: { not: null } },
        _avg: { tempoResposta: true },
      }),
      this.prisma.conversa.aggregate({
        where: { empresaId, satisfacao: { not: null } },
        _avg: { satisfacao: true },
      }),
      this.prisma.mensagem.count({
        where: {
          conversa: { empresaId },
          isIA: true,
        },
      }),
    ]);

    return {
      totalConversas,
      conversasAbertas,
      conversasFechadas,
      tempoMedioResposta: tempoMedioResposta._avg.tempoResposta || 0,
      satisfacaoMedia: satisfacaoMedia._avg.satisfacao || 0,
      mensagensIA,
      taxaResolucaoIA:
        mensagensIA > 0 ? (mensagensIA / totalConversas) * 100 : 0,
    };
  }
}
