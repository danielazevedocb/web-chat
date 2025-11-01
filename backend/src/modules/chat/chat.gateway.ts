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

interface SocketUser {
  userId: string;
  empresaId: string;
  role: string;
}

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

  private connectedUsers = new Map<string, SocketUser>(); // socketId -> user info

  constructor(
    private messagesService: MessagesService,
    private configService: ConfigService,
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    console.log(`Cliente conectado: ${client.id}`);
    
    try {
      // Obter token do handshake
      const token = client.handshake.auth?.token;
      
      if (!token) {
        console.warn('Token não fornecido, desconectando...');
        client.disconnect();
        return;
      }

      // Validar e decodificar token
      let payload: any;
      try {
        payload = this.jwtService.verify(token, {
          secret: this.configService.get('JWT_SECRET'),
        });
      } catch (error) {
        console.error('Token inválido:', error);
        client.disconnect();
        return;
      }

      const userId = payload.sub;
      const empresaId = payload.empresaId;
      const role = payload.role;

      if (!userId || !empresaId) {
        console.warn('Token incompleto, desconectando...');
        client.disconnect();
        return;
      }

      // Verificar se o usuário existe e está ativo
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          empresaId: true,
          role: true,
          ativo: true,
        },
      });

      if (!usuario || !usuario.ativo) {
        console.warn('Usuário não encontrado ou inativo, desconectando...');
        client.disconnect();
        return;
      }

      // Validar empresaId
      if (usuario.empresaId !== empresaId) {
        console.warn('EmpresaId não corresponde, desconectando...');
        client.disconnect();
        return;
      }

      // Armazenar informações do usuário
      this.connectedUsers.set(client.id, {
        userId,
        empresaId,
        role,
      });

      // Atualizar último login
      await this.prisma.usuario.update({
        where: { id: userId },
        data: { 
          ultimoLogin: new Date(),
        },
      });

      // Notificar que o usuário está online (apenas para usuários da mesma empresa)
      client.broadcast.emit('user-online', { userId, empresaId });
      
      console.log(`Usuário ${userId} conectado na empresa ${empresaId}`);
    } catch (error) {
      console.error('Erro ao processar conexão:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
    const userInfo = this.connectedUsers.get(client.id);
    
    if (userInfo) {
      this.connectedUsers.delete(client.id);
      
      // Verificar se o usuário ainda tem outras conexões ativas
      const hasOtherConnections = Array.from(this.connectedUsers.values()).some(
        (u) => u.userId === userInfo.userId,
      );
      
      // Notificar que o usuário está offline (apenas se não houver outras conexões)
      if (!hasOtherConnections) {
        client.broadcast.emit('user-offline', { 
          userId: userInfo.userId,
          empresaId: userInfo.empresaId,
        });
      }
    }
  }

  private async validateConversaAccess(
    conversaId: string,
    empresaId: string,
    userId: string,
  ): Promise<boolean> {
    try {
      const conversa = await this.prisma.conversa.findUnique({
        where: { id: conversaId },
        select: { empresaId: true, clienteId: true, agenteId: true },
      });

      if (!conversa) {
        return false;
      }

      // Validar empresaId
      if (conversa.empresaId !== empresaId) {
        return false;
      }

      // Buscar usuário para validar acesso
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: userId },
        select: { role: true, email: true },
      });

      if (!usuario) {
        return false;
      }

      // Agente/admin pode acessar qualquer conversa da empresa
      if (usuario.role === 'AGENTE' || usuario.role === 'ADMIN' || usuario.role === 'SUPER_ADMIN') {
        return true;
      }

      // Cliente só pode acessar suas próprias conversas
      const cliente = await this.prisma.cliente.findFirst({
        where: {
          email: usuario.email,
          empresaId,
        },
      });

      return cliente ? conversa.clienteId === cliente.id : false;
    } catch (error) {
      console.error('Erro ao validar acesso à conversa:', error);
      return false;
    }
  }

  @SubscribeMessage('join-chat')
  async handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    const userInfo = this.connectedUsers.get(client.id);
    
    if (!userInfo) {
      client.emit('error', { message: 'Usuário não autenticado' });
      return;
    }

    // Validar acesso à conversa
    const hasAccess = await this.validateConversaAccess(
      data.chatId,
      userInfo.empresaId,
      userInfo.userId,
    );

    if (!hasAccess) {
      client.emit('error', { message: 'Acesso negado a esta conversa' });
      return;
    }

    client.join(`conversa_${data.chatId}`);
    console.log(`Cliente ${client.id} entrou na conversa ${data.chatId}`);
  }

  @SubscribeMessage('leave-chat')
  handleLeaveChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    client.leave(`conversa_${data.chatId}`);
    console.log(`Cliente ${client.id} saiu da conversa ${data.chatId}`);
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: CreateMessageDto,
  ) {
    const userInfo = this.connectedUsers.get(client.id);
    
    if (!userInfo) {
      client.emit('error', { message: 'Usuário não autenticado' });
      return;
    }

    try {
      // Validar acesso à conversa
      const hasAccess = await this.validateConversaAccess(
        data.chatId,
        userInfo.empresaId,
        userInfo.userId,
      );

      if (!hasAccess) {
        client.emit('error', { message: 'Acesso negado a esta conversa' });
        return;
      }

      const message = await this.messagesService.create(
        userInfo.userId,
        userInfo.empresaId,
        {
          chatId: data.chatId,
          content: data.content,
          type: data.type,
          fileUrl: data.fileUrl,
          fileSize: data.fileSize,
          mimeType: data.mimeType,
          replyToId: data.replyToId,
        },
      );

      // Enviar mensagem para todos os clientes na conversa
      this.server.to(`conversa_${data.chatId}`).emit('message', message);

      // Notificar sobre nova mensagem (apenas para usuários da mesma empresa)
      this.server.to(`empresa_${userInfo.empresaId}`).emit('new-message', {
        conversaId: data.chatId,
        message,
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      client.emit('error', { 
        message: error instanceof Error ? error.message : 'Erro ao enviar mensagem' 
      });
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    const userInfo = this.connectedUsers.get(client.id);
    
    if (!userInfo) {
      return;
    }

    // Validar acesso à conversa
    const hasAccess = await this.validateConversaAccess(
      data.chatId,
      userInfo.empresaId,
      userInfo.userId,
    );

    if (!hasAccess) {
      return;
    }

    client.to(`conversa_${data.chatId}`).emit('typing', {
      userId: userInfo.userId,
      conversaId: data.chatId,
    });
  }

  @SubscribeMessage('stop-typing')
  async handleStopTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    const userInfo = this.connectedUsers.get(client.id);
    
    if (!userInfo) {
      return;
    }

    // Validar acesso à conversa
    const hasAccess = await this.validateConversaAccess(
      data.chatId,
      userInfo.empresaId,
      userInfo.userId,
    );

    if (!hasAccess) {
      return;
    }

    client.to(`conversa_${data.chatId}`).emit('stop-typing', {
      userId: userInfo.userId,
      conversaId: data.chatId,
    });
  }

  @SubscribeMessage('message-read')
  async handleMessageRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string },
  ) {
    const userInfo = this.connectedUsers.get(client.id);
    
    if (!userInfo) {
      client.emit('error', { message: 'Usuário não autenticado' });
      return;
    }

    try {
      await this.messagesService.markAsRead(
        data.messageId,
        userInfo.userId,
        userInfo.empresaId,
      );

      // Notificar outros clientes que a mensagem foi lida
      client.broadcast.emit('message-read', {
        messageId: data.messageId,
        userId: userInfo.userId,
      });
    } catch (error) {
      console.error('Erro ao marcar mensagem como lida:', error);
      client.emit('error', { 
        message: error instanceof Error ? error.message : 'Erro ao marcar mensagem como lida' 
      });
    }
  }

  // Método para notificar sobre mudanças nas conversas
  notifyConversaUpdate(conversa: any, empresaId: string) {
    this.server.to(`empresa_${empresaId}`).emit('conversa-updated', conversa);
  }

  // Método para notificar sobre novas conversas
  notifyNewConversa(conversa: any, empresaId: string) {
    this.server.to(`empresa_${empresaId}`).emit('new-conversa', conversa);
  }
}
