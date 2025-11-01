import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { StatusAgendamento } from '@prisma/client';

export class CreateAgendamentoDto {
  @IsString({ message: 'Título é obrigatório' })
  titulo: string;

  @IsOptional()
  @IsString({ message: 'Descrição deve ser uma string' })
  descricao?: string;

  @IsDateString({}, { message: 'Data e hora devem estar em formato ISO válido' })
  dataHora: string;

  @IsInt({ message: 'Duração deve ser um número inteiro' })
  @Min(1, { message: 'Duração deve ser maior que 0' })
  duracao: number;

  @IsOptional()
  @IsEnum(StatusAgendamento, {
    message:
      'Status deve ser AGENDADO, CONFIRMADO, EM_ANDAMENTO, CONCLUIDO, CANCELADO ou REAGENDADO',
  })
  status?: StatusAgendamento;

  @IsOptional()
  @IsString({ message: 'Tipo deve ser uma string' })
  tipo?: string;

  @IsString({ message: 'ID da empresa é obrigatório' })
  empresaId: string;

  @IsString({ message: 'ID do cliente é obrigatório' })
  clienteId: string;

  @IsOptional()
  @IsString({ message: 'ID do agente deve ser uma string' })
  agenteId?: string;
}

export class UpdateAgendamentoDto {
  @IsOptional()
  @IsString({ message: 'Título deve ser uma string' })
  titulo?: string;

  @IsOptional()
  @IsString({ message: 'Descrição deve ser uma string' })
  descricao?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Data e hora devem estar em formato ISO válido' })
  dataHora?: string;

  @IsOptional()
  @IsInt({ message: 'Duração deve ser um número inteiro' })
  @Min(1, { message: 'Duração deve ser maior que 0' })
  duracao?: number;

  @IsOptional()
  @IsEnum(StatusAgendamento, {
    message:
      'Status deve ser AGENDADO, CONFIRMADO, EM_ANDAMENTO, CONCLUIDO, CANCELADO ou REAGENDADO',
  })
  status?: StatusAgendamento;

  @IsOptional()
  @IsString({ message: 'Tipo deve ser uma string' })
  tipo?: string;

  @IsOptional()
  @IsString({ message: 'ID do cliente deve ser uma string' })
  clienteId?: string;

  @IsOptional()
  @IsString({ message: 'ID do agente deve ser uma string' })
  agenteId?: string;
}

