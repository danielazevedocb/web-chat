import { IsArray, IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateClienteDto {
  @IsString({ message: 'Nome é obrigatório' })
  nome: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Telefone deve ser uma string' })
  telefone?: string;

  @IsOptional()
  @IsString({ message: 'Avatar deve ser uma string' })
  avatar?: string;

  @IsOptional()
  @IsString({ message: 'Documento deve ser uma string' })
  documento?: string;

  @IsOptional()
  @IsString({ message: 'Endereço deve ser uma string' })
  endereco?: string;

  @IsOptional()
  @IsString({ message: 'Observações devem ser uma string' })
  observacoes?: string;

  @IsOptional()
  @IsArray({ message: 'Tags devem ser um array' })
  @IsString({ each: true, message: 'Cada tag deve ser uma string' })
  tags?: string[];

  @IsOptional()
  @IsBoolean({ message: 'Ativo deve ser um boolean' })
  ativo?: boolean;
}

export class UpdateClienteDto {
  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  nome?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Telefone deve ser uma string' })
  telefone?: string;

  @IsOptional()
  @IsString({ message: 'Avatar deve ser uma string' })
  avatar?: string;

  @IsOptional()
  @IsString({ message: 'Documento deve ser uma string' })
  documento?: string;

  @IsOptional()
  @IsString({ message: 'Endereço deve ser uma string' })
  endereco?: string;

  @IsOptional()
  @IsString({ message: 'Observações devem ser uma string' })
  observacoes?: string;

  @IsOptional()
  @IsArray({ message: 'Tags devem ser um array' })
  @IsString({ each: true, message: 'Cada tag deve ser uma string' })
  tags?: string[];

  @IsOptional()
  @IsBoolean({ message: 'Ativo deve ser um boolean' })
  ativo?: boolean;
}
