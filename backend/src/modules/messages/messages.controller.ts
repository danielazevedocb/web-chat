import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('chats/:chatId/messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  create(
    @Param('chatId') chatId: string,
    @Body() createMessageDto: CreateMessageDto,
    @Request() req: any,
  ) {
    return this.messagesService.create(req.user.id, {
      ...createMessageDto,
      chatId,
    });
  }

  @Get()
  findAll(
    @Param('chatId') chatId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Request() req: any,
  ) {
    return this.messagesService.findAll(
      chatId,
      req.user.id,
      cursor,
      limit ? parseInt(limit) : 50,
    );
  }

  @Put(':messageId/read')
  markAsRead(
    @Param('messageId') messageId: string,
    @Request() req: any,
  ) {
    return this.messagesService.markAsRead(messageId, req.user.id);
  }

  @Put('read')
  markChatAsRead(
    @Param('chatId') chatId: string,
    @Request() req: any,
  ) {
    return this.messagesService.markChatAsRead(chatId, req.user.id);
  }
}

