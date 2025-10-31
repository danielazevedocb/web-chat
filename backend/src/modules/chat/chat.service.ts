import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createChatDto: CreateChatDto) {
    // Buscar o usuário pelo email
    const otherUser = await this.prisma.user.findUnique({
      where: { email: createChatDto.userEmail },
    });

    if (!otherUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (otherUser.id === userId) {
      throw new BadRequestException('Não é possível criar chat consigo mesmo');
    }

    // Verificar se já existe um chat direto entre esses dois usuários
    const existingChat = await this.prisma.chat.findFirst({
      where: {
        type: 'DIRECT',
        participants: {
          every: {
            userId: {
              in: [userId, otherUser.id],
            },
          },
        },
      },
      include: {
        participants: true,
      },
    });

    // Se já existe um chat direto, retornar ele
    if (existingChat) {
      const hasBothUsers =
        existingChat.participants.length === 2 &&
        existingChat.participants.some((p) => p.userId === userId) &&
        existingChat.participants.some((p) => p.userId === otherUser.id);

      if (hasBothUsers) {
        return this.findOne(existingChat.id, userId);
      }
    }

    // Criar novo chat direto
    const chat = await this.prisma.chat.create({
      data: {
        type: 'DIRECT',
        participants: {
          create: [
            { userId },
            { userId: otherUser.id },
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                isOnline: true,
                lastSeen: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    // Se há mensagem inicial, criar ela
    if (createChatDto.initialMessage) {
      await this.prisma.message.create({
        data: {
          chatId: chat.id,
          senderId: userId,
          content: createChatDto.initialMessage,
          type: 'TEXT',
        },
      });

      // Buscar chat atualizado com a mensagem
      return this.findOne(chat.id, userId);
    }

    return this.formatChatResponse(chat, userId);
  }

  async findAll(userId: string, search?: string) {
    const chats = await this.prisma.chat.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
        ...(search && {
          participants: {
            some: {
              user: {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { email: { contains: search, mode: 'insensitive' } },
                ],
              },
            },
          },
        }),
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                isOnline: true,
                lastSeen: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                senderId: { not: userId },
                reads: {
                  none: {
                    userId,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return chats.map((chat) => this.formatChatResponse(chat, userId));
  }

  async findOne(id: string, userId: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                isOnline: true,
                lastSeen: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                senderId: { not: userId },
                reads: {
                  none: {
                    userId,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat não encontrado');
    }

    // Verificar se o usuário é participante
    const isParticipant = chat.participants.some((p) => p.userId === userId);
    if (!isParticipant) {
      throw new NotFoundException('Acesso negado');
    }

    return this.formatChatResponse(chat, userId);
  }

  async getParticipants(chatId: string, userId: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                isOnline: true,
                lastSeen: true,
              },
            },
          },
        },
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat não encontrado');
    }

    const isParticipant = chat.participants.some((p) => p.userId === userId);
    if (!isParticipant) {
      throw new NotFoundException('Acesso negado');
    }

    return chat.participants.map((p) => p.user);
  }

  private formatChatResponse(chat: any, currentUserId: string) {
    // Para chat direto, encontrar o outro participante
    const otherParticipant = chat.participants.find(
      (p: any) => p.userId !== currentUserId,
    );

    return {
      id: chat.id,
      type: chat.type,
      name: chat.name || otherParticipant?.user?.name,
      otherUser: otherParticipant?.user,
      lastMessage: chat.messages[0] || null,
      unreadCount: chat._count?.messages || 0,
      updatedAt: chat.updatedAt,
      createdAt: chat.createdAt,
    };
  }
}
