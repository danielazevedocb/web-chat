import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateChatDto {
  @IsEmail()
  userEmail: string;

  @IsOptional()
  @IsString()
  initialMessage?: string;
}

