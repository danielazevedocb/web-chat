import { ConfigService } from '@nestjs/config';
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
import { ChatService } from './chat.service';

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

  constructor(
    private chatService: ChatService,
    private configService: ConfigService,
  ) {}

  handleConnection(client: Socket) {
    console.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('join_conversa')
  handleJoinConversa(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversaId: string },
  ) {
    client.join(`conversa_${data.conversaId}`);
    console.log(`Cliente ${client.id} entrou na conversa ${data.conversaId}`);
  }

  @SubscribeMessage('leave_conversa')
  handleLeaveConversa(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversaId: string },
  ) {
    client.leave(`conversa_${data.conversaId}`);
    console.log(`Cliente ${client.id} saiu da conversa ${data.conversaId}`);
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    try {
      const mensagem = await this.chatService.createMensagem(data);

      // Enviar mensagem para todos os clientes na conversa
      this.server
        .to(`conversa_${data.conversaId}`)
        .emit('message_received', mensagem);

      // Confirmar para o remetente
      client.emit('message_sent', mensagem);

      // Notificar sobre nova mensagem (para notificações)
      this.server.emit('new_message_notification', {
        conversaId: data.conversaId,
        mensagem: mensagem,
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      client.emit('error', { message: 'Erro ao enviar mensagem' });
    }
  }

  @SubscribeMessage('typing_start')
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversaId: string; usuarioId: string },
  ) {
    client.to(`conversa_${data.conversaId}`).emit('user_typing', {
      usuarioId: data.usuarioId,
      conversaId: data.conversaId,
    });
  }

  @SubscribeMessage('typing_stop')
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversaId: string; usuarioId: string },
  ) {
    client.to(`conversa_${data.conversaId}`).emit('user_stopped_typing', {
      usuarioId: data.usuarioId,
      conversaId: data.conversaId,
    });
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversaId: string; agenteId: string },
  ) {
    try {
      await this.chatService.markMessagesAsRead(data.conversaId, data.agenteId);

      // Notificar outros clientes que as mensagens foram lidas
      client.to(`conversa_${data.conversaId}`).emit('messages_read', {
        conversaId: data.conversaId,
        agenteId: data.agenteId,
      });
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error);
      client.emit('error', { message: 'Erro ao marcar mensagens como lidas' });
    }
  }

  @SubscribeMessage('update_conversa_status')
  async handleUpdateConversaStatus(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { conversaId: string; status: string; agenteId?: string },
  ) {
    try {
      const conversa = await this.chatService.updateConversaStatus(
        data.conversaId,
        data.status,
        data.agenteId,
      );

      // Notificar todos os clientes sobre a mudança de status
      this.server.emit('conversa_status_updated', {
        conversaId: data.conversaId,
        status: data.status,
        conversa: conversa,
      });
    } catch (error) {
      console.error('Erro ao atualizar status da conversa:', error);
      client.emit('error', { message: 'Erro ao atualizar status da conversa' });
    }
  }

  @SubscribeMessage('update_conversa_prioridade')
  async handleUpdateConversaPrioridade(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { conversaId: string; prioridade: 'BAIXA' | 'MEDIA' | 'ALTA' },
  ) {
    try {
      const conversa = await this.chatService.updateConversaPrioridade(
        data.conversaId,
        data.prioridade,
      );

      // Notificar todos os clientes sobre a mudança de prioridade
      this.server.emit('conversa_prioridade_updated', {
        conversaId: data.conversaId,
        prioridade: data.prioridade,
        conversa: conversa,
      });
    } catch (error) {
      console.error('Erro ao atualizar prioridade da conversa:', error);
      client.emit('error', {
        message: 'Erro ao atualizar prioridade da conversa',
      });
    }
  }

  @SubscribeMessage('generate_ia_response')
  async handleGenerateIAResponse(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { conversaId: string; mensagem: string; empresaId: string },
  ) {
    try {
      const mensagemIA = await this.chatService.generateIAResponse(
        data.empresaId,
        data.conversaId,
        data.mensagem,
      );

      // Enviar resposta da IA para todos os clientes na conversa
      this.server
        .to(`conversa_${data.conversaId}`)
        .emit('ia_response_received', mensagemIA);

      // Confirmar para o remetente
      client.emit('ia_response_generated', mensagemIA);
    } catch (error) {
      console.error('Erro ao gerar resposta da IA:', error);
      client.emit('error', { message: 'Erro ao gerar resposta da IA' });
    }
  }

  // Método para notificar sobre mudanças nas conversas
  notifyConversaUpdate(conversa: any) {
    this.server.emit('conversa_updated', conversa);
  }

  // Método para notificar sobre novas conversas
  notifyNewConversa(conversa: any) {
    this.server.emit('new_conversa', conversa);
  }
}
