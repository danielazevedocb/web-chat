import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { Role } from '../../../shared/types';

export class CreateUsuarioDto {
  @IsString({ message: 'Nome é obrigatório' })
  nome: string;

  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  email: string;

  @IsString({ message: 'Senha é obrigatória' })
  senha: string;

  @IsOptional()
  @IsString({ message: 'Telefone deve ser uma string' })
  telefone?: string;

  @IsOptional()
  @IsString({ message: 'Avatar deve ser uma string' })
  avatar?: string;

  @IsEnum(Role, { message: 'Role deve ser SUPER_ADMIN, ADMIN ou AGENTE' })
  role: Role;

  @IsOptional()
  @IsString({ message: 'EmpresaId deve ser uma string' })
  empresaId?: string;

  @IsOptional()
  @IsBoolean({ message: 'Ativo deve ser um boolean' })
  ativo?: boolean;
}

export class UpdateUsuarioDto {
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
  @IsEnum(Role, { message: 'Role deve ser SUPER_ADMIN, ADMIN ou AGENTE' })
  role?: Role;

  @IsOptional()
  @IsString({ message: 'EmpresaId deve ser uma string' })
  empresaId?: string;

  @IsOptional()
  @IsBoolean({ message: 'Ativo deve ser um boolean' })
  ativo?: boolean;
}
