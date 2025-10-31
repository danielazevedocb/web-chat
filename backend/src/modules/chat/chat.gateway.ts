import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateMessageDto } from '../messages/dto/create-message.dto';
import { MessagesService } from '../messages/messages.service';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // socketId -> userId

  constructor(
    private messagesService: MessagesService,
    private configService: ConfigService,
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    console.log(`Cliente conectado: ${client.id}`);
    
    try {
      // Tentar obter userId do auth ou do token
      let userId = client.handshake.auth?.userId;
      
      // Se não tiver userId, tentar decodificar o token
      if (!userId && client.handshake.auth?.token) {
        try {
          const payload = this.jwtService.verify(client.handshake.auth.token, {
            secret: this.configService.get('JWT_SECRET'),
          });
          userId = payload.sub;
        } catch (error) {
          console.error('Token inválido:', error);
          client.disconnect();
          return;
        }
      }

      if (userId) {
        this.connectedUsers.set(client.id, userId);
        
        // Atualizar status online no banco
        await this.prisma.user.update({
          where: { id: userId },
          data: { 
            isOnline: true,
            lastSeen: new Date(),
          },
        });

        // Notificar que o usuário está online
        client.broadcast.emit('user-online', { userId });
      } else {
        console.warn('Usuário não autenticado, desconectando...');
        client.disconnect();
      }
    } catch (error) {
      console.error('Erro ao processar conexão:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
    const userId = this.connectedUsers.get(client.id);
    
    if (userId) {
      this.connectedUsers.delete(client.id);
      
      // Verificar se o usuário ainda tem outras conexões ativas
      const hasOtherConnections = Array.from(this.connectedUsers.values()).includes(userId);
      
      if (!hasOtherConnections) {
        // Atualizar status offline no banco apenas se não houver outras conexões
        await this.prisma.user.update({
          where: { id: userId },
          data: { 
            isOnline: false,
            lastSeen: new Date(),
          },
        });
      }

      // Notificar que o usuário está offline
      client.broadcast.emit('user-offline', { userId });
    }
  }

  @SubscribeMessage('join-chat')
  handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    client.join(`chat_${data.chatId}`);
    console.log(`Cliente ${client.id} entrou no chat ${data.chatId}`);
  }

  @SubscribeMessage('leave-chat')
  handleLeaveChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    client.leave(`chat_${data.chatId}`);
    console.log(`Cliente ${client.id} saiu do chat ${data.chatId}`);
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: CreateMessageDto & { userId: string },
  ) {
    try {
      const message = await this.messagesService.create(data.userId, {
        chatId: data.chatId,
        content: data.content,
        type: data.type,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        replyToId: data.replyToId,
      });

      // Enviar mensagem para todos os clientes no chat
      this.server.to(`chat_${data.chatId}`).emit('message', message);

      // Notificar sobre nova mensagem (para atualizar lista de chats)
      this.server.emit('new-message', {
        chatId: data.chatId,
        message,
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      client.emit('error', { message: 'Erro ao enviar mensagem' });
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string; userId: string },
  ) {
    client.to(`chat_${data.chatId}`).emit('typing', {
      userId: data.userId,
      chatId: data.chatId,
    });
  }

  @SubscribeMessage('stop-typing')
  handleStopTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string; userId: string },
  ) {
    client.to(`chat_${data.chatId}`).emit('stop-typing', {
      userId: data.userId,
      chatId: data.chatId,
    });
  }

  @SubscribeMessage('message-read')
  async handleMessageRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string; userId: string },
  ) {
    try {
      await this.messagesService.markAsRead(data.messageId, data.userId);

      // Notificar outros clientes que a mensagem foi lida
      client.broadcast.emit('message-read', {
        messageId: data.messageId,
        userId: data.userId,
      });
    } catch (error) {
      console.error('Erro ao marcar mensagem como lida:', error);
      client.emit('error', { message: 'Erro ao marcar mensagem como lida' });
    }
  }

  // Método para notificar sobre mudanças nos chats
  notifyChatUpdate(chat: any) {
    this.server.emit('chat-updated', chat);
  }

  // Método para notificar sobre novos chats
  notifyNewChat(chat: any) {
    this.server.emit('new-chat', chat);
  }
}
