import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IAService {
  private openai: OpenAI;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async generateResponse(empresaId: string, mensagem: string, historico: any[]) {
    const config = await this.prisma.configuracaoIA.findUnique({
      where: { empresaId },
    });

    if (!config || !config.ativo) {
      throw new Error('Configuração de IA não encontrada ou inativa');
    }

    const prompt = this.buildPrompt(config.promptBase, historico, mensagem);

    const response = await this.openai.chat.completions.create({
      model: config.modelo,
      messages: [{ role: 'user', content: prompt }],
      temperature: config.temperatura,
      max_tokens: config.maxTokens,
    });

    return response.choices[0].message.content;
  }

  private buildPrompt(promptBase: string, historico: any[], mensagem: string): string {
    let prompt = promptBase + '\n\n';
    
    if (historico.length > 0) {
      prompt += 'Histórico da conversa:\n';
      historico.forEach(msg => {
        prompt += `${msg.remetente}: ${msg.conteudo}\n`;
      });
    }
    
    prompt += `\nMensagem atual do cliente: ${mensagem}\n\n`;
    prompt += 'Responda de forma educada e útil:';
    
    return prompt;
  }
}
