import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IntegracoesService {
  constructor(private prisma: PrismaService) {}

  async processWebhook(data: any) {
    // Processar webhook do n8n
    console.log('Webhook recebido:', data);
    return { success: true };
  }

  async sendToWhatsApp(data: any) {
    // Enviar mensagem via WhatsApp
    console.log('Enviando para WhatsApp:', data);
    return { success: true };
  }

  async sendToTelegram(data: any) {
    // Enviar mensagem via Telegram
    console.log('Enviando para Telegram:', data);
    return { success: true };
  }
}
