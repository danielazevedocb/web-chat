import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createChatDto: CreateChatDto, empresaId: string) {
    // Buscar o usuário atual para validar empresaId
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
      include: { empresa: true },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Validar que o usuário pertence à empresa
    if (usuario.empresaId !== empresaId) {
      throw new ForbiddenException('Acesso negado: empresa não corresponde');
    }

    // Para sistema de atendimento, precisamos de clienteId
    // Se userEmail for fornecido, buscar cliente por email
    let clienteId: string | undefined;
    
    if (createChatDto.userEmail) {
      const cliente = await this.prisma.cliente.findFirst({
        where: {
          email: createChatDto.userEmail,
          empresaId,
        },
      });

      if (!cliente) {
        throw new NotFoundException('Cliente não encontrado para esta empresa');
      }

      clienteId = cliente.id;
    } else {
      throw new BadRequestException('É necessário fornecer email do cliente ou clienteId');
    }

    // Verificar se já existe uma conversa aberta com este cliente
    const existingConversa = await this.prisma.conversa.findFirst({
      where: {
        empresaId,
        clienteId,
        status: {
          in: ['ABERTO', 'EM_ANDAMENTO'],
        },
      },
      include: {
        cliente: true,
        agente: true,
        mensagens: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    // Se já existe conversa aberta, retornar ela
    if (existingConversa) {
      return this.formatConversaResponse(existingConversa, userId);
    }

    // Criar nova conversa de atendimento
    const conversa = await this.prisma.conversa.create({
      data: {
        empresaId,
        clienteId,
        agenteId: usuario.role === 'AGENTE' || usuario.role === 'ADMIN' ? userId : null,
        canal: 'WEB',
        status: 'ABERTO',
        prioridade: 'MEDIA',
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
        mensagens: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            mensagens: {
              where: {
                remetente: 'cliente',
                isLida: false,
              },
            },
          },
        },
      },
    });

    // Se há mensagem inicial, criar ela
    if (createChatDto.initialMessage) {
      await this.prisma.mensagem.create({
        data: {
          conversaId: conversa.id,
          conteudo: createChatDto.initialMessage,
          tipo: 'TEXTO',
          remetente: usuario.role === 'AGENTE' || usuario.role === 'ADMIN' ? 'agente' : 'cliente',
          agenteId: usuario.role === 'AGENTE' || usuario.role === 'ADMIN' ? userId : null,
        },
      });

      // Buscar conversa atualizada com a mensagem
      return this.findOne(conversa.id, userId, empresaId);
    }

    return this.formatConversaResponse(conversa, userId);
  }

  async findAll(userId: string, empresaId: string, search?: string) {
    // Buscar usuário para validar empresaId e role
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!usuario || usuario.empresaId !== empresaId) {
      throw new ForbiddenException('Acesso negado');
    }

    const where: any = {
      empresaId,
    };

    // Se for agente ou admin, pode ver todas as conversas da empresa
    // Se for cliente, só vê suas próprias conversas
    if (usuario.role === 'AGENTE' || usuario.role === 'ADMIN' || usuario.role === 'SUPER_ADMIN') {
      // Agentes e admins veem todas as conversas da empresa
      if (search) {
        where.OR = [
          { titulo: { contains: search, mode: 'insensitive' } },
          { cliente: { nome: { contains: search, mode: 'insensitive' } } },
          { cliente: { email: { contains: search, mode: 'insensitive' } } },
        ];
      }
    } else {
      // Clientes só veem suas próprias conversas
      // Mas no modelo atual, Cliente é uma entidade separada de Usuario
      // Precisamos encontrar o cliente associado ao usuário
      const cliente = await this.prisma.cliente.findFirst({
        where: {
          email: usuario.email,
          empresaId,
        },
      });

      if (cliente) {
        where.clienteId = cliente.id;
      } else {
        // Se não há cliente associado, retornar array vazio
        return [];
      }
    }

    const conversas = await this.prisma.conversa.findMany({
      where,
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
        mensagens: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            mensagens: {
              where: {
                remetente: usuario.role === 'AGENTE' || usuario.role === 'ADMIN' ? 'cliente' : 'agente',
                isLida: false,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return conversas.map((conversa) => this.formatConversaResponse(conversa, userId));
  }

  async findOne(id: string, userId: string, empresaId: string) {
    const conversa = await this.prisma.conversa.findUnique({
      where: { id },
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
        mensagens: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            mensagens: {
              where: {
                isLida: false,
              },
            },
          },
        },
      },
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
        throw new ForbiddenException('Acesso negado: você não tem permissão para ver esta conversa');
      }
    }

    return this.formatConversaResponse(conversa, userId);
  }

  async getParticipants(conversaId: string, userId: string, empresaId: string) {
    const conversa = await this.prisma.conversa.findUnique({
      where: { id: conversaId },
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
      throw new ForbiddenException('Acesso negado');
    }

    const participants = [];

    // Adicionar cliente
    if (conversa.cliente) {
      participants.push({
        id: conversa.cliente.id,
        nome: conversa.cliente.nome,
        email: conversa.cliente.email,
        avatar: conversa.cliente.avatar,
        role: 'cliente',
      });
    }

    // Adicionar agente se existir
    if (conversa.agente) {
      participants.push({
        id: conversa.agente.id,
        nome: conversa.agente.nome,
        email: conversa.agente.email,
        avatar: conversa.agente.avatar,
        role: conversa.agente.role,
      });
    }

    return participants;
  }

  private formatConversaResponse(conversa: any, currentUserId: string) {
    return {
      id: conversa.id,
      titulo: conversa.titulo || `Conversa com ${conversa.cliente?.nome || 'Cliente'}`,
      status: conversa.status,
      prioridade: conversa.prioridade,
      canal: conversa.canal,
      cliente: conversa.cliente,
      agente: conversa.agente,
      lastMessage: conversa.mensagens?.[0] || null,
      unreadCount: conversa._count?.mensagens || 0,
      updatedAt: conversa.updatedAt,
      createdAt: conversa.createdAt,
    };
  }
}
