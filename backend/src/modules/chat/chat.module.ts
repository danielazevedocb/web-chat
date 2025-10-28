import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IAModule } from '../ia/ia.module';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
  imports: [IAModule, ConfigModule],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
