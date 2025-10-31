import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
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
    return this.chatService.findAll(req.user.id, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.chatService.findOne(id, req.user.id);
  }

  @Post()
  create(@Body() createChatDto: CreateChatDto, @Request() req: any) {
    return this.chatService.create(req.user.id, createChatDto);
  }

  @Get(':id/participants')
  getParticipants(@Param('id') id: string, @Request() req: any) {
    return this.chatService.getParticipants(id, req.user.id);
  }
}
