import { IsBoolean, IsEmail, IsNumber, IsObject, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateEmpresaDto {
  @IsString({ message: 'Nome é obrigatório' })
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  nome: string;

  @IsString({ message: 'Slug é obrigatório' })
  @MinLength(2, { message: 'Slug deve ter pelo menos 2 caracteres' })
  slug: string;

  @IsOptional()
  @IsString({ message: 'Descrição deve ser uma string' })
  descricao?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Telefone deve ser uma string' })
  telefone?: string;

  @IsOptional()
  @IsString({ message: 'Endereço deve ser uma string' })
  endereco?: string;

  @IsOptional()
  @IsString({ message: 'Logo deve ser uma string' })
  logo?: string;

  @IsOptional()
  @IsString({ message: 'Cor primária deve ser uma string' })
  corPrimaria?: string;

  @IsOptional()
  @IsString({ message: 'Cor secundária deve ser uma string' })
  corSecundaria?: string;

  @IsOptional()
  @IsString({ message: 'Plano deve ser uma string' })
  plano?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Limite de usuários deve ser um número' })
  limiteUsuarios?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Limite de conversas deve ser um número' })
  limiteConversas?: number;

  @IsOptional()
  @IsBoolean({ message: 'Ativo deve ser um boolean' })
  ativo?: boolean;

  @IsOptional()
  @IsObject({ message: 'Configuração deve ser um objeto' })
  configuracao?: any;
}

export class UpdateEmpresaDto {
  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  nome?: string;

  @IsOptional()
  @IsString({ message: 'Slug deve ser uma string' })
  @MinLength(2, { message: 'Slug deve ter pelo menos 2 caracteres' })
  slug?: string;

  @IsOptional()
  @IsString({ message: 'Descrição deve ser uma string' })
  descricao?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Telefone deve ser uma string' })
  telefone?: string;

  @IsOptional()
  @IsString({ message: 'Endereço deve ser uma string' })
  endereco?: string;

  @IsOptional()
  @IsString({ message: 'Logo deve ser uma string' })
  logo?: string;

  @IsOptional()
  @IsString({ message: 'Cor primária deve ser uma string' })
  corPrimaria?: string;

  @IsOptional()
  @IsString({ message: 'Cor secundária deve ser uma string' })
  corSecundaria?: string;

  @IsOptional()
  @IsString({ message: 'Plano deve ser uma string' })
  plano?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Limite de usuários deve ser um número' })
  limiteUsuarios?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Limite de conversas deve ser um número' })
  limiteConversas?: number;

  @IsOptional()
  @IsBoolean({ message: 'Ativo deve ser um boolean' })
  ativo?: boolean;

  @IsOptional()
  @IsObject({ message: 'Configuração deve ser um objeto' })
  configuracao?: any;
}
