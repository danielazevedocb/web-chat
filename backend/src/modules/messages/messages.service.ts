import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, empresaId: string, createMessageDto: CreateMessageDto) {
    // Verificar se a conversa existe e validar empresaId
    const conversa = await this.prisma.conversa.findUnique({
      where: { id: createMessageDto.chatId },
      include: {
        cliente: true,
        agente: true,
      },
    });

    if (!conversa) {
      throw new NotFoundException('Conversa não encontrada');
    }

    // Validar empresaId
    if (conversa.empresaId !== empresaId) {
      throw new ForbiddenException('Acesso negado: conversa não pertence à sua empresa');
    }

    // Buscar usuário para determinar remetente
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Determinar remetente: se for agente/admin, remetente é 'agente', senão é 'cliente'
    const remetente = usuario.role === 'AGENTE' || usuario.role === 'ADMIN' || usuario.role === 'SUPER_ADMIN' 
      ? 'agente' 
      : 'cliente';

    // Validar acesso: agente pode enviar em qualquer conversa da empresa
    // Cliente só pode enviar em suas próprias conversas
    if (remetente === 'cliente') {
      const cliente = await this.prisma.cliente.findFirst({
        where: {
          email: usuario.email,
          empresaId,
        },
      });

      if (!cliente || conversa.clienteId !== cliente.id) {
        throw new ForbiddenException('Acesso negado: você não tem permissão para enviar mensagens nesta conversa');
      }
    }

    // Criar mensagem
    const mensagem = await this.prisma.mensagem.create({
      data: {
        conversaId: createMessageDto.chatId,
        conteudo: createMessageDto.content,
        tipo: createMessageDto.type,
        remetente,
        agenteId: remetente === 'agente' ? userId : null,
        arquivoUrl: createMessageDto.fileUrl,
        arquivoTipo: createMessageDto.mimeType,
        isLida: false,
      },
      include: {
        agente: remetente === 'agente' ? {
          select: {
            id: true,
            nome: true,
            email: true,
            avatar: true,
          },
        } : false,
        conversa: {
          select: {
            id: true,
            cliente: {
              select: {
                id: true,
                nome: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    // Atualizar timestamp da conversa
    await this.prisma.conversa.update({
      where: { id: createMessageDto.chatId },
      data: { updatedAt: new Date() },
    });

    // Formatar resposta
    return {
      ...mensagem,
      sender: remetente === 'agente' ? mensagem.agente : {
        id: conversa.cliente.id,
        nome: conversa.cliente.nome,
        email: conversa.cliente.email,
        avatar: conversa.cliente.avatar,
      },
    };
  }

  async findAll(conversaId: string, userId: string, empresaId: string, cursor?: string, limit = 50) {
    // Verificar se a conversa existe e validar empresaId
    const conversa = await this.prisma.conversa.findUnique({
      where: { id: conversaId },
    });

    if (!conversa) {
      throw new NotFoundException('Conversa não encontrada');
    }

    // Validar empresaId
    if (conversa.empresaId !== empresaId) {
      throw new ForbiddenException('Acesso negado: conversa não pertence à sua empresa');
    }

    // Buscar usuário para validar acesso
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Validar acesso: agente/admin pode ver qualquer conversa da empresa
    // Cliente só pode ver suas próprias conversas
    if (usuario.role !== 'AGENTE' && usuario.role !== 'ADMIN' && usuario.role !== 'SUPER_ADMIN') {
      const cliente = await this.prisma.cliente.findFirst({
        where: {
          email: usuario.email,
          empresaId,
        },
      });

      if (!cliente || conversa.clienteId !== cliente.id) {
        throw new ForbiddenException('Acesso negado');
      }
    }

    const where: any = { conversaId };
    if (cursor) {
      where.id = { lt: cursor };
    }

    const mensagens = await this.prisma.mensagem.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        agente: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatar: true,
          },
        },
        conversa: {
          select: {
            cliente: {
              select: {
                id: true,
                nome: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    // Formatar mensagens para incluir informações do remetente
    const mensagensFormatadas = mensagens.map((msg) => {
      const sender = msg.remetente === 'agente' && msg.agente
        ? {
            id: msg.agente.id,
            nome: msg.agente.nome,
            email: msg.agente.email,
            avatar: msg.agente.avatar,
          }
        : {
            id: msg.conversa.cliente.id,
            nome: msg.conversa.cliente.nome,
            email: msg.conversa.cliente.email,
            avatar: msg.conversa.cliente.avatar,
          };

      return {
        ...msg,
        sender,
      };
    });

    // Inverter para ordem cronológica (mais antiga primeiro)
    return mensagensFormatadas.reverse();
  }

  async markAsRead(messageId: string, userId: string, empresaId: string) {
    const mensagem = await this.prisma.mensagem.findUnique({
      where: { id: messageId },
      include: {
        conversa: true,
      },
    });

    if (!mensagem) {
      throw new NotFoundException('Mensagem não encontrada');
    }

    // Validar empresaId
    if (mensagem.conversa.empresaId !== empresaId) {
      throw new ForbiddenException('Acesso negado');
    }

    // Marcar como lida
    return this.prisma.mensagem.update({
      where: { id: messageId },
      data: { isLida: true },
    });
  }

  async markChatAsRead(conversaId: string, userId: string, empresaId: string) {
    // Verificar se a conversa existe e validar empresaId
    const conversa = await this.prisma.conversa.findUnique({
      where: { id: conversaId },
    });

    if (!conversa) {
      throw new NotFoundException('Conversa não encontrada');
    }

    // Validar empresaId
    if (conversa.empresaId !== empresaId) {
      throw new ForbiddenException('Acesso negado');
    }

    // Buscar usuário para determinar quais mensagens marcar como lidas
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Determinar quais mensagens marcar como lidas
    // Se for agente, marca mensagens do cliente como lidas
    // Se for cliente, marca mensagens do agente como lidas
    const remetenteFiltro = usuario.role === 'AGENTE' || usuario.role === 'ADMIN' || usuario.role === 'SUPER_ADMIN'
      ? 'cliente'
      : 'agente';

    // Buscar mensagens não lidas do outro remetente
    const mensagensNaoLidas = await this.prisma.mensagem.findMany({
      where: {
        conversaId,
        remetente: remetenteFiltro,
        isLida: false,
      },
      select: {
        id: true,
      },
    });

    if (mensagensNaoLidas.length === 0) {
      return { count: 0 };
    }

    // Marcar todas como lidas
    await this.prisma.mensagem.updateMany({
      where: {
        id: {
          in: mensagensNaoLidas.map((m) => m.id),
        },
      },
      data: {
        isLida: true,
      },
    });

    return { count: mensagensNaoLidas.length };
  }
}

