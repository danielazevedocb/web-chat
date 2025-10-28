import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversas')
  getConversas(
    @Query('empresaId') empresaId: string,
    @Query('status') status?: string,
    @Query('prioridade') prioridade?: string,
    @Query('canal') canal?: string,
    @Query('search') search?: string,
  ) {
    const filters = { status, prioridade, canal, search };
    return this.chatService.findConversas(empresaId, filters);
  }

  @Get('conversas/:id')
  getConversa(@Param('id') id: string) {
    return this.chatService.findConversaById(id);
  }

  @Post('conversas')
  createConversa(@Body() data: any) {
    return this.chatService.createConversa(data);
  }

  @Put('conversas/:id/status')
  updateConversaStatus(
    @Param('id') id: string,
    @Body() data: { status: string },
    @Request() req: any,
  ) {
    return this.chatService.updateConversaStatus(id, data.status, req.user.id);
  }

  @Put('conversas/:id/prioridade')
  updateConversaPrioridade(
    @Param('id') id: string,
    @Body() data: { prioridade: 'BAIXA' | 'MEDIA' | 'ALTA' },
  ) {
    return this.chatService.updateConversaPrioridade(id, data.prioridade);
  }

  @Post('conversas/:id/tags')
  addTagsToConversa(@Param('id') id: string, @Body() data: { tags: string[] }) {
    return this.chatService.addTagsToConversa(id, data.tags);
  }

  @Delete('conversas/:id/tags/:tag')
  removeTagFromConversa(@Param('id') id: string, @Param('tag') tag: string) {
    return this.chatService.removeTagFromConversa(id, tag);
  }

  @Post('mensagens')
  createMensagem(@Body() data: any) {
    return this.chatService.createMensagem(data);
  }

  @Get('conversas/:id/mensagens')
  getMensagens(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.chatService.findMensagens(id, page || 1, limit || 50);
  }

  @Put('conversas/:id/mensagens/read')
  markMessagesAsRead(@Param('id') id: string, @Request() req: any) {
    return this.chatService.markMessagesAsRead(id, req.user.id);
  }

  @Post('conversas/:id/ia-response')
  generateIAResponse(
    @Param('id') id: string,
    @Body() data: { mensagem: string },
    @Request() req: any,
  ) {
    return this.chatService.generateIAResponse(
      req.user.empresaId,
      id,
      data.mensagem,
    );
  }

  @Get('metrics')
  getChatMetrics(@Request() req: any) {
    return this.chatService.getChatMetrics(req.user.empresaId);
  }
}
