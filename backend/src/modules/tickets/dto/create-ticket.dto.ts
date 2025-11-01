import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { StatusConversa, Prioridade } from '@prisma/client';

export class CreateTicketDto {
  @IsOptional()
  @IsString({ message: 'Título deve ser uma string' })
  titulo?: string;

  @IsOptional()
  @IsEnum(StatusConversa, {
    message: 'Status deve ser ABERTO, EM_ANDAMENTO, AGUARDANDO, RESOLVIDO ou FECHADO',
  })
  status?: StatusConversa;

  @IsOptional()
  @IsEnum(Prioridade, {
    message: 'Prioridade deve ser BAIXA, MEDIA, ALTA ou URGENTE',
  })
  prioridade?: Prioridade;

  @IsString({ message: 'Canal é obrigatório' })
  canal: string;

  @IsOptional()
  @IsString({ message: 'Identificador do canal deve ser uma string' })
  identificadorCanal?: string;

  @IsOptional()
  @IsInt({ message: 'SLA deve ser um número inteiro' })
  @Min(0, { message: 'SLA deve ser maior ou igual a 0' })
  sla?: number;

  @IsOptional()
  @IsInt({ message: 'Tempo de resposta deve ser um número inteiro' })
  @Min(0, { message: 'Tempo de resposta deve ser maior ou igual a 0' })
  tempoResposta?: number;

  @IsOptional()
  @IsInt({ message: 'Satisfação deve ser um número inteiro' })
  @Min(1, { message: 'Satisfação deve ser entre 1 e 5' })
  @Max(5, { message: 'Satisfação deve ser entre 1 e 5' })
  satisfacao?: number;

  @IsOptional()
  @IsString({ message: 'Observações devem ser uma string' })
  observacoes?: string;

  @IsOptional()
  @IsArray({ message: 'Tags devem ser um array' })
  @IsString({ each: true, message: 'Cada tag deve ser uma string' })
  tags?: string[];

  @IsString({ message: 'ID da empresa é obrigatório' })
  empresaId: string;

  @IsString({ message: 'ID do cliente é obrigatório' })
  clienteId: string;

  @IsOptional()
  @IsString({ message: 'ID do agente deve ser uma string' })
  agenteId?: string;
}

export class UpdateTicketDto {
  @IsOptional()
  @IsString({ message: 'Título deve ser uma string' })
  titulo?: string;

  @IsOptional()
  @IsEnum(StatusConversa, {
    message: 'Status deve ser ABERTO, EM_ANDAMENTO, AGUARDANDO, RESOLVIDO ou FECHADO',
  })
  status?: StatusConversa;

  @IsOptional()
  @IsEnum(Prioridade, {
    message: 'Prioridade deve ser BAIXA, MEDIA, ALTA ou URGENTE',
  })
  prioridade?: Prioridade;

  @IsOptional()
  @IsString({ message: 'Canal deve ser uma string' })
  canal?: string;

  @IsOptional()
  @IsString({ message: 'Identificador do canal deve ser uma string' })
  identificadorCanal?: string;

  @IsOptional()
  @IsInt({ message: 'SLA deve ser um número inteiro' })
  @Min(0, { message: 'SLA deve ser maior ou igual a 0' })
  sla?: number;

  @IsOptional()
  @IsInt({ message: 'Tempo de resposta deve ser um número inteiro' })
  @Min(0, { message: 'Tempo de resposta deve ser maior ou igual a 0' })
  tempoResposta?: number;

  @IsOptional()
  @IsInt({ message: 'Satisfação deve ser um número inteiro' })
  @Min(1, { message: 'Satisfação deve ser entre 1 e 5' })
  @Max(5, { message: 'Satisfação deve ser entre 1 e 5' })
  satisfacao?: number;

  @IsOptional()
  @IsString({ message: 'Observações devem ser uma string' })
  observacoes?: string;

  @IsOptional()
  @IsArray({ message: 'Tags devem ser um array' })
  @IsString({ each: true, message: 'Cada tag deve ser uma string' })
  tags?: string[];

  @IsOptional()
  @IsString({ message: 'ID do agente deve ser uma string' })
  agenteId?: string;
}

