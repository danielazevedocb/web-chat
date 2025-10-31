import {
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { MessageType } from '@prisma/client';

export class CreateMessageDto {
  @IsString()
  chatId: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsEnum(MessageType)
  type: MessageType;

  @IsOptional()
  @IsUrl()
  fileUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  fileSize?: number;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsString()
  replyToId?: string;
}

