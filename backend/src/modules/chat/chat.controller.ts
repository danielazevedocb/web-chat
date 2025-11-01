import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  findAll(@Query('search') search?: string, @Request() req: any) {
    const empresaId = req.user.empresaId;
    if (!empresaId) {
      throw new BadRequestException('EmpresaId não encontrado no token');
    }
    return this.chatService.findAll(req.user.id, empresaId, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    const empresaId = req.user.empresaId;
    if (!empresaId) {
      throw new BadRequestException('EmpresaId não encontrado no token');
    }
    return this.chatService.findOne(id, req.user.id, empresaId);
  }

  @Post()
  create(@Body() createChatDto: CreateChatDto, @Request() req: any) {
    const empresaId = req.user.empresaId;
    if (!empresaId) {
      throw new BadRequestException('EmpresaId não encontrado no token');
    }
    return this.chatService.create(req.user.id, createChatDto, empresaId);
  }

  @Get(':id/participants')
  getParticipants(@Param('id') id: string, @Request() req: any) {
    const empresaId = req.user.empresaId;
    if (!empresaId) {
      throw new BadRequestException('EmpresaId não encontrado no token');
    }
    return this.chatService.getParticipants(id, req.user.id, empresaId);
  }
}
