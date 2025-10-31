import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createMessageDto: CreateMessageDto) {
    // Verificar se o chat existe e o usuário é participante
    const chat = await this.prisma.chat.findUnique({
      where: { id: createMessageDto.chatId },
      include: {
        participants: {
          where: { userId },
        },
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat não encontrado');
    }

    if (chat.participants.length === 0) {
      throw new NotFoundException('Você não é participante deste chat');
    }

    // Criar mensagem
    const message = await this.prisma.message.create({
      data: {
        chatId: createMessageDto.chatId,
        senderId: userId,
        content: createMessageDto.content,
        type: createMessageDto.type,
        fileUrl: createMessageDto.fileUrl,
        fileSize: createMessageDto.fileSize,
        mimeType: createMessageDto.mimeType,
        replyToId: createMessageDto.replyToId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        replyTo: {
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

    // Atualizar timestamp do chat
    await this.prisma.chat.update({
      where: { id: createMessageDto.chatId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async findAll(chatId: string, userId: string, cursor?: string, limit = 50) {
    // Verificar se o usuário é participante
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: {
          where: { userId },
        },
      },
    });

    if (!chat || chat.participants.length === 0) {
      throw new NotFoundException('Chat não encontrado ou acesso negado');
    }

    const where: any = { chatId };
    if (cursor) {
      where.id = { lt: cursor };
    }

    const messages = await this.prisma.message.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        replyTo: {
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
        reads: {
          where: { userId },
        },
      },
    });

    // Inverter para ordem cronológica (mais antiga primeiro)
    return messages.reverse();
  }

  async markAsRead(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: {
        chat: {
          include: {
            participants: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!message || message.chat.participants.length === 0) {
      throw new NotFoundException('Mensagem não encontrada ou acesso negado');
    }

    // Verificar se já foi marcada como lida
    const existingRead = await this.prisma.messageRead.findUnique({
      where: {
        messageId_userId: {
          messageId,
          userId,
        },
      },
    });

    if (existingRead) {
      return existingRead;
    }

    return this.prisma.messageRead.create({
      data: {
        messageId,
        userId,
      },
    });
  }

  async markChatAsRead(chatId: string, userId: string) {
    // Verificar se o usuário é participante
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: {
          where: { userId },
        },
        messages: {
          where: {
            senderId: { not: userId },
            reads: {
              none: {
                userId,
              },
            },
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (!chat || chat.participants.length === 0) {
      throw new NotFoundException('Chat não encontrado ou acesso negado');
    }

    // Marcar todas as mensagens não lidas como lidas
    const messageIds = chat.messages.map((m) => m.id);
    if (messageIds.length === 0) {
      return { count: 0 };
    }

    await this.prisma.messageRead.createMany({
      data: messageIds.map((messageId) => ({
        messageId,
        userId,
      })),
      skipDuplicates: true,
    });

    // Atualizar lastReadAt do participante
    await this.prisma.chatParticipant.updateMany({
      where: {
        chatId,
        userId,
      },
      data: {
        lastReadAt: new Date(),
      },
    });

    return { count: messageIds.length };
  }
}

